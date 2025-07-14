'use client';

import { useState, useEffect, useRef } from 'react';
import { useRaceStore } from '@/store/race.store';
import { useTypingStats } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function TypingArea() {
  const {
    text,
    isRaceActive,
    startTime,
    updateTypingProgress,
    isPrivateRoom,
    isHost,
    players,
    countdown,
    startPrivateRace,
  } = useRaceStore();

  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastCompletedWordIndex, setLastCompletedWordIndex] = useState(0);
  const [currentWordStartIndex, setCurrentWordStartIndex] = useState(0);
  const [wordErrors, setWordErrors] = useState<Map<number, boolean>>(
    new Map()
  );
  const [wordSkipPositions, setWordSkipPositions] = useState<Map<number, number>>(
    new Map()
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { wpm, accuracy, calculateStats } = useTypingStats(
    text,
    currentIndex,
    startTime
  );

  useEffect(() => {
    if (isRaceActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRaceActive]);

  // Reset typing state on new text
  useEffect(() => {
    setUserInput('');
    setCurrentIndex(0);
    setLastCompletedWordIndex(0);
    setCurrentWordStartIndex(0);
    setWordErrors(new Map());
    setWordSkipPositions(new Map());
  }, [text]);

  // Report progress to store
  useEffect(() => {
    if (startTime) {
      const stats = calculateStats(userInput);
      updateTypingProgress(currentIndex, stats.wpm, stats.accuracy);
    }
  }, [
    userInput,
    currentIndex,
    startTime,
    calculateStats,
    updateTypingProgress,
  ]);

  // Helpers to find word boundaries
  const findWordStart = (idx: number) => {
    while (idx > 0 && text[idx - 1] !== ' ') idx--;
    return idx;
  };
  const findWordEnd = (idx: number) => {
    while (idx < text.length && text[idx] !== ' ') idx++;
    return idx;
  };
  const isAtBoundary = (idx: number) =>
    idx === 0 || text[idx - 1] === ' ';

  // Handle typing
  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (!isRaceActive) return;
    const value = e.target.value;
    const newIdx = value.length;
    if (newIdx > text.length) return;

    // track errors in current word
    const ws = findWordStart(newIdx);
    const we = findWordEnd(ws);
    const typed = value.slice(ws, Math.min(newIdx, we));
    const actual = text.slice(ws, we);
    const errs = new Map(wordErrors);
    if (typed.length > 0) {
      errs.set(ws, !actual.startsWith(typed));
      setWordErrors(errs);
    }

    // word completion
    if (newIdx > currentIndex && newIdx <= text.length) {
      const ch = text[newIdx - 1];
      if (ch === ' ' || newIdx === text.length) {
        const start = findWordStart(newIdx - 1);
        const end = ch === ' ' ? newIdx - 1 : newIdx;
        const inText = text.slice(start, end);
        const inTyped = value.slice(start, end);
        if (inText === inTyped) {
          setLastCompletedWordIndex(newIdx);
        }
        if (newIdx < text.length) {
          setCurrentWordStartIndex(newIdx);
        }
      }
    }

    // update word start on forward
    if (newIdx > currentIndex) {
      const nStart = findWordStart(newIdx);
      if (nStart !== currentWordStartIndex && isAtBoundary(newIdx)) {
        setCurrentWordStartIndex(nStart);
      }
    }

    setUserInput(value);
    setCurrentIndex(newIdx);
  };

  // MonkeyType-style space jump & key blocks
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (!isRaceActive) return;

    if (e.key === ' ') {
      const ws = findWordStart(currentIndex);
      const we = findWordEnd(ws);
      if (currentIndex < we) {
        e.preventDefault();
        let jump = we;
        if (jump < text.length && text[jump] === ' ') jump++;
        const remLen = we - currentIndex;
        const spaceChar = text[we] === ' ' ? ' ' : '';
        const newVal =
          userInput + ' '.repeat(remLen) + spaceChar;
        setUserInput(newVal);
        setCurrentIndex(jump);
        setCurrentWordStartIndex(jump);
        
        // Store the skip position for backspace logic
        const newSkipPositions = new Map(wordSkipPositions);
        newSkipPositions.set(ws, currentIndex);
        setWordSkipPositions(newSkipPositions);
        
        const errs = new Map(wordErrors);
        errs.set(ws, true);
        setWordErrors(errs);
        return;
      }
    }

    // BACKSPACE smart undo skip - go back to previous word if at word start
    if (e.key === 'Backspace') {
      if (currentIndex === currentWordStartIndex && currentWordStartIndex > 0) {
        // Find the previous word start
        let prevWordEnd = currentWordStartIndex - 1;
        while (prevWordEnd > 0 && text[prevWordEnd] === ' ') {
          prevWordEnd--;
        }
        const prevWordStart = findWordStart(prevWordEnd);
        
        // Check if the previous word was skipped (has a skip position)
        const skipPos = wordSkipPositions.get(prevWordStart);
        if (skipPos !== undefined) {
          e.preventDefault();
          
          // Go back to the exact position where the user skipped from
          setCurrentIndex(skipPos);
          setCurrentWordStartIndex(prevWordStart);
          setUserInput(userInput.slice(0, skipPos));
          
          // Clear the skip position and error state for the word we're going back to
          const newSkipPositions = new Map(wordSkipPositions);
          newSkipPositions.delete(prevWordStart);
          setWordSkipPositions(newSkipPositions);
          
          const errs = new Map(wordErrors);
          errs.delete(prevWordStart);
          setWordErrors(errs);
          return;
        }
      }
    }

    if (
      [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
        'PageUp',
        'PageDown',
        'Tab',
      ].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      e.preventDefault();
    }
  };

  // Render each character with color & highlights
  const renderText = () =>
    text.split('').map((char, idx) => {
      let base = 'untyped-char';
      if (idx < userInput.length) {
        base =
          userInput[idx] === char
            ? 'correct-char'
            : 'incorrect-char';
      } else if (idx === currentIndex && isRaceActive) {
        base = 'current-char';
      }

      const ws = findWordStart(idx);
      const we = findWordEnd(ws);
      const inCurrent =
        idx >= currentWordStartIndex && idx < we;
      const typedSoFar = userInput.slice(
        ws,
        Math.min(userInput.length, we)
      );
      const actual = text.slice(ws, we);
      const hasError =
        typedSoFar.length > 0 &&
        !actual.startsWith(typedSoFar);
      const completed = idx < lastCompletedWordIndex;
      const correctCompleted =
        completed &&
        text.slice(ws, we) === userInput.slice(ws, we);

      return (
        <span
          key={idx}
          className={cn(
            base,
            inCurrent &&
              idx >= currentIndex &&
              '',
            correctCompleted && 'opacity-60',
            hasError &&
              idx < userInput.length &&
              ''
          )}
        >
          {char}
        </span>
      );
    });

  if (!text) {
    return (
      <Card>
        <CardContent className="text-center text-black">
          Waiting for race to load...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Text Display */}
        <div
          className={cn(
            'p-6 font-mono text-lg leading-relaxed whitespace-pre-wrap break-words',
            !isRaceActive && 'opacity-60'
          )}
        >
          {renderText()}
          {isRaceActive && currentIndex === text.length && (
            <span className="animate-pulse">|</span>
          )}
        </div>

        {/* Host Start Button */}
        {isPrivateRoom &&
          isHost &&
          !isRaceActive &&
          countdown === 0 && (
            <div className="text-center space-y-2">
              <Button
                onClick={startPrivateRace}
                disabled={players.length < 2}
                className={cn(
                  'px-8 py-3 font-semibold text-white',
                  players.length >= 2
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                )}
              >
                {players.length < 2
                  ? 'Waiting for more players...'
                  : 'Start Race'}
              </Button>
              <p className="text-sm text-black">
                {players.length < 2
                  ? `Need at least 2 players (${players.length}/2)`
                  : 'Click to start the race'}
              </p>
            </div>
          )}

        {/* Waiting for Host */}
        {isPrivateRoom &&
          !isHost &&
          !isRaceActive &&
          countdown === 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                Waiting for host to start the race...
              </p>
              <p className="mt-1 text-sm text-black">
                {players.length}/2+ players ready
              </p>
            </div>
          )}

        {/* Countdown */}
        {countdown > 0 && (
          <div className="text-center space-y-1">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
              {countdown}
            </div>
            <p className="text-black">
              Race starting...
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className="relative">
          <Textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={!isRaceActive}
            placeholder={
              isRaceActive
                ? 'Start typing...'
                : 'Race will start soon...'
            }
            className="font-mono text-lg resize-none"
            rows={4}
          />
          {isRaceActive && (
            <div className="absolute bottom-2 right-3 text-sm text-black">
              {currentIndex}/{text.length}
            </div>
          )}
        </div>

        {/* Live Stats */}
        {isRaceActive && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {wpm}
              </div>
              <div className="text-sm text-black">
                WPM
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {accuracy}%
              </div>
              <div className="text-sm text-black">
                Accuracy
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {isRaceActive && (
          <p className="text-center text-xs text-black">
            💡 Press space to jump to the next word. Backspace freely to fix errors.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
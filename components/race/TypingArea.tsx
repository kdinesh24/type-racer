'use client';

import { useState, useEffect, useRef } from 'react';
import { useRaceStore } from '@/store/race.store';
import { useTypingStats } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';

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
    startPrivateRace 
  } = useRaceStore();

  // Debug logging only when significant values change
  useEffect(() => {
    console.log('🎮 TypingArea - Host status changed:', {
      isPrivateRoom,
      isHost,
      playersLength: players.length,
      isRaceActive,
      countdown,
      shouldShowStartButton: isPrivateRoom && isHost && !isRaceActive && countdown === 0
    });
  }, [isPrivateRoom, isHost, players.length, isRaceActive, countdown]);

  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastCompletedWordIndex, setLastCompletedWordIndex] = useState(0);
  const [currentWordStartIndex, setCurrentWordStartIndex] = useState(0);
  const [wordErrors, setWordErrors] = useState<Map<number, boolean>>(new Map()); // Track which words have errors
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { wpm, accuracy, calculateStats } = useTypingStats(text, currentIndex, startTime);

  useEffect(() => {
    if (isRaceActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRaceActive]);

  // Reset typing state when text changes (new race or restart)
  useEffect(() => {
    setUserInput('');
    setCurrentIndex(0);
    setLastCompletedWordIndex(0);
    setCurrentWordStartIndex(0);
    setWordErrors(new Map());
  }, [text]);

  useEffect(() => {
    if (startTime) {
      const stats = calculateStats(userInput);
      updateTypingProgress(currentIndex, stats.wpm, stats.accuracy);
    }
  }, [userInput, currentIndex, startTime, calculateStats, updateTypingProgress]);

  // Find word boundaries in the text
  const findWordStart = (index: number): number => {
    while (index > 0 && text[index - 1] !== ' ') {
      index--;
    }
    return index;
  };

  const findWordEnd = (index: number): number => {
    while (index < text.length && text[index] !== ' ') {
      index++;
    }
    return index;
  };

  const isAtWordBoundary = (index: number): boolean => {
    return index === 0 || text[index - 1] === ' ';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isRaceActive) return;

    const value = e.target.value;
    const newIndex = value.length;

    // Prevent typing beyond the text length
    if (newIndex > text.length) return;

    // NO BACKSPACE BLOCKING - Allow free backspacing anywhere

    // UPDATE ERROR TRACKING for current word
    const currentWordStart = findWordStart(newIndex);
    const currentWordEnd = findWordEnd(currentWordStart);
    const currentWordInText = text.slice(currentWordStart, currentWordEnd);
    const currentWordTyped = value.slice(currentWordStart, Math.min(newIndex, currentWordEnd));
    
    const newWordErrors = new Map(wordErrors);
    if (currentWordTyped.length > 0) {
      const hasErrors = !currentWordInText.startsWith(currentWordTyped);
      newWordErrors.set(currentWordStart, hasErrors);
    }
    setWordErrors(newWordErrors);

    // TRACK WORD COMPLETION when reaching spaces or end
    if (newIndex > currentIndex && newIndex <= text.length) {
      const char = text[newIndex - 1];
      if (char === ' ' || newIndex === text.length) {
        const wordStart = findWordStart(newIndex - 1);
        const wordEnd = char === ' ' ? newIndex - 1 : newIndex;
        const wordInText = text.slice(wordStart, wordEnd);
        const wordTyped = value.slice(wordStart, wordEnd);
        
        if (wordInText === wordTyped) {
          setLastCompletedWordIndex(newIndex);
        }
        
        if (newIndex < text.length) {
          setCurrentWordStartIndex(newIndex);
        }
      }
    }

    // UPDATE CURRENT WORD START when moving forward
    if (newIndex > currentIndex) {
      const newWordStart = findWordStart(newIndex);
      if (newWordStart !== currentWordStartIndex && isAtWordBoundary(newIndex)) {
        setCurrentWordStartIndex(newWordStart);
      }
    }

    // APPLY CHANGES
    setUserInput(value);
    setCurrentIndex(newIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isRaceActive) return;

    // SPACE KEY - Jump to next word like MonkeyType
    if (e.key === ' ') {
      console.log('SPACE pressed, currentIndex:', currentIndex);
      const currentWordStart = findWordStart(currentIndex);
      const currentWordEnd = findWordEnd(currentWordStart);
      console.log('Word boundaries:', { currentWordStart, currentWordEnd });
      
      // If we're in the middle of a word (not at word boundary), jump to next word
      if (currentIndex < currentWordEnd) {
        console.log('🚀 JUMPING TO NEXT WORD WITH ERRORS!');
        e.preventDefault(); // Stop the space from being typed
        
        // Find the next word start (after the space)
        let jumpIndex = currentWordEnd;
        // Skip the space character to get to next word
        if (jumpIndex < text.length && text[jumpIndex] === ' ') {
          jumpIndex++; // Move past the space
        }
        
        // Make sure we don't go beyond text length
        if (jumpIndex <= text.length) {
          // Create input with the partially typed word + remaining chars as spaces + space
          // This will mark the untyped part as errors (incorrect chars)
          const remainingWord = text.slice(currentIndex, currentWordEnd);
          const spaceChar = text[currentWordEnd] === ' ' ? ' ' : '';
          
          // Fill the remaining characters with incorrect chars (spaces) to show as errors
          const newInputValue = userInput + ' '.repeat(remainingWord.length) + spaceChar;
          
          console.log('Setting new input with errors:', newInputValue, 'jumpIndex:', jumpIndex);
          
          // Update all state
          setUserInput(newInputValue);
          setCurrentIndex(jumpIndex);
          setCurrentWordStartIndex(jumpIndex);
          
          // Mark the skipped word as having errors (since it was incomplete)
          const newWordErrors = new Map(wordErrors);
          newWordErrors.set(currentWordStart, true);
          setWordErrors(newWordErrors);
        }
        
        return; // Don't process any other logic
      } else {
        console.log('At word boundary, allowing normal space');
      }
      // If at word boundary, allow normal space typing (don't prevent default)
    }

    // Prevent arrow keys and other navigation keys
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
        e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'Home' || e.key === 'End' ||
        e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      return;
    }

    // Prevent Ctrl+A, Ctrl+V, Ctrl+C, etc.
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'a' || e.key === 'v' || e.key === 'c' || e.key === 'x' || e.key === 'z') {
        e.preventDefault();
        return;
      }
    }

    // Handle Tab key - prevent default
    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'untyped-char';
      
      if (index < userInput.length) {
        className = userInput[index] === char ? 'correct-char' : 'incorrect-char';
      } else if (index === currentIndex && isRaceActive) {
        className = 'current-char';
      }

      // Add special styling for word boundaries and error indication
      const charWordStart = findWordStart(index);
      const charWordEnd = findWordEnd(charWordStart);
      const isCurrentWord = index >= currentWordStartIndex && index < findWordEnd(currentWordStartIndex);
      
      // Check if this word has errors (real-time)
      const wordTypedSoFar = userInput.slice(charWordStart, Math.min(userInput.length, charWordEnd));
      const wordInText = text.slice(charWordStart, charWordEnd);
      const wordHasError = wordTypedSoFar.length > 0 && !wordInText.startsWith(wordTypedSoFar);
      
      // Check if word is completed correctly
      const isWordCompleted = index < lastCompletedWordIndex;
      const isWordCorrectlyCompleted = isWordCompleted && 
        text.slice(charWordStart, charWordEnd) === userInput.slice(charWordStart, charWordEnd);
      
      return (
        <span 
          key={index} 
          className={cn(
            className,
            isCurrentWord && index >= currentIndex && 'bg-blue-50 dark:bg-blue-900/20',
            isWordCorrectlyCompleted && 'opacity-60',
            wordHasError && index < userInput.length && 'bg-red-50 dark:bg-red-900/20'
          )}
        >
          {char}
        </span>
      );
    });
  };

  if (!text) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Waiting for race to load...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div 
          className={cn(
            "typing-text p-6 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-32 leading-relaxed",
            !isRaceActive && "opacity-60"
          )}
        >
          {renderText()}
          {isRaceActive && currentIndex === text.length && (
            <span className="typing-cursor">|</span>
          )}
        </div>
      </div>

      {/* Private Room Host Controls */}
      {isPrivateRoom && isHost && !isRaceActive && countdown === 0 && (
        <div className="mb-6 text-center">
          <button
            onClick={startPrivateRace}
            disabled={players.length < 2}
            className={cn(
              "px-8 py-3 rounded-lg font-semibold text-white transition-colors",
              players.length >= 2
                ? "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                : "bg-gray-400 cursor-not-allowed"
            )}
          >
            {players.length < 2 ? 'Waiting for more players...' : 'Start Race'}
          </button>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {players.length < 2 
              ? `Need at least 2 players to start (${players.length}/2)`
              : 'Click to start the race for all players'
            }
          </p>
        </div>
      )}

      {/* Waiting message for non-host players in private rooms */}
      {isPrivateRoom && !isHost && !isRaceActive && countdown === 0 && (
        <div className="mb-6 text-center">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              Waiting for host to start the race...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {players.length}/2+ players ready
            </p>
          </div>
        </div>
      )}

      {/* Countdown display */}
      {countdown > 0 && (
        <div className="mb-6 text-center">
          <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
            {countdown}
          </div>
          <p className="text-gray-500 dark:text-gray-400">Race starting...</p>
        </div>
      )}

      <div className="relative">
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={!isRaceActive}
          placeholder={isRaceActive ? "Start typing..." : "Race will start soon..."}
          className={cn(
            "w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none",
            "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
            "placeholder-gray-500 dark:placeholder-gray-400",
            "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            !isRaceActive && "cursor-not-allowed opacity-60"
          )}
          rows={4}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        
        {isRaceActive && (
          <div className="absolute bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400">
            {currentIndex}/{text.length}
          </div>
        )}
      </div>

      {isRaceActive && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {wpm}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">WPM</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {accuracy}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
          </div>
        </div>
      )}
      
      {/* Help text for typing rules */}
      {isRaceActive && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Press space to jump to the next word. Backspace freely to fix any errors.
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiZap, FiTarget, FiClock, FiRefreshCw } from 'react-icons/fi';
import { TypingPerformanceTracker } from '@/lib/performance';
import { getRandomParagraph } from '@/lib/paragraphs';
import { cn } from '@/lib/utils';

interface PracticeModeProps {
  onExit: () => void;
}

// Word state tracking for MonkeyType-style behavior
interface WordState {
  index: number;
  startPos: number;
  endPos: number;
  isCompleted: boolean;
  inputText: string;
  skipPosition?: number; // Position where user pressed space to skip
}

export default function PracticeMode({ onExit }: PracticeModeProps) {
  const [text, setText] = useState(() => getRandomParagraph());
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordStates, setWordStates] = useState<WordState[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [tracker] = useState(() => new TypingPerformanceTracker());
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, consistency: 100 });
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const progress = text.length > 0 ? (currentIndex / text.length) * 100 : 0;
  const isCompleted = currentIndex === text.length;

  // Initialize word states when text changes
  useEffect(() => {
    const words: WordState[] = [];
    let pos = 0;
    let wordIndex = 0;
    
    // Split text into words, keeping track of positions
    const textParts = text.split(' ');
    for (let i = 0; i < textParts.length; i++) {
      const word = textParts[i];
      const startPos = pos;
      const endPos = pos + word.length;
      
      words.push({
        index: wordIndex,
        startPos,
        endPos,
        isCompleted: false,
        inputText: ''
      });
      
      pos = endPos;
      wordIndex++;
      
      // Add space if not the last word
      if (i < textParts.length - 1) {
        pos++; // Account for space
      }
    }
    
    setWordStates(words);
    setCurrentWordIndex(0);
    setCurrentIndex(0);
    setUserInput('');
  }, [text]);

  // Helper functions for word boundaries
  const getCurrentWord = (): WordState | null => {
    return wordStates[currentWordIndex] || null;
  };

  const getWordAtPosition = (position: number): WordState | null => {
    return wordStates.find(word => position >= word.startPos && position <= word.endPos) || null;
  };

  const getCharacterTypeAtPosition = (position: number): 'correct' | 'incorrect' | 'extra' | 'pending' => {
    if (position >= userInput.length) return 'pending';
    
    const userChar = userInput[position];
    const textChar = text[position];
    
    if (position >= text.length) return 'extra';
    return userChar === textChar ? 'correct' : 'incorrect';
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        const metrics = tracker.getMetrics();
        setStats({
          wpm: metrics.wpm,
          accuracy: metrics.accuracy,
          consistency: metrics.consistency
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, tracker]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const newIndex = value.length;

    if (newIndex > text.length) return;

    if (!isActive && value.length > 0) {
      setIsActive(true);
      tracker.reset();
    }

    // Track keystroke if it's a new character
    if (newIndex > userInput.length && newIndex <= text.length) {
      const char = text[newIndex - 1];
      const inputChar = value[newIndex - 1];
      tracker.recordKeystroke(inputChar === char, false);
    }

    // Update current word index based on position
    const currentWord = getWordAtPosition(newIndex);
    if (currentWord && currentWord.index !== currentWordIndex) {
      setCurrentWordIndex(currentWord.index);
    }

    // Update word states with current input
    setWordStates(prevStates => {
      const newStates = [...prevStates];
      const wordAtPos = getWordAtPosition(newIndex - 1);
      
      if (wordAtPos) {
        const wordInput = value.slice(wordAtPos.startPos, Math.min(newIndex, wordAtPos.endPos + 1));
        newStates[wordAtPos.index] = {
          ...newStates[wordAtPos.index],
          inputText: wordInput
        };
      }
      
      return newStates;
    });

    setUserInput(value);
    setCurrentIndex(newIndex);

    // Check if completed
    if (newIndex === text.length) {
      setIsActive(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // SPACE KEY - MonkeyType-style word jumping
    if (e.key === ' ') {
      const currentWord = getCurrentWord();
      if (!currentWord) return;

      // If we're in the middle of a word, skip to next word
      if (currentIndex < currentWord.endPos) {
        e.preventDefault();
        
        // Mark remaining characters in word as incorrect
        const remainingChars = currentWord.endPos - currentIndex;
        for (let i = 0; i < remainingChars; i++) {
          tracker.recordKeystroke(false, false);
        }
        
        // Update word state with skip position
        setWordStates(prevStates => {
          const newStates = [...prevStates];
          newStates[currentWord.index] = {
            ...newStates[currentWord.index],
            skipPosition: currentIndex,
            isCompleted: true
          };
          return newStates;
        });

        // Jump to next word
        const nextWordIndex = currentWord.index + 1;
        if (nextWordIndex < wordStates.length) {
          const nextWord = wordStates[nextWordIndex];
          let jumpIndex = nextWord.startPos;
          
          // If there's a space between words, include it
          if (currentWord.endPos < nextWord.startPos) {
            jumpIndex = nextWord.startPos;
          }
          
          // Create input with spaces filling the gap to maintain text alignment
          const spacesToAdd = jumpIndex - currentIndex;
          const newInput = userInput + ' '.repeat(spacesToAdd);
          
          setUserInput(newInput);
          setCurrentIndex(jumpIndex);
          setCurrentWordIndex(nextWordIndex);
        }
        return;
      }
    }

    // BACKSPACE KEY - Smart backspace with word boundary awareness
    if (e.key === 'Backspace') {
      const currentWord = getCurrentWord();
      if (!currentWord) return;

      // If at the start of a word and the previous word has a skip position, jump back
      if (currentIndex === currentWord.startPos && currentWord.index > 0) {
        const prevWord = wordStates[currentWord.index - 1];
        if (prevWord && prevWord.skipPosition !== undefined) {
          e.preventDefault();
          
          // Jump back to the skip position in the previous word
          setCurrentIndex(prevWord.skipPosition);
          setCurrentWordIndex(prevWord.index);
          
          // Remove the skip position and mark word as not completed
          setWordStates(prevStates => {
            const newStates = [...prevStates];
            newStates[prevWord.index] = {
              ...newStates[prevWord.index],
              skipPosition: undefined,
              isCompleted: false
            };
            return newStates;
          });
          
          // Update input to match the new position
          const newInput = userInput.slice(0, prevWord.skipPosition);
          setUserInput(newInput);
          return;
        }
      }
    }

    // Prevent navigation keys
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
        e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'Home' || e.key === 'End' ||
        e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      return;
    }

    // Prevent copy/paste operations
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'a' || e.key === 'v' || e.key === 'c' || e.key === 'x' || e.key === 'z') {
        e.preventDefault();
        return;
      }
    }

    // Prevent Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }
  };

  const handleRestart = () => {
    setUserInput('');
    setCurrentIndex(0);
    setCurrentWordIndex(0);
    setIsActive(false);
    setTimeElapsed(0);
    tracker.reset();
    setStats({ wpm: 0, accuracy: 100, consistency: 100 });
    
    // Reset all word states
    setWordStates(prevStates => 
      prevStates.map(word => ({
        ...word,
        isCompleted: false,
        inputText: '',
        skipPosition: undefined
      }))
    );
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleNewParagraph = () => {
    setText(getRandomParagraph());
    setUserInput('');
    setCurrentIndex(0);
    setCurrentWordIndex(0);
    setIsActive(false);
    setTimeElapsed(0);
    tracker.reset();
    setStats({ wpm: 0, accuracy: 100, consistency: 100 });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      const charType = getCharacterTypeAtPosition(index);
      let className = 'text-gray-500 dark:text-gray-500';
      
      if (charType === 'correct') {
        className = 'correct-char';
      } else if (charType === 'incorrect') {
        className = 'incorrect-char';
      } else if (index === currentIndex && isActive) {
        className = 'current-char';
      }

      // Determine if this character is in the current word
      const currentWord = getCurrentWord();
      const isInCurrentWord = currentWord && index >= currentWord.startPos && index < currentWord.endPos;
      
      // Determine if this character is in a completed word
      const wordAtIndex = getWordAtPosition(index);
      const isInCompletedWord = wordAtIndex && wordAtIndex.isCompleted;

      return (
        <span 
          key={index} 
          className={cn(
            className,
            'transition-colors duration-150',
            isInCurrentWord && index >= currentIndex && 'bg-blue-50 dark:bg-blue-900/20',
            isInCompletedWord && 'opacity-60'
          )}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-black rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">Practice Mode</h1>
              <p className="text-gray-600 dark:text-gray-400">Improve your typing skills</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleNewParagraph}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <FiTarget className="w-4 h-4" />
              New Text
            </button>
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg transition-colors hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              <FiRefreshCw className="w-4 h-4" />
              Restart
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-sm font-medium text-black dark:text-white">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
          <div 
            className="bg-black dark:bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 text-center border border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-2">
            <FiZap className="w-5 h-5 text-black dark:text-white" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white">{stats.wpm}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">WPM</div>
        </div>
        
        <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 text-center border border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-2">
            <FiTarget className="w-5 h-5 text-black dark:text-white" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white">{stats.accuracy}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
        </div>
        
        <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 text-center border border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-2">
            <FiZap className="w-5 h-5 text-black dark:text-white" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white">{stats.consistency}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Consistency</div>
        </div>
        
        <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 text-center border border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-2">
            <FiClock className="w-5 h-5 text-black dark:text-white" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white">{timeElapsed}s</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
        </div>
      </div>

      {/* Main Typing Area */}
      <div className="bg-white dark:bg-black rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800">
        <div className="mb-6">
          <div 
            className={cn(
              "p-6 bg-gray-100 dark:bg-gray-900 rounded-lg min-h-32 leading-relaxed text-lg font-mono",
              !isActive && currentIndex === 0 && "opacity-60"
            )}
          >
            {renderText()}
            {isActive && currentIndex === text.length && (
              <span className="animate-pulse text-black dark:text-white">|</span>
            )}
          </div>
        </div>

        <div className="relative">
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isCompleted}
            placeholder="Start typing to begin practice..."
            className={cn(
              "w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg resize-none",
              "bg-white dark:bg-black text-black dark:text-white",
              "placeholder-gray-500 dark:placeholder-gray-500",
              "focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent",
              "text-lg font-mono",
              isCompleted && "cursor-not-allowed opacity-60"
            )}
            rows={4}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
          
          <div className="absolute bottom-4 right-4 text-sm text-gray-500 dark:text-gray-500">
            {currentIndex} / {text.length}
          </div>
        </div>

        {isCompleted && (
          <div className="mt-6 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTarget className="w-8 h-8 text-black dark:text-white" />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">
              Practice Complete!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Great job! Your typing skills are improving.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleNewParagraph}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                New Text
              </button>
              <button
                onClick={handleRestart}
                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg transition-colors hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                Practice Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

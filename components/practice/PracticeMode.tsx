'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Target,
  Zap,
  Clock,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TypingPerformanceTracker } from "@/lib/performance";
import { getRandomParagraph } from "@/lib/paragraphs";

interface PracticeModeProps {
  onExit?: () => void;
}

interface WordState {
  index: number;
  startPos: number;
  endPos: number;
  isCompleted: boolean;
  inputText: string;
  skipPosition?: number;
}

export default function PracticeMode({ onExit }: PracticeModeProps) {
  const router = useRouter();
  const [text, setText] = useState(() => getRandomParagraph());
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordStates, setWordStates] = useState<WordState[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [tracker] = useState(() => new TypingPerformanceTracker());
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    consistency: 100,
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const progress = text.length
    ? (currentIndex / text.length) * 100
    : 0;
  const isCompleted = currentIndex === text.length;

  // initialize word boundaries
  useEffect(() => {
    const words: WordState[] = [];
    let pos = 0;
    text.split(" ").forEach((word, idx) => {
      const startPos = pos;
      const endPos = pos + word.length;
      words.push({
        index: idx,
        startPos,
        endPos,
        isCompleted: false,
        inputText: "",
      });
      pos = endPos + 1; // account for space
    });
    setWordStates(words);
    setCurrentWordIndex(0);
    setCurrentIndex(0);
    setUserInput("");
  }, [text]);

  const getWordAtPos = (pos: number): WordState | null =>
    wordStates.find(
      (w) => pos >= w.startPos && pos <= w.endPos
    ) || null;

  const getCharType = (
    pos: number
  ): "correct" | "incorrect" | "extra" | "pending" => {
    if (pos >= userInput.length) return "pending";
    if (pos >= text.length) return "extra";
    return userInput[pos] === text[pos] ? "correct" : "incorrect";
  };

  // autofocus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // timer & stats
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed((t) => t + 1);
        const m = tracker.getMetrics();
        setStats({
          wpm: m.wpm,
          accuracy: m.accuracy,
          consistency: m.consistency,
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isActive, tracker]);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const val = e.target.value;
    const newIdx = val.length;
    if (newIdx > text.length) return;

    if (!isActive && newIdx > 0) {
      setIsActive(true);
      tracker.reset();
    }

    if (
      newIdx > userInput.length &&
      newIdx <= text.length
    ) {
      const correct = val[newIdx - 1] === text[newIdx - 1];
      tracker.recordKeystroke(correct, false);
    }

    const w = getWordAtPos(newIdx);
    if (w && w.index !== currentWordIndex) {
      setCurrentWordIndex(w.index);
    }

    setWordStates((prev) => {
      const ps = [...prev];
      const cur = getWordAtPos(newIdx - 1);
      if (cur) {
        ps[cur.index] = {
          ...ps[cur.index],
          inputText: val.slice(
            cur.startPos,
            Math.min(newIdx, cur.endPos + 1)
          ),
        };
      }
      return ps;
    });

    setUserInput(val);
    setCurrentIndex(newIdx);
    if (newIdx === text.length) {
      setIsActive(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    const curWord = wordStates[currentWordIndex];

    // SPACE to skip current word
    if (e.key === " " && curWord) {
      if (currentIndex < curWord.endPos) {
        e.preventDefault();
        const rem = curWord.endPos - currentIndex;
        for (let i = 0; i < rem; i++) {
          tracker.recordKeystroke(false, false);
        }
        setWordStates((prev) => {
          const ps = [...prev];
          ps[curWord.index] = {
            ...ps[curWord.index],
            skipPosition: currentIndex,
            isCompleted: true,
          };
          return ps;
        });
        const next = wordStates[curWord.index + 1];
        if (next) {
          const jump = next.startPos;
          const spaces = jump - currentIndex;
          setUserInput((u) => u + " ".repeat(spaces));
          setCurrentIndex(jump);
          setCurrentWordIndex(next.index);
        }
      }
      return;
    }

    // BACKSPACE smart undo skip
    if (e.key === "Backspace" && curWord) {
      if (
        currentIndex === curWord.startPos &&
        curWord.index > 0
      ) {
        const prev = wordStates[curWord.index - 1];
        if (prev.skipPosition !== undefined) {
          e.preventDefault();
          setCurrentIndex(prev.skipPosition);
          setCurrentWordIndex(prev.index);
          setWordStates((ps) =>
            ps.map((w) =>
              w.index === prev.index
                ? {
                    ...w,
                    skipPosition: undefined,
                    isCompleted: false,
                  }
                : w
            )
          );
          setUserInput((u) =>
            u.slice(0, prev.skipPosition!)
          );
        }
      }
      return;
    }

    // block navigation & clipboard
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "PageUp",
        "PageDown",
        "Tab",
      ].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      e.preventDefault();
    }
  };

  const handleRestart = () => {
    setUserInput("");
    setCurrentIndex(0);
    setCurrentWordIndex(0);
    setIsActive(false);
    setTimeElapsed(0);
    tracker.reset();
    setStats({ wpm: 0, accuracy: 100, consistency: 100 });
    setWordStates((ps) =>
      ps.map((w) => ({
        ...w,
        isCompleted: false,
        inputText: "",
        skipPosition: undefined,
      }))
    );
    inputRef.current?.focus();
  };

  const handleNew = () => {
    setText(getRandomParagraph());
    handleRestart();
  };

  const renderText = () =>
    text.split("").map((char, idx) => {
      const type = getCharType(idx);
      const className = cn(
        type === "correct" && "text-green-600",
        type === "incorrect" && "text-red-600",
        idx === currentIndex && isActive && "underline"
      );
      return (
        <span key={idx} className={className}>
          {char}
        </span>
      );
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onExit || (() => router.push('/'))}>
              <ArrowLeft />
            </Button>
            <div>
              <CardTitle>Practice Mode</CardTitle>
              <CardDescription>
                Improve your typing skills
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleNew}>
              <Target className="mr-1 h-4 w-4" />
              New Text
            </Button>
            <Button variant="ghost" onClick={handleRestart}>
              <RefreshCw className="mr-1 h-4 w-4" />
              Restart
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent>
          <div className="flex justify-between mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Zap, label: "WPM", value: stats.wpm },
          {
            icon: Target,
            label: "Accuracy",
            value: `${stats.accuracy}%`,
          },
          {
            icon: Zap,
            label: "Consistency",
            value: `${stats.consistency}%`,
          },
          {
            icon: Clock,
            label: "Time",
            value: `${timeElapsed}s`,
          },
        ].map((s, i) => (
          <Card key={i} className="text-center">
            <CardContent className="space-y-2">
              <s.icon className="mx-auto h-5 w-5" />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Typing Area */}
      <Card>
        <CardContent className="space-y-4">
          <div
            className={cn(
              "p-4 bg-gray-50 font-mono text-lg rounded",
              "whitespace-pre-wrap break-words"
            )}
          >
            {renderText()}
            {isCompleted && <span className="animate-pulse">|</span>}
          </div>
          <div className="relative">
            <Textarea
              ref={inputRef}
              value={userInput}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={isCompleted}
              placeholder="Start typing..."
              className="font-mono text-lg"
              rows={3}
            />
            <div className="absolute bottom-2 right-3 text-sm text-gray-500">
              {currentIndex}/{text.length}
            </div>
          </div>
          {isCompleted && (
            <div className="text-center space-y-2">
              <Target className="mx-auto h-8 w-8" />
              <div className="text-xl font-bold">
                Practice Complete!
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={handleNew}>New Text</Button>
                <Button variant="outline" onClick={handleRestart}>
                  Practice Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
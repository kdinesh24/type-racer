import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to get color class based on WPM
export function getWPMColor(wpm: number): string {
  if (wpm >= 80) return "text-green-600 font-semibold";
  if (wpm >= 60) return "text-blue-600 font-semibold";
  if (wpm >= 40) return "text-yellow-600 font-semibold";
  if (wpm >= 20) return "text-orange-600 font-semibold";
  return "text-red-600 font-semibold";
}

// Utility function to get color class based on accuracy
export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 95) return "text-green-600 font-semibold";
  if (accuracy >= 90) return "text-blue-600 font-semibold";
  if (accuracy >= 85) return "text-yellow-600 font-semibold";
  if (accuracy >= 75) return "text-orange-600 font-semibold";
  return "text-red-600 font-semibold";
}

// Utility function to format time
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Utility function to calculate WPM
export function calculateWPM(
  correctChars: number,
  timeElapsed: number
): number {
  if (timeElapsed === 0) return 0;
  return Math.round((correctChars / 5) / (timeElapsed / 60));
}

// Utility function to calculate accuracy
export function calculateAccuracy(
  correctChars: number,
  totalTypedChars: number
): number {
  if (totalTypedChars === 0) return 100;
  return Math.round((correctChars / totalTypedChars) * 100);
}

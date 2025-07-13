// Performance monitoring utilities for TypeRace

export interface PerformanceMetrics {
  wpm: number;
  accuracy: number;
  keystrokes: number;
  backspaces: number;
  correctKeystrokes: number;
  timeElapsed: number;
  consistency: number;
}

export class TypingPerformanceTracker {
  private startTime: number = 0;
  private keyPresses: number[] = [];
  private correctPresses: number = 0;
  private totalPresses: number = 0;
  private backspaceCount: number = 0;
  private lastFiveWPM: number[] = [];

  reset() {
    this.startTime = Date.now();
    this.keyPresses = [];
    this.correctPresses = 0;
    this.totalPresses = 0;
    this.backspaceCount = 0;
    this.lastFiveWPM = [];
  }

  recordKeystroke(isCorrect: boolean, isBackspace: boolean = false) {
    if (this.startTime === 0) {
      this.startTime = Date.now();
    }

    if (isBackspace) {
      this.backspaceCount++;
    } else {
      this.totalPresses++;
      if (isCorrect) {
        this.correctPresses++;
      }
    }

    this.keyPresses.push(Date.now());
  }

  getMetrics(): PerformanceMetrics {
    const timeElapsed = (Date.now() - this.startTime) / 1000;
    const minutes = timeElapsed / 60;
    
    let wpm = 0;
    // Minimum 3 seconds of typing to get meaningful WPM
    if (timeElapsed >= 3 && minutes > 0) {
      // Calculate Gross WPM (based on correct characters only)
      const grossWPM = (this.correctPresses / 5) / minutes;
      
      // Calculate errors and errors per minute
      const errors = this.totalPresses - this.correctPresses;
      const errorsPerMinute = errors / minutes;
      
      // Net WPM = Gross WPM - Errors per minute
      wpm = Math.max(0, Math.round(grossWPM - errorsPerMinute));
    }
    
    const accuracy = this.totalPresses > 0 ? Math.round((this.correctPresses / this.totalPresses) * 100) : 100;
    
    // Calculate consistency (based on WPM variation)
    this.lastFiveWPM.push(wpm);
    if (this.lastFiveWPM.length > 5) {
      this.lastFiveWPM.shift();
    }
    
    const consistency = this.calculateConsistency();

    return {
      wpm,
      accuracy,
      keystrokes: this.totalPresses,
      backspaces: this.backspaceCount,
      correctKeystrokes: this.correctPresses,
      timeElapsed,
      consistency
    };
  }

  private calculateConsistency(): number {
    if (this.lastFiveWPM.length < 2) return 100;
    
    const avg = this.lastFiveWPM.reduce((a, b) => a + b) / this.lastFiveWPM.length;
    const variance = this.lastFiveWPM.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / this.lastFiveWPM.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to percentage (lower standard deviation = higher consistency)
    return Math.max(0, Math.round(100 - (stdDev / avg) * 100));
  }

  getRealtimeWPM(): number {
    const now = Date.now();
    const timeWindow = 5000; // 5 seconds in milliseconds
    
    // Get recent correct keystrokes
    const recentCorrectKeystrokes = this.keyPresses.filter(
      (timestamp, index) => {
        // Only count if it was a correct keystroke and within time window
        return now - timestamp < timeWindow && index < this.correctPresses;
      }
    );
    
    if (recentCorrectKeystrokes.length === 0) return 0;
    
    const minutes = (timeWindow / 1000) / 60; // Convert to minutes
    const grossWPM = (recentCorrectKeystrokes.length / 5) / minutes;
    
    // For real-time, we'll use gross WPM since it's a short window
    return Math.round(grossWPM);
  }
}

export const performanceTracker = new TypingPerformanceTracker();

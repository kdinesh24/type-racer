import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRaceStore } from '@/store/race.store';
import { usePathname } from 'next/navigation';

// Global socket instance to prevent multiple connections
let globalSocket: Socket | null = null;
let isConnecting = false;

export const useSocket = () => {
  const { setSocket, setRaceData, updatePlayer, addPlayer, removePlayer, setCountdown, startRace, endRace, resetRace, updateTypingProgress, clearResults, setPlayers } = useRaceStore();
  const initializationRef = useRef(false);
  const pathname = usePathname();
  
  // Only initialize socket on race-related pages
  const isRacePage = pathname.includes('/race/') || pathname.includes('/practice');
  
  useEffect(() => {
    // Don't initialize socket on non-race pages
    if (!isRacePage) {
      return;
    }

    // Prevent multiple initializations
    if (initializationRef.current && globalSocket) {
      setSocket(globalSocket);
      return;
    }

    // Prevent concurrent connection attempts
    if (isConnecting) {
      return;
    }

    console.log('🔌 Initializing socket connection to http://localhost:3003');
    isConnecting = true;
    
    const socketInstance: Socket = io('http://localhost:3003', {
      transports: ['websocket'], // Prefer websocket only to avoid polling fallback errors
      upgrade: true,
      rememberUpgrade: true,
      timeout: 5000, // Reduced timeout for faster feedback
      forceNew: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3, // Reduced for faster failure detection
      randomizationFactor: 0.2
    });

    // Store global socket reference
    globalSocket = socketInstance;
    initializationRef.current = true;
    isConnecting = false;
    
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected successfully:', socketInstance.id);
      setSocket(socketInstance);
    });
    
    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason);
      // Only set socket to null if it's a permanent disconnection
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        setSocket(null);
        globalSocket = null;
        initializationRef.current = false;
        isConnecting = false;
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error.message || error);
      isConnecting = false;
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('🔄❌ Socket reconnection error:', error.message || error);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('💥 Socket reconnection failed after all attempts');
      setSocket(null);
      globalSocket = null;
      initializationRef.current = false;
      isConnecting = false;
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setSocket(socketInstance);
    });

    socketInstance.on('connection-confirmed', (data) => {
      console.log('🎉 Server confirmed connection:', data);
    });
    
    socketInstance.on('race-joined', (data) => {
      console.log('Socket received race-joined event:', data);
      console.log('Current URL path:', typeof window !== 'undefined' ? window.location.pathname : 'unknown');
      
      // Always accept the race data, but log if there's a mismatch
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      if (currentPath.includes('/race/private/') && !data.isPrivate) {
        console.warn('⚠️  Received non-private race data while on private room page, but accepting anyway');
        console.log('Race data isPrivate flag:', data.isPrivate);
        console.log('Expected private room, but got:', data);
      }
      
      setRaceData(data);
    });
    
    socketInstance.on('player-joined', (player) => {
      addPlayer(player);
    });
    
    socketInstance.on('player-left', (playerId) => {
      removePlayer(playerId);
    });
    
    socketInstance.on('countdown', (count) => {
      setCountdown(count);
    });
    
    socketInstance.on('race-start', () => {
      startRace();
    });
    
    socketInstance.on('typing-progress', (data) => {
      updatePlayer(data.playerId, {
        progress: data.progress,
        wpm: data.wpm,
        accuracy: data.accuracy
      });
    });
    
    socketInstance.on('player-finished', (data) => {
      updatePlayer(data.playerId, {
        finished: true,
        position: data.position,
        wpm: data.wpm,
        accuracy: data.accuracy
      });
    });
    
    socketInstance.on('race-end', (data) => {
      endRace(data.results);
    });
    
    socketInstance.on('race-restarted', (data) => {
      console.log('Received race-restarted event:', data);
      setRaceData(data);
      clearResults(); // Clear race results to hide the modal
      console.log('Race restarted - results cleared, new race ready');
    });

    socketInstance.on('players-updated', (data) => {
      console.log('Players updated:', data);
      // Only update the players array, preserve other state
      setPlayers(data.players);
    });

    socketInstance.on('race-error', (error) => {
      console.log('Race error received:', error);
      
      // Show error to user
      alert(error);
      
      // If the error is about room closure, restart failure, or joining a new race, reset the client completely
      if (error.includes('Please join a new race') || 
          error.includes('Race not found') || 
          error.includes('Room closed') ||
          error.includes('no longer exists') ||
          error.includes('No active race found')) {
        resetRace(); // This will clear all state and navigate back to main menu
      }
    });
    
    socketInstance.on('start-race-error', (error) => {
      // Show error to user - you could add a toast/notification here
      alert(error); // Simple alert for now, could be improved with a toast system
    });
    
    return () => {
      // Only clean up on page navigation away from race pages
      if (!isRacePage) {
        console.log('🧹 Cleaning up socket connection on page navigation');
        if (globalSocket) {
          globalSocket.disconnect();
          globalSocket = null;
          initializationRef.current = false;
          isConnecting = false;
        }
      }
    };
  }, [isRacePage]); // Depend on race page status
};

export const useTypingStats = (text: string, currentPosition: number, startTime: number | null) => {
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctChars, setCorrectChars] = useState(0);
  
  const calculateStats = useCallback((typedText: string) => {
    if (!startTime || typedText.length === 0) return { wpm: 0, accuracy: 100, correctChars: 0 };
    
    const timeElapsedMs = Date.now() - startTime;
    const timeElapsed = timeElapsedMs / 1000 / 60; // minutes
    
    // Calculate correct characters
    const correctCharCount = typedText.split('').reduce((acc, char, index) => {
      return acc + (char === text[index] ? 1 : 0);
    }, 0);
    
    // Calculate accuracy based on characters typed
    const newAccuracy = Math.round((correctCharCount / typedText.length) * 100);
    
    let newWpm = 0;
    // Minimum 3 seconds of typing to get meaningful WPM
    if (timeElapsedMs >= 3000 && timeElapsed > 0) {
      // Gross WPM based on correct characters only
      const grossWPM = (correctCharCount / 5) / timeElapsed;
      
      // Calculate errors
      const errors = typedText.length - correctCharCount;
      const errorsPerMinute = errors / timeElapsed;
      
      // Net WPM = Gross WPM - Errors per minute
      newWpm = Math.max(0, Math.round(grossWPM - errorsPerMinute));
    }
    
    setCorrectChars(correctCharCount);
    setWpm(newWpm);
    setAccuracy(newAccuracy);
    
    return { wpm: newWpm, accuracy: newAccuracy, correctChars: correctCharCount };
  }, [text, startTime]);
  
  return { wpm, accuracy, correctChars, calculateStats };
};

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true' || 
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);
  
  const toggle = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem('darkMode', newValue.toString());
    document.documentElement.classList.toggle('dark', newValue);
  };
  
  return { isDark, toggle };
};
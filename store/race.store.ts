import { create } from 'zustand';
import { Socket } from 'socket.io-client';

interface Player {
  id: string;
  username: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  position: number;
}

interface RaceState {
  raceId: string | null;
  text: string;
  players: Player[];
  isConnected: boolean;
  isRaceActive: boolean;
  countdown: number;
  currentPosition: number;
  wpm: number;
  accuracy: number;
  startTime: number | null;
  socket: Socket | null;
  raceResults: Player[] | null;
  isPrivateRoom: boolean;
  isHost: boolean;
}

interface RaceActions {
  setSocket: (socket: Socket | null) => void;
  joinRace: (username: string, raceId?: string) => void;
  joinPrivateRoom: (username: string, roomCode?: string) => void;
  createPrivateRoom: (username: string) => void;
  startPrivateRace: () => void;
  requestRestart: () => void;
  clearResults: () => void;
  leaveRace: () => void;
  setRaceData: (data: { raceId: string; text: string; players: Player[]; isPrivate?: boolean; isHost?: boolean }) => void;
  updatePlayer: (playerId: string, data: Partial<Player>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setCountdown: (countdown: number) => void;
  startRace: () => void;
  endRace: (results: Player[]) => void;
  updateTypingProgress: (position: number, wpm: number, accuracy: number) => void;
  resetRace: () => void;
  setPlayers: (players: Player[]) => void;
}

export const useRaceStore = create<RaceState & RaceActions>((set, get) => ({
  // State
  raceId: null,
  text: '',
  players: [],
  isConnected: false,
  isRaceActive: false,
  countdown: 0,
  currentPosition: 0,
  wpm: 0,
  accuracy: 100,
  startTime: null,
  socket: null,
  raceResults: null,
  isPrivateRoom: false,
  isHost: false,

  // Actions
  setSocket: (socket) => set({ socket, isConnected: socket !== null }),
  
  joinRace: (username, raceId) => {
    const { socket } = get();
    
    // Prevent joining global races if we're on a private room page
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    if (currentPath.includes('/race/private')) {
      console.log('🚫 Blocking global race join attempt from private room path:', currentPath);
      return;
    }
    
    if (socket && username) {
      console.log('Joining global race:', { username, raceId });
      socket.emit('join-race', { username, raceId });
    }
  },

  joinPrivateRoom: (username, roomCode) => {
    const { socket } = get();
    if (socket && username && roomCode && roomCode.trim().length === 5) {
      const normalizedRoomCode = roomCode.trim().toUpperCase();
      console.log('🏠 Joining private room with code:', normalizedRoomCode, 'username:', username);
      
      // Explicitly mark this as a private room join with maximum clarity
      socket.emit('join-race', { 
        username, 
        raceId: normalizedRoomCode, 
        isPrivate: true,
        forcePrivate: true  // Additional flag for server
      });
    } else {
      console.error('Cannot join private room - validation failed:', { 
        roomCode, 
        roomCodeLength: roomCode?.trim().length, 
        username, 
        socketExists: !!socket 
      });
    }
  },

  createPrivateRoom: (username) => {
    const { socket } = get();
    if (socket && username) {
      console.log('🏗️  Creating new private room for user:', username);
      socket.emit('join-race', { 
        username, 
        isPrivate: true, 
        forcePrivate: true 
      });
    } else {
      console.error('Cannot create private room - missing socket or username:', { username, socketExists: !!socket });
    }
  },

  startPrivateRace: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('start-private-race');
    }
  },
  
  requestRestart: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('request-restart');
    }
  },

  clearResults: () => set({ raceResults: null }),

  setRaceData: (data) => {
    console.log('Setting race data:', data);
    
    // Detect if we should force private room context based on URL
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const shouldBePrivate = currentPath.includes('/race/private/');
    
    // If we're on a private room page but the data doesn't indicate private, force it
    const isPrivateRoom = data.isPrivate === true || shouldBePrivate;
    
    if (shouldBePrivate && !data.isPrivate) {
      console.log('🔧 Forcing private room context due to URL path');
    }
    
    set({
      raceId: data.raceId, 
      text: data.text, 
      players: data.players,
      raceResults: null,
      isPrivateRoom: isPrivateRoom,
      isHost: data.isHost === true
    });
    
    console.log('Race state updated:', {
      raceId: data.raceId,
      isPrivateRoom: isPrivateRoom,
      isHost: data.isHost === true,
      playersCount: data.players?.length || 0
    });
  },
  
  updatePlayer: (playerId, data) => set((state) => {
    const updatedPlayers = state.players.map(player => 
      player.id === playerId ? { ...player, ...data } : player
    );
    return { players: updatedPlayers };
  }),
  
  addPlayer: (player) => set((state) => {
    // Check if player already exists to prevent duplicates
    const existingPlayerIndex = state.players.findIndex(p => p.id === player.id);
    if (existingPlayerIndex !== -1) {
      // Update existing player
      const updatedPlayers = [...state.players];
      updatedPlayers[existingPlayerIndex] = player;
      return { players: updatedPlayers };
    } else {
      // Add new player
      return { players: [...state.players, player] };
    }
  }),
  
  removePlayer: (playerId) => set((state) => ({
    players: state.players.filter(player => player.id !== playerId)
  })),
  
  setCountdown: (countdown) => set({ countdown }),
  
  startRace: () => set({ 
    isRaceActive: true, 
    startTime: Date.now(), 
    countdown: 0 
  }),
  
  endRace: (results) => set({ 
    isRaceActive: false, 
    raceResults: results 
  }),
  
  updateTypingProgress: (position, wpm, accuracy) => {
    const { socket, text } = get();
    const progress = text.length > 0 ? (position / text.length) * 100 : 0;
    const correct = Math.round((position * accuracy) / 100);
    
    set({ 
      currentPosition: position, 
      wpm, 
      accuracy 
    });
    
    if (socket) {
      const progressData = {
        progress: Math.min(Math.max(progress, 0), 100),
        wpm: wpm,
        accuracy: accuracy,
        correct,
        total: position
      };
      
      socket.emit('typing-update', progressData);
    }
  },
    leaveRace: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('leave-race');
    }
    set({
      raceId: null,
      text: '',
      players: [],
      isRaceActive: false,
      countdown: 0,
      currentPosition: 0,
      wpm: 0,
      accuracy: 100,
      startTime: null,
      raceResults: null,
      isPrivateRoom: false,
      isHost: false
    });
    
    // Prevent navigation to wrong URLs and ensure we stay on the correct page
    if (typeof window !== 'undefined') {
      // Clear any potential navigation history that might redirect to wrong ports
      const currentUrl = new URL(window.location.href);
      const correctUrl = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port || '3000'}${currentUrl.pathname}`;
      
      // Force replace the current state with the correct URL
      window.history.replaceState(null, '', correctUrl);
      
      // Prevent any potential redirects by checking the current location
      if (window.location.href !== correctUrl) {
        window.location.href = correctUrl;
      }
    }
  },

  resetRace: () => set({
    raceId: null,
    text: '',
    players: [],
    isRaceActive: false,
    countdown: 0,
    currentPosition: 0,
    wpm: 0,
    accuracy: 100,
    startTime: null,
    raceResults: null,
    isPrivateRoom: false,
    isHost: false
  }),
  
  setPlayers: (players) => set({ players })
}));

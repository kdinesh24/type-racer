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
  username: string;
  raceResults: Player[] | null;
  isPrivateRoom: boolean;
  isHost: boolean;
}

interface RaceActions {
  setSocket: (socket: Socket | null) => void;
  setUsername: (username: string) => void;
  joinRace: (raceId?: string) => void;
  joinPrivateRoom: (roomCode?: string) => void;
  createPrivateRoom: () => void;
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
  username: '',
  raceResults: null,
  isPrivateRoom: false,
  isHost: false,

  // Actions
  setSocket: (socket) => set({ socket, isConnected: socket !== null }),
  
  setUsername: (username) => set({ username }),
  
  joinRace: (raceId) => {
    const { socket, username } = get();
    if (socket && username) {
      socket.emit('join-race', { username, raceId });
    }
  },

  joinPrivateRoom: (roomCode) => {
    const { socket, username } = get();
    if (socket && username) {
      socket.emit('join-race', { username, raceId: roomCode, isPrivate: true });
    }
  },

  createPrivateRoom: () => {
    const { socket, username } = get();
    if (socket && username) {
      socket.emit('join-race', { username, isPrivate: true });
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

  setRaceData: (data) => set({
    raceId: data.raceId, 
    text: data.text, 
    players: data.players,
    raceResults: null,
    isPrivateRoom: data.isPrivate || false,
    isHost: data.isHost || false
  }),
  
  updatePlayer: (playerId, data) => set((state) => {
    const updatedPlayers = state.players.map(player => 
      player.id === playerId ? { ...player, ...data } : player
    );
    return { players: updatedPlayers };
  }),
  
  addPlayer: (player) => set((state) => ({
    players: [...state.players, player]
  })),
  
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
  })
}));

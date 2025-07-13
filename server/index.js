"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
// Simple function to get random text for races
function getRandomParagraph() {
    const paragraphs = [
        "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once, making it perfect for typing practice and keyboard testing.",
        "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat.",
        "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles.",
        "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.",
        "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little."
    ];
    return paragraphs[Math.floor(Math.random() * paragraphs.length)];
}
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    },
    // Optimize for higher concurrent connections
    pingTimeout: 60000, // 60 seconds before disconnect
    pingInterval: 25000, // Ping every 25 seconds
    maxHttpBufferSize: 1e6, // 1MB max message size
    transports: ['websocket', 'polling'], // Allow fallback to polling
    allowEIO3: true // Better compatibility
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const races = new Map();
const playerRaces = new Map();
function generateRaceId() {
    return Math.random().toString(36).substring(2, 15);
}
function generatePrivateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
    let result = '';
    for (let i = 0; i < 5; i++) { // Changed to 5 characters
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
function getRandomText() {
    return getRandomParagraph();
}
function calculateWPM(correctCharacters, totalCharacters, timeElapsed) {
    // Minimum 3 seconds of typing to get meaningful WPM
    if (timeElapsed < 3000)
        return 0;
    const minutes = timeElapsed / 60000;
    const grossWPM = (correctCharacters / 5) / minutes;
    const errors = totalCharacters - correctCharacters;
    const errorsPerMinute = errors / minutes;
    // Net WPM = Gross WPM - Errors per minute
    const netWPM = Math.max(0, grossWPM - errorsPerMinute);
    return Math.round(netWPM);
}
function calculateAccuracy(correct, total) {
    if (total === 0)
        return 100;
    return Math.round((correct / total) * 100);
}
// Track active connections and races for monitoring
let activeConnections = 0;
let peakConnections = 0;
io.on('connection', (socket) => {
    activeConnections++;
    peakConnections = Math.max(peakConnections, activeConnections);
    console.log(`User connected: ${socket.id} | Active: ${activeConnections} | Peak: ${peakConnections} | Races: ${races.size}`);
    socket.on('join-race', (data) => {
        const { username, raceId, isPrivate } = data;
        console.log('Join race request:', { username, raceId, isPrivate });
        // First, clean up any existing race association for this socket
        const existingRaceId = playerRaces.get(socket.id);
        if (existingRaceId) {
            const existingRace = races.get(existingRaceId);
            if (existingRace) {
                existingRace.players.delete(socket.id);
                socket.to(existingRaceId).emit('player-left', socket.id);
                socket.leave(existingRaceId);
                // Clean up empty races
                if (existingRace.players.size === 0) {
                    races.delete(existingRaceId);
                }
            }
            playerRaces.delete(socket.id);
        }
        let race;
        let targetRaceId = raceId;
        // Handle joining existing private room
        if (raceId && isPrivate) {
            // For private rooms, normalize the room code to uppercase
            const normalizedRoomCode = raceId.toUpperCase();
            console.log('Looking for private room:', normalizedRoomCode);
            // Check if the room exists
            if (races.has(normalizedRoomCode)) {
                race = races.get(normalizedRoomCode);
                targetRaceId = normalizedRoomCode;
                console.log('Found existing private room:', normalizedRoomCode, 'with', race.players.size, 'players');
                // Check if race has already started
                if (race.isActive) {
                    console.log('Race already started:', normalizedRoomCode);
                    socket.emit('race-error', 'Race already started');
                    return;
                }
                // Check if room is full (max 5 players)
                if (race.players.size >= 5) {
                    console.log('Room is full:', normalizedRoomCode);
                    socket.emit('race-error', 'Room is full (max 5 players)');
                    return;
                }
            }
            else {
                // Private room not found
                console.log('Private room not found:', normalizedRoomCode);
                socket.emit('race-error', 'Private room not found');
                return;
            }
        }
        else if (raceId && races.has(raceId)) {
            // Handle joining existing global race
            console.log('Found existing race:', raceId);
            race = races.get(raceId);
            if (race.isActive) {
                console.log('Race already started:', raceId);
                socket.emit('race-error', 'Race already started');
                return;
            }
            if (race.players.size >= 5) {
                console.log('Room is full:', raceId);
                socket.emit('race-error', 'Room is full (max 5 players)');
                return;
            }
        }
        else {
            // Find an available race or create a new one
            let availableRace = null;
            if (!isPrivate) {
                // For global races, find existing room or create new one
                // Sort by player count to distribute users more evenly
                const availableRaces = Array.from(races.values())
                    .filter(r => !r.isActive && !r.isFinished && !r.isPrivate && r.players.size < 5 && r.players.size > 0)
                    .sort((a, b) => a.players.size - b.players.size); // Prefer races with fewer players
                availableRace = availableRaces[0]; // Take the race with least players
            }
            if (availableRace) {
                race = availableRace;
                targetRaceId = race.id;
            }
            else {
                const newRaceId = isPrivate ? generatePrivateRoomCode() : generateRaceId();
                console.log('Creating new race:', newRaceId, 'isPrivate:', isPrivate);
                targetRaceId = newRaceId;
                race = {
                    id: newRaceId,
                    text: getRandomText(),
                    players: new Map(),
                    startTime: null,
                    isActive: false,
                    countdown: 0,
                    isFinished: false,
                    isPrivate: isPrivate || false,
                    hostId: isPrivate ? socket.id : undefined
                };
                races.set(newRaceId, race);
            }
        }
        // Add player to race
        const player = {
            id: socket.id,
            username,
            progress: 0,
            wpm: 0,
            accuracy: 100,
            finished: false,
            position: 0
        };
        race.players.set(socket.id, player);
        playerRaces.set(socket.id, targetRaceId);
        socket.join(targetRaceId);
        console.log('Player joined:', username, 'to race:', targetRaceId, 'total players:', race.players.size);
        socket.emit('race-joined', {
            raceId: targetRaceId,
            text: race.text,
            players: Array.from(race.players.values()),
            isPrivate: race.isPrivate,
            isHost: race.hostId === socket.id
        });
        socket.to(targetRaceId).emit('player-joined', player);
        // Start countdown if we have enough players and it's NOT a private room
        if (race.players.size >= 2 && !race.isActive && race.countdown === 0 && !race.isPrivate) {
            startCountdown(targetRaceId);
        }
    });
    socket.on('start-private-race', () => {
        const raceId = playerRaces.get(socket.id);
        if (!raceId)
            return;
        const race = races.get(raceId);
        if (!race || !race.isPrivate || race.hostId !== socket.id) {
            socket.emit('start-race-error', 'Only the host can start the race');
            return;
        }
        if (race.isActive) {
            socket.emit('start-race-error', 'Race already started');
            return;
        }
        if (race.players.size < 2) {
            socket.emit('start-race-error', 'Need at least 2 players to start the race');
            return;
        }
        startCountdown(raceId);
    });
    socket.on('request-restart', () => {
        console.log('Restart requested by:', socket.id);
        const raceId = playerRaces.get(socket.id);
        if (!raceId) {
            console.log('No race found for player:', socket.id);
            return;
        }
        const race = races.get(raceId);
        if (!race) {
            console.log('Race not found:', raceId);
            return;
        }
        console.log('Restarting private room:', raceId, 'with', race.players.size, 'players');
        // Reset race state for restart
        race.isActive = false;
        race.isFinished = false;
        race.countdown = 0;
        race.startTime = null;
        // Reset all players' progress
        race.players.forEach(player => {
            player.progress = 0;
            player.wpm = 0;
            player.accuracy = 100;
            player.finished = false;
            player.position = 0;
        });
        // Generate new text for the race
        race.text = getRandomText();
        // Notify all players about the restart
        console.log('Sending race-restarted event to', race.players.size, 'players');
        race.players.forEach((player, playerId) => {
            io.to(playerId).emit('race-restarted', {
                raceId: race.id,
                text: race.text,
                players: Array.from(race.players.values()),
                isPrivate: race.isPrivate,
                isHost: race.hostId === playerId
            });
        });
        console.log('Race restart complete');
    });
    socket.on('typing-update', (data) => {
        const raceId = playerRaces.get(socket.id);
        if (!raceId)
            return;
        const race = races.get(raceId);
        if (!race || !race.isActive)
            return;
        const player = race.players.get(socket.id);
        if (!player || player.finished)
            return;
        const timeElapsed = Date.now() - race.startTime;
        player.progress = data.progress;
        player.wpm = calculateWPM(data.correct, data.total, timeElapsed);
        player.accuracy = calculateAccuracy(data.correct, data.total);
        // Check if player finished
        if (data.progress >= 100 && !player.finished) {
            player.finished = true;
            const finishedPlayers = Array.from(race.players.values())
                .filter(p => p.finished).length;
            player.position = finishedPlayers;
            io.to(raceId).emit('player-finished', {
                playerId: socket.id,
                position: player.position,
                wpm: player.wpm,
                accuracy: player.accuracy
            });
            // Check if race is complete
            if (Array.from(race.players.values()).every(p => p.finished)) {
                endRace(raceId);
            }
        }
        io.to(raceId).emit('typing-progress', {
            playerId: socket.id,
            progress: player.progress,
            wpm: player.wpm,
            accuracy: player.accuracy
        });
    });
    socket.on('leave-race', () => {
        console.log('User left race:', socket.id);
        const raceId = playerRaces.get(socket.id);
        if (raceId) {
            const race = races.get(raceId);
            if (race) {
                race.players.delete(socket.id);
                socket.to(raceId).emit('player-left', socket.id);
                socket.leave(raceId);
                // Check player count after someone leaves
                if (race.players.size === 0) {
                    races.delete(raceId);
                }
                else if (race.players.size === 1) {
                    // IMPORTANT: If only 1 player left, kick them out and close the room
                    const remainingPlayerId = Array.from(race.players.keys())[0];
                    const remainingPlayer = race.players.get(remainingPlayerId);
                    // Remove the remaining player from race
                    race.players.delete(remainingPlayerId);
                    playerRaces.delete(remainingPlayerId);
                    // Notify the remaining player that the room is closed
                    io.to(remainingPlayerId).emit('race-error', 'Room closed - not enough players. Please join a new race.');
                    // Delete the empty race
                    races.delete(raceId);
                }
            }
            playerRaces.delete(socket.id);
        }
    });
    socket.on('disconnect', () => {
        activeConnections--;
        console.log(`User disconnected: ${socket.id} | Active: ${activeConnections}`);
        const raceId = playerRaces.get(socket.id);
        if (raceId) {
            const race = races.get(raceId);
            if (race) {
                race.players.delete(socket.id);
                socket.to(raceId).emit('player-left', socket.id);
                // Check player count after disconnect
                if (race.players.size === 0) {
                    races.delete(raceId);
                }
                else if (race.players.size === 1) {
                    // IMPORTANT: If only 1 player left, kick them out and close the room
                    const remainingPlayerId = Array.from(race.players.keys())[0];
                    const remainingPlayer = race.players.get(remainingPlayerId);
                    // Remove the remaining player from race
                    race.players.delete(remainingPlayerId);
                    playerRaces.delete(remainingPlayerId);
                    // Notify the remaining player that the room is closed
                    io.to(remainingPlayerId).emit('race-error', 'Room closed - not enough players. Please join a new race.');
                    // Delete the empty race
                    races.delete(raceId);
                }
            }
            playerRaces.delete(socket.id);
        }
    });
});
function startCountdown(raceId) {
    const race = races.get(raceId);
    if (!race)
        return;
    race.countdown = 10;
    const countdownInterval = setInterval(() => {
        io.to(raceId).emit('countdown', race.countdown);
        race.countdown--;
        if (race.countdown < 0) {
            clearInterval(countdownInterval);
            race.isActive = true;
            race.startTime = Date.now();
            race.countdown = 0;
            io.to(raceId).emit('race-start');
            // Auto-end race after 5 minutes
            setTimeout(() => {
                if (races.has(raceId)) {
                    endRace(raceId);
                }
            }, 300000);
        }
    }, 1000);
}
function endRace(raceId) {
    const race = races.get(raceId);
    if (!race)
        return;
    race.isActive = false;
    race.isFinished = true;
    const results = Array.from(race.players.values())
        .sort((a, b) => {
        if (a.finished && !b.finished)
            return -1;
        if (!a.finished && b.finished)
            return 1;
        if (a.finished && b.finished)
            return a.position - b.position;
        return b.progress - a.progress;
    });
    io.to(raceId).emit('race-end', { results });
    // Clean up race after 30 seconds
    setTimeout(() => {
        races.delete(raceId);
        Array.from(race.players.keys()).forEach(playerId => {
            playerRaces.delete(playerId);
        });
    }, 30000);
}
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

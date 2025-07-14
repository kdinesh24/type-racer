'use client';

import { useState, useEffect } from 'react';
import { useRaceStore } from '@/store/race.store';
import UsernameModal from '@/components/modals/UsernameModal';
import RoomModal from '@/components/modals/RoomModal';
import RaceStatus from '@/components/race/RaceStatus';
import TypingArea from '@/components/race/TypingArea';
import PlayersList from '@/components/race/PlayersList';
import RaceResults from '@/components/race/RaceResults';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiUsers, FiPlus, FiArrowRight } from 'react-icons/fi';

export default function PrivateRacePage() {
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomModalAction, setRoomModalAction] = useState<'choose' | 'create' | 'join'>('choose');
  const { 
    username, 
    isConnected, 
    raceId,
    createPrivateRoom,
    joinPrivateRoom,
    leaveRace,
    isPrivateRoom,
    isHost,
    players
  } = useRaceStore();

  // Show username modal if no username is set
  useEffect(() => {
    if (!username && isConnected) {
      setShowUsernameModal(true);
    }
  }, [username, isConnected]);

  const handleCreateRoom = () => {
    if (username) {
      // Directly create the room without showing modal selection
      createPrivateRoom();
    } else {
      setShowUsernameModal(true);
    }
  };

  const handleJoinRoom = () => {
    if (username) {
      // Show modal and go directly to join mode
      setRoomModalAction('join');
      setShowRoomModal(true);
    } else {
      setShowUsernameModal(true);
    }
  };

  const handleUsernameSet = () => {
    setShowUsernameModal(false);
  };

  const handleLeaveRace = () => {
    leaveRace();
  };

  const handleRoomCreate = () => {
    createPrivateRoom();
    // Don't close modal immediately - wait for room creation
  };

  // Auto-close room modal when room is successfully created or joined
  useEffect(() => {
    if (raceId && showRoomModal) {
      // Small delay to show the success message then close modal
      const timer = setTimeout(() => {
        setShowRoomModal(false);
        setRoomModalAction('choose'); // Reset action
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [raceId, showRoomModal]);

  const handleRoomJoin = (roomCode: string) => {
    // Validate room code before attempting to join
    if (!roomCode || roomCode.trim().length !== 5) {
      console.error('Invalid room code provided:', roomCode);
      return;
    }
    
    joinPrivateRoom(roomCode);
    setShowRoomModal(false);
  };

  // Debug private room state
  useEffect(() => {
    if (raceId) {
      console.log('🏠 Private Page - Room state:', {
        raceId,
        isPrivateRoom,
        isHost,
        playersCount: players.length,
        players: players.map(p => ({ id: p.id, username: p.username }))
      });
    }
  }, [raceId, isPrivateRoom, isHost, players]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <ConnectionStatus isConnected={isConnected} />
      </div>      <div className="container mx-auto px-4 py-8">
        {!raceId ? (
          /* Lobby/Room Selection */
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Private Race Room
              </h1>
              <p className="text-gray-600 text-lg">
                Create or join private rooms to race with friends
              </p>
            </div>

            {/* Username Display */}
            {username && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Playing as: {username}
                </div>
              </div>
            )}

            {/* Room Options */}
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Create Room */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiPlus className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Create Room
                  </CardTitle>
                  <p className="text-gray-600">
                    Start a new private room and invite friends
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6 text-sm text-gray-600">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      You control when the race starts
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      Share room code with friends
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      Private competition
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={handleCreateRoom}
                    disabled={!isConnected}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Create New Room
                  </Button>
                </CardContent>
              </Card>

              {/* Join Room */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiArrowRight className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Join Room
                  </CardTitle>
                  <p className="text-gray-600">
                    Enter a room code to join an existing room
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6 text-sm text-gray-600">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                      Enter 5-digit room code
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                      Join ongoing or waiting room
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                      Wait for host to start
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={handleJoinRoom}
                    disabled={!isConnected}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    <FiArrowRight className="w-4 h-4 mr-2" />
                    Join Existing Room
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Connection Status */}
            {!isConnected && (
              <div className="text-center mt-8 text-red-600">
                Connecting to server...
              </div>
            )}
          </div>
        ) : (
          /* Race Interface */
          <div className="space-y-6">
            {/* Race Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Private Race Room</h1>
                <p className="text-gray-600">Room Code: <span className="font-mono font-bold">{raceId}</span></p>
              </div>
              <div className="text-right">
                <Button 
                  onClick={handleLeaveRace}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 mb-2"
                >
                  Leave Room
                </Button>
                {/* Debug info */}
                <div className="text-xs text-gray-500">
                  Host: {isHost ? 'YES' : 'NO'} | Players: {players.length} | Private: {isPrivateRoom ? 'YES' : 'NO'}
                </div>
              </div>
            </div>

            {/* Race Status */}
            <RaceStatus />

            {/* Main Race Area */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Typing Area */}
              <div className="lg:col-span-2">
                <TypingArea />
              </div>

              {/* Players List */}
              <div>
                <PlayersList />
              </div>
            </div>

            {/* Race Results */}
            <RaceResults />
          </div>
        )}
      </div>

      {/* Username Modal */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSuccess={handleUsernameSet}
      />

      {/* Room Modal */}
      <RoomModal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        onCreateRoom={handleRoomCreate}
        onJoinRoom={handleRoomJoin}
        currentRoomCode={raceId || undefined}
        initialAction={roomModalAction}
      />
    </div>
  );
}

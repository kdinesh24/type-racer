'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRaceStore } from '@/store/race.store';
import RoomModal from '@/components/modals/RoomModal';
import RaceStatus from '@/components/race/RaceStatus';
import TypingArea from '@/components/race/TypingArea';
import PlayersList from '@/components/race/PlayersList';
import RaceResults from '@/components/race/RaceResults';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiUsers, FiPlus, FiArrowRight } from 'react-icons/fi';
import { getUserDisplayName } from '@/lib/auth-utils';

export default function PrivateRacePage() {
  const { data: session } = useSession();
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomModalAction, setRoomModalAction] = useState<'choose' | 'create' | 'join'>('choose');
  const { 
    isConnected, 
    raceId,
    createPrivateRoom,
    joinPrivateRoom,
    leaveRace,
    isPrivateRoom,
    isHost,
    players,
    resetRace
  } = useRaceStore();

  const username = getUserDisplayName(session);

  // Clear any existing race state when landing on private room selection page
  useEffect(() => {
    // If we're on the main private room page (not a specific room), clear any existing race
    if (raceId && !isPrivateRoom) {
      console.log('🧹 Clearing non-private race state on private room page');
      resetRace();
    }
  }, [raceId, isPrivateRoom, resetRace]);

  const handleCreateRoom = () => {
    // Directly create the room
    createPrivateRoom(username);
  };

  const handleJoinRoom = () => {
    // Show modal and go directly to join mode
    setRoomModalAction('join');
    setShowRoomModal(true);
  };

  const handleLeaveRace = () => {
    leaveRace();
  };

  const handleRoomCreate = () => {
    createPrivateRoom(username);
    // Don't close modal immediately - wait for room creation
  };

  // Auto-close room modal when room is successfully created or joined
  useEffect(() => {
    if (raceId && showRoomModal) {
      // Small delay to show the success message then close modal
      const timer = setTimeout(() => {
        setShowRoomModal(false);
        setRoomModalAction('choose'); // Reset action
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [raceId, showRoomModal]);

  const handleRoomJoin = (roomCode: string) => {
    // Validate room code before attempting to join
    if (!roomCode || roomCode.trim().length !== 5) {
      console.error('Private room page - invalid room code provided:', roomCode);
      return;
    }
    
    console.log('Private room page - joining room with code:', roomCode);
    joinPrivateRoom(username, roomCode);
    setShowRoomModal(false);
  };

  // Debug private room state
  useEffect(() => {
    console.log('🏠 Private Race Page State:', {
      raceId,
      isPrivateRoom,
      isHost,
      playersCount: players.length,
      username
    });
  }, [raceId, isPrivateRoom, isHost, players.length, username]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <ConnectionStatus isConnected={isConnected} />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {!raceId ? (
          /* Room Selection */
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600">
                <FiUsers className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Private Room
              </CardTitle>
              <CardContent className="space-y-8 pt-6">
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    Playing as {username}
                  </span>
                </div>

                {/* Room Options */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Create Room */}
                  <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-purple-100 hover:border-purple-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FiPlus className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Room</h3>
                      <p className="text-gray-600 text-sm mb-4">Start a new private room and invite friends with a room code</p>
                      <Button 
                        onClick={handleCreateRoom}
                        disabled={!isConnected}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                      >
                        <FiPlus className="w-4 h-4 mr-2" />
                        Create Room
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Join Room */}
                  <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-green-100 hover:border-green-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FiArrowRight className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Existing Room</h3>
                      <p className="text-gray-600 text-sm mb-4">Enter a room code to join a friend&apos;s private race</p>
                      <Button 
                        onClick={handleJoinRoom}
                        disabled={!isConnected}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      >
                        <FiArrowRight className="w-4 h-4 mr-2" />
                        Join Room
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {!isConnected && (
                  <p className="text-center text-sm text-red-600">
                    Connecting to server...
                  </p>
                )}
              </CardContent>
            </CardHeader>
          </Card>
        ) : (
          /* Race Interface */
          <div className="space-y-6">
            {/* Header */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Private Room {raceId}
                  </CardTitle>
                  <p className="text-gray-600">
                    {isHost ? 'You are the host' : 'Room host controls the race'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLeaveRace}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Leave Room
                </Button>
              </CardHeader>
            </Card>

            {/* Status */}
            <Card>
              <CardContent>
                <RaceStatus />
              </CardContent>
            </Card>

            {/* Typing & Players */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TypingArea />
              </div>
              <Card>
                <CardContent>
                  <PlayersList />
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <Card>
              <CardContent>
                <RaceResults />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Room Modal */}
      <RoomModal
        isOpen={showRoomModal}
        onClose={() => {
          setShowRoomModal(false);
          setRoomModalAction('choose');
        }}
        initialAction={roomModalAction}
        onCreateRoom={handleRoomCreate}
        onJoinRoom={handleRoomJoin}
      />
    </div>
  );
}

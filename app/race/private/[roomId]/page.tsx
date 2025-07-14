'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useRaceStore } from '@/store/race.store';
import UsernameModal from '@/components/modals/UsernameModal';
import RaceStatus from '@/components/race/RaceStatus';
import TypingArea from '@/components/race/TypingArea';
import PlayersList from '@/components/race/PlayersList';
import RaceResults from '@/components/race/RaceResults';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiUsers, FiPlay, FiCopy, FiCheck, FiHash } from 'react-icons/fi';

export default function PrivateRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { 
    username, 
    raceId, 
    isConnected, 
    joinPrivateRoom,
    startPrivateRace,
    leaveRace,
    isHost,
    players
  } = useRaceStore();
  
  // Initialize socket connection
  useSocket();

  // Show username modal if no username is set
  useEffect(() => {
    if (!username && isConnected) {
      setShowUsernameModal(true);
    }
  }, [username, isConnected]);

  // Join the room when username is available and connected
  useEffect(() => {
    if (username && isConnected && roomId && !raceId) {
      // Validate room ID format (should be 5 uppercase alphanumeric characters)
      const normalizedRoomId = roomId.toString().toUpperCase();
      if (normalizedRoomId.length === 5 && /^[A-Z0-9]{5}$/.test(normalizedRoomId)) {
        console.log('Attempting to join room:', normalizedRoomId);
        joinPrivateRoom(normalizedRoomId);
      } else {
        console.error('Invalid room ID format:', roomId);
        // Redirect back to private room selection
        router.push('/race/private');
      }
    }
  }, [username, isConnected, roomId, raceId, joinPrivateRoom, router]);

  const handleUsernameSet = () => {
    setShowUsernameModal(false);
    // Don't call joinPrivateRoom here - the useEffect will handle it
  };

  const handleStartRace = () => {
    if (isHost) {
      startPrivateRace();
    }
  };

  const handleLeaveRoom = () => {
    leaveRace();
    router.push('/race/private');
  };

  const handleCopyRoomCode = async () => {
    if (roomId) {
      try {
        await navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy room code:', err);
      }
    }
  };

  // If not connected to a race yet, show lobby
  if (!raceId && username && isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Connection Status */}
        <div className="fixed top-4 right-4 z-50">
          <ConnectionStatus isConnected={isConnected} />
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Private Room: {roomId}
                </CardTitle>
                <p className="text-gray-600">
                  {isHost ? 'You are the host of this room' : 'Waiting for the host to start the race'}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Room Code */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg">
                    <FiHash className="w-4 h-4" />
                    <span className="font-mono font-semibold">{roomId}</span>
                    <button
                      onClick={handleCopyRoomCode}
                      className="ml-2 p-1 hover:bg-purple-200 rounded transition-colors"
                    >
                      {copied ? (
                        <FiCheck className="w-4 h-4 text-green-600" />
                      ) : (
                        <FiCopy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Share this code with friends to invite them
                  </p>
                </div>

                {/* Players in Room */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Players in Room ({players.length})
                  </h3>
                  <div className="space-y-2">
                    {players.length > 0 ? (
                      players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium">{player.username}</span>
                            {player.username === username && <span className="text-sm text-purple-600">(You)</span>}
                          </div>
                          {isHost && player.username === username && (
                            <span className="text-sm text-purple-600 font-medium">Host</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Waiting for players to join...
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleLeaveRoom}
                    variant="outline"
                    className="flex-1"
                  >
                    Leave Room
                  </Button>
                  
                  {isHost && (
                    <Button 
                      onClick={handleStartRace}
                      disabled={players.length < 1}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                    >
                      <FiPlay className="w-4 h-4 mr-2" />
                      Start Race
                    </Button>
                  )}
                </div>

                {/* Status Messages */}
                {!isConnected && (
                  <div className="text-center text-red-600 text-sm">
                    Connecting to server...
                  </div>
                )}
                
                {!isHost && players.length > 0 && (
                  <div className="text-center text-gray-600 text-sm">
                    Waiting for host to start the race...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Username Modal */}
        <UsernameModal
          isOpen={showUsernameModal}
          onClose={() => setShowUsernameModal(false)}
          onSuccess={handleUsernameSet}
        />
      </div>
    );
  }

  // Show race interface if connected to race
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <ConnectionStatus isConnected={isConnected} />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Race Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Private Room: {roomId}
              </h1>
              <p className="text-gray-600">
                {isHost ? 'You are the host' : 'Racing in private room'}
              </p>
            </div>
            <Button 
              onClick={handleLeaveRoom}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Leave Room
            </Button>
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
      </div>

      {/* Username Modal */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSuccess={handleUsernameSet}
      />
    </div>
  );
}
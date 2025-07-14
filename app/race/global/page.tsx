'use client';

import { useState, useEffect } from 'react';
import { useRaceStore } from '@/store/race.store';
import UsernameModal from '@/components/modals/UsernameModal';
import RaceStatus from '@/components/race/RaceStatus';
import TypingArea from '@/components/race/TypingArea';
import PlayersList from '@/components/race/PlayersList';
import RaceResults from '@/components/race/RaceResults';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiUsers, FiPlay } from 'react-icons/fi';

export default function GlobalRacePage() {
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const { 
    username, 
    raceId, 
    isConnected, 
    joinRace,
    leaveRace 
  } = useRaceStore();

  // Show username modal if no username is set
  useEffect(() => {
    if (!username && isConnected) {
      setShowUsernameModal(true);
    }
  }, [username, isConnected]);

  const handleJoinRace = () => {
    if (username) {
      joinRace(); // Join global race
    } else {
      setShowUsernameModal(true);
    }
  };

  const handleUsernameSet = () => {
    setShowUsernameModal(false);
    joinRace(); // Join global race after setting username
  };

  const handleLeaveRace = () => {
    leaveRace();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <ConnectionStatus isConnected={isConnected} />
      </div>

      <div className="container mx-auto px-4 py-8">
        {!raceId ? (
          /* Lobby/Join Race Section */
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Global Race
                </CardTitle>
                <p className="text-gray-600">
                  Compete with players worldwide in real-time typing races
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Username Display */}
                {username && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Playing as: {username}
                    </div>
                  </div>
                )}

                {/* Join Race Button */}
                <div className="text-center">
                  <Button 
                    onClick={handleJoinRace}
                    disabled={!isConnected}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 text-lg"
                  >
                    <FiPlay className="w-5 h-5 mr-2" />
                    {username ? 'Join Global Race' : 'Set Username & Join'}
                  </Button>
                </div>

                {/* Connection Status */}
                {!isConnected && (
                  <div className="text-center text-red-600 text-sm">
                    Connecting to server...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Race Interface */
          <div className="space-y-6">
            {/* Race Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Global Race</h1>
              <Button 
                onClick={handleLeaveRace}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Leave Race
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
        )}
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
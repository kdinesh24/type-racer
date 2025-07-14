'use client';

import { useSession } from 'next-auth/react';
import { useRaceStore } from '@/store/race.store';
import RaceStatus from '@/components/race/RaceStatus';
import TypingArea from '@/components/race/TypingArea';
import PlayersList from '@/components/race/PlayersList';
import RaceResults from '@/components/race/RaceResults';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { FiUsers, FiPlay } from 'react-icons/fi';
import { getUserDisplayName } from '@/lib/auth-utils';

export default function GlobalRacePage() {
  const { data: session } = useSession();
  const {
    raceId,
    isConnected,
    joinRace,
    leaveRace,
  } = useRaceStore();

  const username = getUserDisplayName(session);

  const handleJoinRace = () => {
    joinRace(username);
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

      <div className="container mx-auto px-4 py-8 space-y-6">
        {!raceId ? (
          /* Lobby / Join Race */
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600">
                <FiUsers className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Global Race
              </CardTitle>
              <CardDescription>
                Compete with players worldwide in real-time typing races
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Playing as {username}
                </span>
              </div>
              <div className="text-center">
                <Button
                  onClick={handleJoinRace}
                  disabled={!isConnected}
                  className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-3 text-lg text-white hover:from-green-600 hover:to-green-700"
                >
                  <FiPlay className="mr-2 h-5 w-5" />
                  Join Global Race
                </Button>
              </div>
              {!isConnected && (
                <p className="text-center text-sm text-red-600">
                  Connecting to server...
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Race Interface */
          <div className="space-y-6">
            {/* Header */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">
                  Global Race
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={handleLeaveRace}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Leave Race
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
    </div>
  );
}
'use client';

import { useRaceStore } from '@/store/race.store';
import { FiClock, FiPlay } from 'react-icons/fi';

export default function RaceStatus() {
  const { countdown, isRaceActive, raceId, players } = useRaceStore();

  // Connecting state
  if (!raceId) {
    return (
      <div className="py-8 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          Connecting to race...
        </div>
      </div>
    );
  }

  // Countdown before start
  if (countdown > 0) {
    return (
      <div className="py-8 flex flex-col items-center space-y-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
          <span className="text-4xl font-bold text-white">
            {countdown}
          </span>
        </div>
        <div className="text-2xl font-bold text-black dark:text-white">
          Race Starting Soon!
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Get ready to type...
        </div>
      </div>
    );
  }

  // Active race state
  if (isRaceActive) {
    return (
      <div className="py-8 flex flex-col items-center space-y-2">
        <div className="flex items-center gap-2 text-green-600">
          <FiPlay className="h-5 w-5" />
          <span className="text-xl font-bold text-black dark:text-white">
            Race in Progress
          </span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Type as fast and accurately as you can!
        </div>
      </div>
    );
  }

  // Waiting for players
  return (
    <div className="py-8 flex flex-col items-center space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900 shadow">
        <FiClock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="text-xl font-bold text-black dark:text-white">
        Waiting for Players
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {players.length < 2
          ? 'Need at least 2 players to start the race'
          : 'Race will start automatically'}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Race ID: <span className="font-mono font-semibold">{raceId}</span>
      </div>
    </div>
  );
}
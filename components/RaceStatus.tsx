'use client';

import { useRaceStore } from '@/lib/store';
import { FiClock, FiPlay } from 'react-icons/fi';

export default function RaceStatus() {
  const { countdown, isRaceActive, raceId, players } = useRaceStore();

  if (!raceId) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400">
          Connecting to race...
        </div>
      </div>
    );
  }

  if (countdown > 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center neon-glow">
          <div className="text-3xl font-bold text-white">
            {countdown}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Race Starting Soon!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Get ready to type...
        </p>
      </div>
    );
  }

  if (isRaceActive) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
          <FiPlay className="w-5 h-5" />
          <span className="font-semibold">Race in Progress</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Type as fast and accurately as you can!
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
        <FiClock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Waiting for Players
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {players.length < 2 ? 
          'Need at least 2 players to start the race' : 
          'Race will start automatically'
        }
      </p>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Race ID: <span className="font-mono font-semibold">{raceId}</span>
      </div>
    </div>
  );
}

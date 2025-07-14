'use client';

import { useSession } from 'next-auth/react';
import { useRaceStore } from '@/store/race.store';
import { Trophy } from 'lucide-react';
import { getUserDisplayName } from '@/lib/auth-utils';

export default function RaceResults() {
  const { data: session } = useSession();
  const { raceResults, resetRace, joinRace, leaveRace, requestRestart, isPrivateRoom } = useRaceStore();
  
  const username = getUserDisplayName(session);

  // Only show when there are actual race results
  if (!raceResults || raceResults.length === 0) return null;

  const handleNewRace = () => {
    console.log('Race restart button clicked - isPrivateRoom:', isPrivateRoom);
    if (isPrivateRoom) {
      // For private rooms, request restart (stay in same room)
      console.log('Requesting restart for private room');
      requestRestart();
    } else {
      // For global races, reset and join new race
      console.log('Resetting for new global race');
      resetRace();
      joinRace(username);
    }
  };

  const handleClose = () => {
    leaveRace();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Race Complete!</h2>
          <p className="text-gray-600 text-sm">Final results</p>
        </div>

        {/* Results */}
        <div className="space-y-3 mb-6">
          {raceResults.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{player.username}</div>
                  <div className="text-xs text-gray-500">
                    {Math.round(player.wpm)} WPM • {Math.round(player.accuracy)}% accuracy
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{Math.round(player.progress)}%</div>
                {player.finished && (
                  <div className="text-xs text-green-600">Finished</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleNewRace}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            {isPrivateRoom ? 'Race Again' : 'New Race'}
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}

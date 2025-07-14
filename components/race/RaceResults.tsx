'use client';

import { useRaceStore } from '@/store/race.store';
import { cn, getWPMColor, getAccuracyColor } from '@/lib/utils';
import { FiAward, FiRefreshCw, FiX } from 'react-icons/fi';

export default function RaceResults() {
  const { raceResults, resetRace, joinRace, leaveRace, requestRestart, isPrivateRoom } = useRaceStore();

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
      joinRace();
    }
  };

  const handleClose = () => {
    leaveRace();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto border border-gray-200 dark:border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FiAward className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Race Finished!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Here are the final results
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Results List */}
        <div className="space-y-4 mb-8">
          {raceResults.map((player, index) => (
            <div
              key={player.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                index === 0 && "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-600",
                index === 1 && "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 dark:from-gray-800/50 dark:to-slate-800/50 dark:border-gray-600",
                index === 2 && "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-600",
                index > 2 && "bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-600"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Position Badge */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg",
                  index === 0 && "bg-gradient-to-br from-yellow-400 to-orange-500 text-white",
                  index === 1 && "bg-gradient-to-br from-gray-400 to-gray-500 text-white",
                  index === 2 && "bg-gradient-to-br from-amber-400 to-yellow-500 text-white",
                  index > 2 && "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                )}>
                  {player.finished ? (index + 1) : 'DNF'}
                </div>
                
                {/* Player Info */}
                <div>
                  <div className="font-semibold text-lg text-gray-800 dark:text-white">
                    {player.username}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={cn(
                      "font-medium",
                      getWPMColor(player.wpm)
                    )}>
                      {Math.round(player.wpm)} WPM
                    </span>
                    <span className={cn(
                      "font-medium",
                      getAccuracyColor(player.accuracy)
                    )}>
                      {Math.round(player.accuracy)}% Accuracy
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress and Stats */}
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {Math.round(player.progress)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Completed
                </div>
                {player.finished && (
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                    Finished
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleNewRace}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <FiRefreshCw className="w-5 h-5" />
            {isPrivateRoom ? 'Race Again' : 'New Race'}
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}

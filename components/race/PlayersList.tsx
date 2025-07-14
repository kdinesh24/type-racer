'use client';

import { useRaceStore } from '@/store/race.store';
import { cn, getWPMColor, getAccuracyColor } from '@/lib/utils';
import { FiUsers, FiZap, FiTarget } from 'react-icons/fi';

export default function PlayersList() {
  const { players, isRaceActive } = useRaceStore();

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.finished && b.finished) {
      return a.position - b.position;
    }
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    return b.progress - a.progress;
  });

  return (
    <div className="glass-enhanced rounded-2xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <FiUsers className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800 font-display text-clean">
          Players ({players.length})
        </h2>
      </div>

      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <div
            key={`${player.id}-${player.username}-${index}`}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border transition-all",
              player.finished
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                player.finished
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
              )}>
                {player.finished ? player.position : index + 1}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {player.username}
                </div>
                {isRaceActive && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <FiZap className="w-3 h-3" />
                      <span className={getWPMColor(player.wpm)}>
                        {player.wpm} WPM
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiTarget className="w-3 h-3" />
                      <span className={getAccuracyColor(player.accuracy)}>
                        {player.accuracy}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isRaceActive && (
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Progress
                </div>
                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300 progress-bar",
                      player.finished
                        ? "bg-green-500"
                        : "bg-blue-500"
                    )}
                    style={{ width: `${Math.min(player.progress, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.round(player.progress)}%
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No players yet. Waiting for players to join...
        </div>
      )}
    </div>
  );
}

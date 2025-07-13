'use client';

import { useRaceStore } from '@/lib/store';
import { cn, getWPMColor, getAccuracyColor } from '@/lib/utils';
import { FiAward, FiRefreshCw } from 'react-icons/fi';

export default function RaceResults() {
  const { raceResults, resetRace, joinRace, leaveRace, requestRestart, isPrivateRoom } = useRaceStore();

  if (!raceResults || raceResults.length === 0) return null;

  // Sort results to ensure proper ranking
  const sortedResults = [...raceResults].sort((a, b) => {
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    if (a.finished && b.finished) return a.position - b.position;
    return b.progress - a.progress;
  });

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="perfect-glass-card rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto border border-gray-200 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiAward className="w-10 h-10 text-white" />
          </div>
          <h2 className="heading-secondary font-display text-gray-800 mb-2 text-clean tracking-tight">
            Race Complete!
          </h2>
          <p className="text-gray-600 font-body text-subtle">
            {sortedResults.filter(p => p.finished).length} of {sortedResults.length} players finished
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {sortedResults.map((player, index) => {
            // Calculate final position for display
            const displayPosition = player.finished ? player.position : 'DNF';
            const isCurrentUser = player.username === useRaceStore.getState().username;
            
            return (
              <div
                key={player.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border glass-enhanced transition-all duration-200",
                  isCurrentUser && "ring-2 ring-blue-500 bg-blue-50",
                  index === 0 && !isCurrentUser && "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200",
                  index === 1 && !isCurrentUser && "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200",
                  index === 2 && !isCurrentUser && "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200",
                  index > 2 && !isCurrentUser && "bg-gray-50 border-gray-200"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg",
                    isCurrentUser && "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
                    index === 0 && !isCurrentUser && "bg-gradient-to-br from-yellow-400 to-orange-500 text-white",
                    index === 1 && !isCurrentUser && "bg-gradient-to-br from-gray-400 to-gray-500 text-white",
                    index === 2 && !isCurrentUser && "bg-gradient-to-br from-amber-400 to-yellow-500 text-white",
                    index > 2 && !isCurrentUser && "bg-gray-300 text-gray-700"
                  )}>
                    {displayPosition}
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-gray-800 font-display flex items-center gap-2">
                      {player.username}
                      {isCurrentUser && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          You
                        </span>
                      )}
                      {index === 0 && player.finished && (
                        <FiAward className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-body">
                      <span className={getWPMColor(player.wpm)}>
                        {Math.round(player.wpm)} WPM
                      </span>
                      <span className={getAccuracyColor(player.accuracy)}>
                        {Math.round(player.accuracy)}% Accuracy
                      </span>
                      <span className="text-gray-500">
                        {Math.round(player.progress)}% Complete
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={cn(
                    "text-2xl font-bold font-display",
                    player.finished ? "text-green-600" : "text-gray-500"
                  )}>
                    {player.finished ? "✓" : "—"}
                  </div>
                  <div className="text-sm text-gray-500 font-body">
                    {player.finished ? "Finished" : "Incomplete"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleNewRace}
            className="flex-1 glass-button-premium text-gray-800 font-semibold transition-colors flex items-center justify-center gap-2 font-display"
          >
            <FiRefreshCw className="w-5 h-5" />
            {isPrivateRoom ? 'Race Again' : 'New Race'}
          </button>
          <button
            onClick={leaveRace}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-body backdrop-blur-sm"
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}

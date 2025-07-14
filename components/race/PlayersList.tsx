'use client';

import { useRaceStore } from '@/store/race.store';
import { cn, getWPMColor, getAccuracyColor } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Zap, Target } from 'lucide-react';

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
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black">
          <Users className="w-5 h-5" />
          Players ({players.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <div
            key={`${player.id}-${player.username}-${index}`}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border transition-all",
              player.finished
                ? "bg-white border-green-200"
                : "bg-white border-gray-200"
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
                <div className="font-semibold text-black">
                  {player.username}
                </div>
                {isRaceActive && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span className={getWPMColor(player.wpm)}>
                        {player.wpm} WPM
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
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
                <div className="text-sm text-black mb-1">
                  Progress
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      player.finished
                        ? "bg-green-500"
                        : "bg-blue-500"
                    )}
                    style={{ width: `${Math.min(player.progress, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-black mt-1">
                  {Math.round(player.progress)}%
                </div>
              </div>
            )}
          </div>
        ))}

        {players.length === 0 && (
          <div className="text-center py-8 text-black">
            No players yet. Waiting for players to join...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

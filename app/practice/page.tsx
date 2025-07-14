'use client';

import PracticeMode from '@/components/practice/PracticeMode';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import { useRaceStore } from '@/store/race.store';

export default function PracticePage() {
  const { isConnected } = useRaceStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <ConnectionStatus isConnected={isConnected} />
      </div>

      {/* Practice Mode Component */}
      <div className="container mx-auto px-4 py-8">
        <PracticeMode />
      </div>
    </div>
  );
}
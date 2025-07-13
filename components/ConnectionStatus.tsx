'use client';

import { useEffect, useState } from 'react';
import { FiWifi, FiWifiOff } from 'react-icons/fi';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export default function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    setShowStatus(true);
    
    if (isConnected) {
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (!showStatus) return null;

  return (
    <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
      isConnected 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }`}>
      {isConnected ? (
        <>
          <FiWifi className="w-4 h-4" />
          <span className="text-sm font-medium">Connected</span>
        </>
      ) : (
        <>
          <FiWifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Disconnected</span>
        </>
      )}
    </div>
  );
}

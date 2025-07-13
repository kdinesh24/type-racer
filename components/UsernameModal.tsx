'use client';

import { useState } from 'react';
import { useRaceStore } from '@/lib/store';
import { FiUser, FiPlay } from 'react-icons/fi';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UsernameModal({ isOpen, onClose, onSuccess }: UsernameModalProps) {
  const [inputUsername, setInputUsername] = useState('');
  const { setUsername, joinRace } = useRaceStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      setUsername(inputUsername.trim());
      if (onSuccess) {
        onSuccess();
      } else {
        joinRace();
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-black rounded-lg p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-8 h-8 text-black dark:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
            Enter Your Username
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a username to join the race
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="Your username"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-500"
              maxLength={20}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!inputUsername.trim()}
            className="w-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-white dark:text-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FiPlay className="w-5 h-5" />
            Join Race
          </button>
        </form>
      </div>
    </div>
  );
}

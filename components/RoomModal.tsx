'use client';

import { useState } from 'react';
import { FiX, FiPlus, FiHash, FiCopy } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (roomCode: string) => void;
  currentRoomCode?: string;
}

export default function RoomModal({ 
  isOpen, 
  onClose, 
  onCreateRoom, 
  onJoinRoom,
  currentRoomCode 
}: RoomModalProps) {
  const [action, setAction] = useState<'choose' | 'create' | 'join'>('choose');
  const [joinCode, setJoinCode] = useState('');

  if (!isOpen) return null;

  const handleCreateRoom = () => {
    onCreateRoom();
    setAction('create');
  };

  const handleJoinRoom = () => {
    if (joinCode.trim().length === 5) {
      onJoinRoom(joinCode.trim().toUpperCase());
    }
  };

  const copyRoomCode = () => {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode);
    }
  };

  const resetModal = () => {
    setAction('choose');
    setJoinCode('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Private Room
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {action === 'choose' ? 'Create or join a room' : 
               action === 'create' ? 'Room created successfully!' : 
               'Enter room code to join'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {action === 'choose' && (
            <div className="space-y-4">                <button
                  onClick={handleCreateRoom}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 rounded-xl transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                      <FiPlus className="w-6 h-6 text-black dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white">Create New Room</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Generate a room code to share with friends
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setAction('join')}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 rounded-xl transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                      <FiHash className="w-6 h-6 text-black dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-black dark:text-white">Join Existing Room</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter a room code from your friend
                      </p>
                    </div>
                  </div>
                </button>
            </div>
          )}

          {action === 'create' && currentRoomCode && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center mx-auto">
                <FiPlus className="w-8 h-8 text-black dark:text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white mb-2">
                  Room Created!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Share this code with your friends to join the race:
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-black dark:text-white">
                    {currentRoomCode}
                  </span>
                  <button
                    onClick={copyRoomCode}
                    className="p-2 rounded-lg bg-black dark:bg-white text-white dark:text-black transition-colors hover:bg-gray-800 dark:hover:bg-gray-200"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Waiting for players to join...
                </p>
              </div>
            </div>
          )}

          {action === 'join' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FiHash className="w-8 h-8 text-black dark:text-white" />
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white mb-2">
                  Join Private Room
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter the 5-character room code shared by your friend.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC12"
                  maxLength={5}
                  className={cn(
                    "w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg",
                    "bg-white dark:bg-black text-gray-900 dark:text-white",
                    "placeholder-gray-500 dark:placeholder-gray-500",
                    "focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                    "text-center text-lg font-mono tracking-wider"
                  )}
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setAction('choose')}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={joinCode.length !== 5}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2",
                    joinCode.length === 5
                      ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                      : "bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-600 cursor-not-allowed"
                  )}
                >
                  <FiHash className="w-4 h-4" />
                  Join Room
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

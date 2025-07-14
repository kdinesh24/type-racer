'use client';

import { useState } from 'react';
import { FiX, FiZap, FiUsers, FiPlus, FiHash, FiArrowRight } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface GameModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGlobalRace: () => void;
  onCreateRoom: (roomCode: string) => void;
  onJoinRoom: (roomCode: string) => void;
}

export default function GameModeModal({ 
  isOpen, 
  onClose, 
  onGlobalRace, 
  onCreateRoom, 
  onJoinRoom 
}: GameModeModalProps) {
  const [selectedMode, setSelectedMode] = useState<'global' | 'private' | null>(null);
  const [roomAction, setRoomAction] = useState<'create' | 'join' | null>(null);
  const [roomCode, setRoomCode] = useState('');

  if (!isOpen) return null;

  const handleGlobalRace = () => {
    onGlobalRace();
    onClose();
  };

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    setRoomCode(code);
    onCreateRoom(code);
    onClose();
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase());
      onClose();
    }
  };

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const resetModal = () => {
    setSelectedMode(null);
    setRoomAction(null);
    setRoomCode('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Choose Game Mode
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select how you want to play
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-6">
          {!selectedMode ? (
            /* Game Mode Selection */
            <div className="space-y-4">
              <button
                onClick={() => setSelectedMode('global')}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 rounded-xl transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiZap className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Global Race</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Join random players worldwide (up to 5 players)
                    </p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setSelectedMode('private')}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 rounded-xl transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Private Room</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Create or join a room to play with friends
                    </p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </button>
            </div>
          ) : selectedMode === 'global' ? (
            /* Global Race Confirmation */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto">
                <FiZap className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Ready for Global Race?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You&apos;ll be matched with up to 4 other players from around the world. 
                  The race will start when enough players join.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedMode(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleGlobalRace}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FiZap className="w-4 h-4" />
                  Join Race
                </button>
              </div>
            </div>
          ) : (
            /* Private Room Options */
            <div className="space-y-4">
              {!roomAction ? (
                <>
                  <button
                    onClick={() => setRoomAction('create')}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 rounded-xl transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <FiPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Create New Room</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Generate a room code to share with friends
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setRoomAction('join')}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 rounded-xl transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <FiHash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Join Existing Room</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enter a room code from your friend
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedMode(null)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Back to Game Modes
                  </button>
                </>
              ) : roomAction === 'create' ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto">
                    <FiPlus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Create Private Room
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      A unique room code will be generated for you to share with friends.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setRoomAction(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateRoom}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      Create Room
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FiHash className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Join Private Room
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Enter the 6-character room code shared by your friend.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room Code
                    </label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      maxLength={6}
                      className={cn(
                        "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg",
                        "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                        "placeholder-gray-500 dark:placeholder-gray-400",
                        "focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                        "text-center text-lg font-mono tracking-wider"
                      )}
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setRoomAction(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleJoinRoom}
                      disabled={roomCode.length !== 6}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2",
                        roomCode.length === 6
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <FiHash className="w-4 h-4" />
                      Join Room
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  FiX,
  FiZap,
  FiUsers,
  FiPlus,
  FiHash,
  FiArrowRight,
} from 'react-icons/fi';
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
  onJoinRoom,
}: GameModeModalProps) {
  const [selectedMode, setSelectedMode] = useState<'global' | 'private' | null>(null);
  const [roomAction, setRoomAction] = useState<'create' | 'join' | null>(null);
  const [roomCode, setRoomCode] = useState('');

  const resetModal = () => {
    setSelectedMode(null);
    setRoomAction(null);
    setRoomCode('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGlobal = () => {
    onGlobalRace();
    handleClose();
  };

  const handleCreate = () => {
    const code = generateRoomCode();
    setRoomCode(code);
    onCreateRoom(code);
    handleClose();
  };

  const handleJoin = () => {
    if (roomCode.trim().length === 6) {
      onJoinRoom(roomCode.trim().toUpperCase());
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-0">
        <Card>
          <DialogHeader className="flex items-center justify-between px-6 pt-6">
            <div>
              <DialogTitle>Choose Game Mode</DialogTitle>
              <DialogDescription>
                Select how you want to play
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <FiX />
            </Button>
          </DialogHeader>

          <CardContent className="space-y-6 px-6 pb-6">
            {!selectedMode ? (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-4 p-4"
                  onClick={() => setSelectedMode('global')}
                >
                  <div className="flex-none w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <FiZap className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Global Race
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Join random players worldwide (up to 5)
                    </div>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-400" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center gap-4 p-4"
                  onClick={() => setSelectedMode('private')}
                >
                  <div className="flex-none w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Private Room
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Create or join a room with friends
                    </div>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-400" />
                </Button>
              </div>
            ) : selectedMode === 'global' ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <FiZap className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Ready for Global Race?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You&apos;ll be matched with up to 4 other players from
                    around the world.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedMode(null)}
                  >
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleGlobal}>
                    <FiZap />
                    Join Race
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!roomAction ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-4 p-4"
                      onClick={() => setRoomAction('create')}
                    >
                      <div className="flex-none w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <FiPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Create New Room
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Generate a room code to share with friends
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-4 p-4"
                      onClick={() => setRoomAction('join')}
                    >
                      <div className="flex-none w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <FiHash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Join Existing Room
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Enter a room code from your friend
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedMode(null)}
                    >
                      Back to Game Modes
                    </Button>
                  </>
                ) : roomAction === 'create' ? (
                  <div className="space-y-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <FiPlus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Create Private Room
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        A unique room code will be generated for you to share.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setRoomAction(null)}
                      >
                        Back
                      </Button>
                      <Button className="flex-1" onClick={handleCreate}>
                        <FiPlus />
                        Create Room
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <FiHash className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Join Private Room
                    </h3>
                    <Input
                      value={roomCode}
                      onChange={(e) =>
                        setRoomCode(e.target.value.toUpperCase())
                      }
                      maxLength={6}
                      placeholder="ABC123"
                      className={cn(
                        'mx-auto w-full max-w-xs text-center font-mono tracking-widest'
                      )}
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setRoomAction(null)}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={roomCode.length !== 6}
                        onClick={handleJoin}
                      >
                        <FiHash />
                        Join Room
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
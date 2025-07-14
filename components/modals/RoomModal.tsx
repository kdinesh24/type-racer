'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FiX, FiPlus, FiHash, FiCopy } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (roomCode: string) => void;
  currentRoomCode?: string;
  initialAction?: 'choose' | 'create' | 'join';
}

export default function RoomModal({
  isOpen,
  onClose,
  onCreateRoom,
  onJoinRoom,
  currentRoomCode,
  initialAction = 'choose',
}: RoomModalProps) {
  const [action, setAction] = useState<'choose' | 'create' | 'join'>(initialAction);
  const [joinCode, setJoinCode] = useState('');

  // reset when opened
  useEffect(() => {
    if (isOpen) {
      setAction(initialAction);
      setJoinCode('');
    }
  }, [isOpen, initialAction]);

  const resetModal = () => {
    setAction('choose');
    setJoinCode('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleCreate = () => {
    onCreateRoom();
    setAction('create');
  };

  const handleJoin = () => {
    if (joinCode.trim().length === 5) {
      onJoinRoom(joinCode.trim().toUpperCase());
      resetModal();
    }
  };

  const copyCode = () => {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <DialogContent className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <DialogHeader className="flex items-start justify-between px-6 pt-6">
            <div>
              <DialogTitle>Private Room</DialogTitle>
              <DialogDescription>
                {action === 'choose'
                  ? 'Create or join a room'
                  : action === 'create'
                  ? 'Room created successfully!'
                  : 'Enter room code to join'}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <FiX />
            </Button>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
            {action === 'choose' && (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-4 p-4"
                  onClick={handleCreate}
                >
                  <div className="flex-none w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                    <FiPlus className="w-6 h-6 text-black dark:text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-black dark:text-white">
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
                  onClick={() => setAction('join')}
                >
                  <div className="flex-none w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                    <FiHash className="w-6 h-6 text-black dark:text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-black dark:text-white">
                      Join Existing Room
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Enter a room code from your friend
                    </div>
                  </div>
                </Button>
              </div>
            )}

            {action === 'create' && currentRoomCode && (
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center">
                  <FiPlus className="w-8 h-8 text-black dark:text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-black dark:text-white mb-2">
                    Room Created!
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mb-4">
                    Share this code with your friends:
                  </div>
                  <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                    <span className="font-mono text-2xl font-bold text-black dark:text-white">
                      {currentRoomCode}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyCode}
                    >
                      <FiCopy />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Waiting for players to join...
                  </div>
                </div>
              </div>
            )}

            {action === 'join' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center">
                    <FiHash className="w-8 h-8 text-black dark:text-white" />
                  </div>
                  <div className="text-lg font-bold text-black dark:text-white mb-2">
                    Join Private Room
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Enter the 5-character room code shared by your friend.
                  </div>
                </div>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABCDE"
                  maxLength={5}
                  className={cn(
                    'text-center text-lg font-mono tracking-widest'
                  )}
                  autoFocus
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setAction('choose')}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleJoin}
                    disabled={joinCode.length !== 5}
                  >
                    <FiHash className="w-4 h-4" />
                    Join Room
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
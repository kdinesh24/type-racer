'use client';

import { useState } from 'react';
import { useRaceStore } from '@/store/race.store';
import { FiUser, FiPlay } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
        // Don't automatically join a race - let the parent component handle what to do next
        // This prevents accidentally joining global races from private room pages
        console.log('Username set, but no onSuccess callback provided. Not auto-joining race.');
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-white border-gray-200 max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-8 h-8 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-black text-center">
            Enter Your Username
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-center">
            Choose a username to join the race
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-black">Username</Label>
            <Input
              id="username"
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="Enter your username"
              className="bg-white border-gray-300 text-black placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              maxLength={20}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={!inputUsername.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FiPlay className="w-5 h-5" />
            Join Race
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

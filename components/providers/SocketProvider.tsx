'use client';

import { useSocket } from '@/hooks/useSocket';

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  // Initialize socket connection once at the app level
  useSocket();

  return <>{children}</>;
}

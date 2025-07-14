'use client';

import NavigationGuard from "@/components/common/NavigationGuard";
import { Navbar } from "@/components/layout/Navbar";
import SocketProvider from "@/components/providers/SocketProvider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NavigationGuard />
      <SocketProvider>
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </SocketProvider>
    </div>
  );
}

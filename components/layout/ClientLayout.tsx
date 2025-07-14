'use client';

import NavigationGuard from "@/components/common/NavigationGuard";
import { Navbar } from "@/components/layout/Navbar";
import SocketProvider from "@/components/providers/SocketProvider";
import ReactScanProvider from "@/components/providers/ReactScanProvider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactScanProvider>
      <NavigationGuard />
      <SocketProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </SocketProvider>
    </ReactScanProvider>
  );
}

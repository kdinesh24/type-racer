'use client';

import { useEffect } from 'react';

export default function NavigationGuard() {
  useEffect(() => {
    // Ensure we're always on the correct port (3000 for Next.js)
    const ensureCorrectPort = () => {
      if (typeof window !== 'undefined') {
        const currentUrl = new URL(window.location.href);
        
        // If we're on port 5173 (Vite) or any wrong port, redirect to 3000 (Next.js)
        if (currentUrl.port === '5173' || 
            (currentUrl.hostname === 'localhost' && currentUrl.port !== '3000' && currentUrl.port !== '')) {
          const correctUrl = `${currentUrl.protocol}//${currentUrl.hostname}:3000${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
          console.warn(`Wrong port detected (${currentUrl.port}), redirecting to: ${correctUrl}`);
          window.location.href = correctUrl;
          return;
        }
      }
    };

    // Check immediately on mount
    ensureCorrectPort();

    // Also check on any hash changes or navigation events
    const handleHashChange = () => {
      ensureCorrectPort();
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return null; // This component doesn't render anything
}

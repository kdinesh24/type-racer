'use client';

import { useEffect } from 'react';

export default function ReactScanProvider({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('react-scan').then((ReactScan) => {
        ReactScan.scan({
          enabled: true,
          log: true
        });
        console.log('🔍 React Scan initialized');
      }).catch(() => {
        console.warn('React Scan failed to load');
      });
    }
  }, []);

  return <>{children}</>;
}

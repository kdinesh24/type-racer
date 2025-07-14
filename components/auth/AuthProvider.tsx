'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch session every 5 minutes instead of default 24h
      refetchOnWindowFocus={false} // Prevent unnecessary refetches on window focus
    >
      {children}
    </SessionProvider>
  )
}

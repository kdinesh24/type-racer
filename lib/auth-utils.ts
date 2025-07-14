import { Session } from 'next-auth'

// Extend the session user type to include our custom fields
interface ExtendedUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  username?: string | null
  bestWpm?: number
  bestAccuracy?: number
  totalRaces?: number
  totalWords?: number
}

interface ExtendedSession extends Session {
  user?: ExtendedUser
}

export function getUserDisplayName(session: ExtendedSession | null): string {
  if (!session?.user) {
    return 'Guest'
  }
  
  // Try username first, then name, then fallback to Guest
  if (session.user.username) {
    return session.user.username
  }
  
  if (session.user.name) {
    return session.user.name
  }
  
  return 'Guest'
}

export function isUserLoggedIn(session: ExtendedSession | null): boolean {
  return !!session?.user
}

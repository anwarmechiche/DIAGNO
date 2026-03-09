export interface SessionData {
  user: any
  type: 'client' | 'merchant'
  merchantId: string
  timestamp: number
}

export function saveSession(user: any, type: 'client' | 'merchant', merchantId: string): void {
  const sessionData: SessionData = {
    user,
    type,
    merchantId,
    timestamp: Date.now()
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('tradepro_session', JSON.stringify(sessionData))
  }
}

export function getSession(): SessionData | null {
  if (typeof window === 'undefined') return null
  
  try {
    const saved = localStorage.getItem('tradepro_session')
    if (!saved) return null
    
    const session = JSON.parse(saved) as SessionData
    
    // Check if session is expired (24 hours)
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('tradepro_session')
      return null
    }
    
    return session
  } catch {
    localStorage.removeItem('tradepro_session')
    return null
  }
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tradepro_session')
  }
}
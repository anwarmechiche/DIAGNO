'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClientDashboard from '@/components/Client/ClientDashboard'
import { getSession, clearSession } from '@/lib/auth-helpers'

export default function ClientDashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionData = getSession()
    
    // Vérification de sécurité : session existante ET type client
    if (!sessionData || sessionData.type !== 'client') {
      router.push('/')
      return
    }
    
    setSession(sessionData)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    clearSession()
    router.push('/')
  }

  // Écran de chargement assorti au thème (Noir en mode sombre, Blanc en mode clair)
  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">Initialisation...</p>
        </div>
      </div>
    )
  }

  return (
    /* Suppression du dégradé violet pour un fond neutre qui laisse le Dashboard respirer */
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <ClientDashboard 
        client={session.user} 
        merchantId={session.merchantId}
        onLogout={handleLogout}
      />
    </div>
  )
}
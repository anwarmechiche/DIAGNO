
'use client'
export const dynamic = 'force-dynamic'



import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Merchant/Sidebar'
import MerchantDashboard from '@/components/Merchant/MerchantDashboard'
import { getSession, clearSession } from '@/lib/auth-helpers'

export default function FournisseurPage() {
  const [session, setSession] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const data = getSession()
    if (!data) {
      // Si aucune session, on redirige vers l'accueil (app/page.tsx)
      router.push('/') 
    } else {
      setSession(data)
    }
  }, [router])

  // FONCTION DE DÉCONNEXION LOCALE
  const handleLogout = () => {
    clearSession() 
    // Redirige vers la racine (app/page.tsx) au lieu de /login
    router.push('/') 
  }

  if (!session) return <div className="bg-black h-screen" />

  return (
    <div className="flex h-screen bg-black overflow-hidden text-white font-sans">
      <Sidebar 
        user={session.user} 
        onLogout={handleLogout} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-black">
        <div className="p-4 lg:p-8">
          <MerchantDashboard 
            merchantId={session.merchantId} 
            user={session.user} 
          />
        </div>
      </main>
    </div>
  )
}
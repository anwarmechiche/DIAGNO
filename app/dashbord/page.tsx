'use client'

import { useEffect, useState } from 'react'
import { supabase } from "@/lib/supabase"
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Vérifier la session au chargement (Côté Client)
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        router.push('/auth/login')
      } else {
        setSession(session)
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  // Affichage pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Mon Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-semibold text-gray-900">Bienvenue</h2>
            <p className="text-gray-600 mt-2">Connecté en tant que : {session.user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
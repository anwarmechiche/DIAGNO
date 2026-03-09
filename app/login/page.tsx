'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/utils/supabase/client'
import { saveSession } from '@/lib/auth-helpers'

// Composant Button style "Supabase"
function Button({ children, onClick, disabled, type = 'button', variant = 'primary' }: any) {
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200",
    secondary: "bg-[#1c1c1c] text-white border border-[#333] hover:border-[#444]",
    test: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full font-medium py-2.5 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 ${variants[variant as keyof typeof variants]}`}
    >
      {children}
    </button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState('merchant')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [merchantId, setMerchantId] = useState('DiagnoSphere')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let user = null
      if (userType === 'merchant') {
        user = await db.loginMerchant(loginId, password)
        if (user) {
          saveSession(user, 'merchant', user.id)
          router.push('/fournisseur/dashboard')
        } else {
          setError('Identifiants fournisseur incorrects')
        }
      } else {
        // Connexion client avec merchantId fixé sur "DIAGNOSPHÈRE"
        user = await db.loginClient(loginId, password, merchantId)
        if (user) {
          saveSession(user, 'client', user.merchant_id)
          router.push('/client/dashboard')
        } else {
          setError('Identifiants invalides')
        }
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30">
      {/* Background Glow Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[1200px] rounded-full" />
      </div>

      <div className="w-full max-w-[650px] z-10">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-8">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#3ecf8e" stroke="#3ecf8e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-2xl font-bold tracking-tight">DIAGNOSPHÈRE</span>
          </div>
          <h1 className="text-2xl font-semibold mb-2 text-center">Connectez-vous à votre espace de gestion</h1>
          <p className="text-gray-400 text-sm text-center"></p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Sélecteur de Type de Compte Style IA */}
            <div className="space-y-3">
              <label className="block text-[30px] text-gray-400 mb-1.5 ml-1">
                Type de compte
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-[#111] border border-[#2e2e2e] rounded-xl relative overflow-hidden">
                
                {/* Bouton Fournisseur */}
                <button
                  type="button"
                  onClick={() => setUserType('merchant')}
                  className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 z-10 ${
                    userType === 'merchant' 
                      ? 'text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${userType === 'merchant' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
                  DIAGNOSPHÈRE
                  {userType === 'merchant' && (
                    <div className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-lg -z-10" />
                  )}
                </button>

                {/* Bouton Client */}
                <button
                  type="button"
                  onClick={() => setUserType('client')}
                  className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 z-10 ${
                    userType === 'client' 
                      ? 'text-white shadow-[0_0_50px_rgba(16,185,129,0.1)]' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${userType === 'client' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
                  Médecin
                  {userType === 'client' && (
                    <div className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-lg -z-10" />
                  )}
                </button>
              </div>
            </div>

            {/* Identifiant */}
            <div>
              <label className="block text-[19px] text-gray-400 mb-1.5 ml-1">Identifiant</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Votre identifiant"
                className="w-full bg-[#111] border border-[#2e2e2e] rounded-md px-3 py-2 text-sm placeholder:text-gray-600 focus:border-emerald-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-[20px] text-gray-400 mb-1.5 ml-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111] border border-[#2e2e2e] rounded-md px-3 py-2 text-sm placeholder:text-gray-600 focus:border-emerald-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Input caché pour MerchantID (utilisé uniquement pour le type client) */}
            <input type="hidden" value={merchantId} />

            {error && (
              <div className="text-red-500 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
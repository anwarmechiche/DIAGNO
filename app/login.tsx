'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/utils/supabase/client'
import { saveSession } from '@/lib/auth-helpers'
import { PushNotifications } from '@capacitor/push-notifications'

// Composant Button style "MedResolve"
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
  const [userType, setUserType] = useState('practitioner')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [practiceId, setPracticeId] = useState('')
  const [error, setError] = useState('')

  // --- CONFIGURATION NOTIFICATIONS PUSH ---
  useEffect(() => {
    const setupPush = async () => {
      try {
        let perm = await PushNotifications.checkPermissions();

        if (perm.receive === 'prompt') {
          perm = await PushNotifications.requestPermissions();
        }

        if (perm.receive === 'granted') {
          await PushNotifications.register();
        }

        PushNotifications.addListener('registration', (token) => {
          console.log('Enregistrement push réussi. Token:', token.value);
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('Erreur d\'enregistrement: ', err.error);
        });

      } catch (e) {
        console.log('Notifications non disponibles');
      }
    };

    setupPush();
  }, []);
  // ----------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let user = null
      if (userType === 'practitioner') {
        user = await db.loginPractitioner(loginId, password)
        if (user) {
          saveSession(user, 'practitioner', user.id)
          router.push('/praticien/dashboard')
        } else {
          setError('Identifiants praticien incorrects')
        }
      } else {
        user = await db.loginPatient(loginId, password, practiceId)
        if (user) {
          saveSession(user, 'patient', user.practice_id)
          router.push('/patient/dashboard')
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[400px] z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-8">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#3ecf8e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#3ecf8e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#3ecf8e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="2" fill="#3ecf8e"/>
            </svg>
            <span className="text-2xl font-bold tracking-tight">MedResolve</span>
          </div>
          <h1 className="text-2xl font-semibold mb-2 text-center">Espace de résolution médicale</h1>
          <p className="text-gray-400 text-sm text-center">Connectez-vous à votre espace de gestion</p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] text-gray-400 mb-1.5 ml-1">Type de compte</label>
              <select 
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full bg-[#111] border border-[#2e2e2e] rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="practitioner">Praticien</option>
                <option value="patient">Patient</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] text-gray-400 mb-1.5 ml-1">Identifiant</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Ex: PRAC001"
                className="w-full bg-[#111] border border-[#2e2e2e] rounded-md px-3 py-2 text-sm placeholder:text-gray-600 focus:border-emerald-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] text-gray-400 mb-1.5 ml-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111] border border-[#2e2e2e] rounded-md px-3 py-2 text-sm placeholder:text-gray-600 focus:border-emerald-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {userType === 'patient' && (
              <div>
                <label className="block text-[13px] text-gray-400 mb-1.5 ml-1">ID Cabinet médical</label>
                <input
                  type="text"
                  value={practiceId}
                  onChange={(e) => setPracticeId(e.target.value)}
                  placeholder="ID de votre praticien"
                  className="w-full bg-[#111] border border-[#2e2e2e] rounded-md px-3 py-2 text-sm placeholder:text-gray-600 focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            )}

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

        <div className="mt-8 pt-6 border-t border-[#1f1f1f]">
          <p className="text-[#3ecf8e] text-xs font-medium mb-4 uppercase tracking-widest text-center">Environnement de test</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
             <div className="p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
                <p className="text-[11px] text-gray-500 mb-1 uppercase">Praticien</p>
                <p className="text-xs font-mono text-gray-300">ID: PRAC001</p>
             </div>
             <div className="p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
                <p className="text-[11px] text-gray-500 mb-1 uppercase">Patient</p>
                <p className="text-xs font-mono text-gray-300">ID: PAT001</p>
             </div>
          </div>
          <Button variant="test" onClick={() => {/* Initialiser données test */}}>
             Initialiser la base de données
          </Button>
        </div>
      </div>
    </div>
  )
}
// components/ui/PwdIdButton.tsx
'use client'

import { useState, useEffect } from 'react'

interface PwdIdButtonProps {
  client: any
  onSendEmail?: (data: any) => Promise<void>
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'full'
}

export default function PwdIdButton({ 
  client, 
  onSendEmail, 
  className = '',
  size = 'md',
  variant = 'icon'
}: PwdIdButtonProps) {
  const [showModal, setShowModal] = useState(false)

  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg'
  }

  if (variant === 'full') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 bg-white/90 hover:bg-white text-slate-800 border border-slate-200/50 rounded-lg transition-all shadow-md ${sizeClasses[size]} ${className}`}
        >
          <span className="text-amber-600">🔐</span>
          <span>Identifiants</span>
        </button>
        {showModal && (
          <GlassCredentialsModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            client={client}
            onSendEmail={onSendEmail}
          />
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`relative group rounded-lg transition-all hover:scale-110 ${sizeClasses[size]} ${className}`}
        title="Voir identifiants"
      >
        <span className="absolute inset-0 rounded-lg bg-white/90 border border-slate-200/50 shadow-sm" />
        <span className="relative text-amber-600 text-lg">
          🔐
        </span>
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Identifiants
        </span>
      </button>

      {showModal && (
        <GlassCredentialsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          client={client}
          onSendEmail={onSendEmail}
        />
      )}
    </>
  )
}

function GlassCredentialsModal({ isOpen, onClose, client, onSendEmail }) {
  const [copiedField, setCopiedField] = useState(null)
  const [sending, setSending] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!isOpen || !client || !mounted) return null

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Erreur de copie:', err)
    }
  }

  const handleSendEmail = async () => {
    if (!client.email) {
      alert('❌ Aucun email renseigné')
      return
    }
    if (!onSendEmail) {
      alert('❌ Fonction d\'envoi non disponible')
      return
    }
    
    setSending(true)
    try {
      await onSendEmail({
        to: client.email,
        subject: `🔐 Vos identifiants - ${client.name}`,
        body: `Bonjour ${client.name},\n\nID: ${client.client_id}\nMot de passe: ${client.password || 'Non défini'}`
      })
    } catch (error) {
      console.error('Erreur d\'envoi:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      {/* Modal principal */}
      <div 
        className="relative w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Contenu avec fond blanc semi-transparent */}
        <div 
          className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden"
          style={{
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}
        >
          <div className="relative p-6">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl text-amber-700">🔐</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Identifiants
                  </h3>
                  <p className="text-sm text-slate-500">
                    {client.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            {/* Cartes d'informations */}
            <div className="space-y-3">
              {/* ID Client */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1">IDENTIFIANT</div>
                    <div className="text-lg font-mono font-semibold text-slate-800">
                      {client.client_id}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(client.client_id, 'ID')}
                    className={`p-2 rounded-lg transition-all ${
                      copiedField === 'ID' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {copiedField === 'ID' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-medium text-amber-600 mb-1">MOT DE PASSE</div>
                    <div className="text-lg font-mono font-semibold text-amber-800">
                      {client.password || 'Non défini'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(client.password || '', 'Mot de passe')}
                    className={`p-2 rounded-lg transition-all ${
                      copiedField === 'Mot de passe' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-white border border-amber-200 text-amber-600 hover:bg-amber-100'
                    }`}
                  >
                    {copiedField === 'Mot de passe' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              {/* Email (si présent) */}
              {client.email && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-1">EMAIL</div>
                      <div className="text-base text-slate-700">
                        {client.email}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(client.email, 'Email')}
                      className={`p-2 rounded-lg transition-all ${
                        copiedField === 'Email' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {copiedField === 'Email' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <button
                onClick={() => handleCopy(`ID: ${client.client_id}\nMot de passe: ${client.password || ''}`, 'Tout')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all font-medium shadow-sm"
              >
                <span>📋</span>
                <span>Copier tous les identifiants</span>
              </button>
              
              {client.email && onSendEmail && (
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>✉️</span>
                      <span>Envoyer par email</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-3 px-4 transition-all font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
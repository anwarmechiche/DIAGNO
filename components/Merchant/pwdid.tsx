import { useState } from 'react'
import { toast } from 'react-hot-toast'

const GlassCredentialsModal = ({ isOpen, onClose, client, onSendEmail }) => {
  const [copiedField, setCopiedField] = useState(null)
  const [sending, setSending] = useState(false)

  if (!isOpen || !client) return null

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success(`✅ ${field} copié!`, {
        icon: '📋',
        style: {
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          color: '#1e293b',
          border: '1px solid rgba(255,255,255,0.3)'
        }
      })
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      toast.error('Erreur de copie')
    }
  }

  const handleCopyAll = async () => {
    const allText = `IDENTIFIANTS ${client.name}\n\nID: ${client.client_id}\nMot de passe: ${client.password || 'Non défini'}\nEmail: ${client.email || 'Non renseigné'}`
    await handleCopy(allText, 'Tout')
  }

  const handleSendEmail = async () => {
    if (!client.email) {
      toast.error('❌ Aucun email renseigné pour ce client')
      return
    }

    setSending(true)
    try {
      await onSendEmail({
        to: client.email,
        subject: `🔐 Vos identifiants - ${client.name}`,
        body: `Bonjour ${client.name},\n\nVoici vos identifiants d'accès :\n\nID: ${client.client_id}\nMot de passe: ${client.password || 'Non défini'}\n\nCordialement,\nVotre équipe`
      })
      toast.success(`📧 Email envoyé à ${client.email}`, {
        icon: '✉️',
        duration: 4000
      })
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setSending(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn"
      style={{ 
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      {/* Goutte d'eau animée */}
      <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
        style={{ top: '10%', left: '20%' }}
      />
      <div className="absolute w-80 h-80 bg-gradient-to-br from-amber-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
        style={{ bottom: '10%', right: '20%', animationDelay: '1s' }}
      />
      
      {/* Modal Glassmorphisme */}
      <div 
        className="relative w-full max-w-md mx-4 animate-waterDrop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Effet de reflet */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl pointer-events-none" />
        
        {/* Contenu principal */}
        <div className="relative backdrop-blur-xl bg-white/30 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {/* En-tête avec effet de lumière */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          
          <div className="p-8">
            {/* Titre avec icône */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl filter drop-shadow-lg">🔐</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">
                    Identifiants
                  </h3>
                  <p className="text-sm text-white/80 drop-shadow">
                    {client.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all backdrop-blur-sm"
              >
                ✕
              </button>
            </div>

            {/* Cartes d'informations */}
            <div className="space-y-4">
              {/* ID Client */}
              <div className="group relative backdrop-blur-sm bg-white/20 rounded-2xl p-5 border border-white/30 hover:bg-white/30 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-medium text-white/70 mb-1">🆔 ID Client</div>
                    <div className="text-xl font-mono font-bold text-white drop-shadow-lg">
                      {client.client_id}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(client.client_id, 'ID')}
                    className={`p-2 rounded-xl transition-all ${
                      copiedField === 'ID' 
                        ? 'bg-green-500/50 text-white' 
                        : 'bg-white/20 hover:bg-white/30 text-white/80'
                    }`}
                  >
                    {copiedField === 'ID' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="group relative backdrop-blur-sm bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-5 border border-white/30 hover:from-amber-500/30 hover:to-orange-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-medium text-white/70 mb-1">🔑 Mot de passe</div>
                    <div className="text-xl font-mono font-bold text-white drop-shadow-lg">
                      {client.password || 'Non défini'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(client.password || '', 'Mot de passe')}
                    className={`p-2 rounded-xl transition-all ${
                      copiedField === 'Mot de passe' 
                        ? 'bg-green-500/50 text-white' 
                        : 'bg-white/20 hover:bg-white/30 text-white/80'
                    }`}
                  >
                    {copiedField === 'Mot de passe' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              {/* Email */}
              {client.email && (
                <div className="group relative backdrop-blur-sm bg-white/20 rounded-2xl p-5 border border-white/30 hover:bg-white/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium text-white/70 mb-1">📧 Email</div>
                      <div className="text-base font-medium text-white drop-shadow">
                        {client.email}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(client.email, 'Email')}
                      className={`p-2 rounded-xl transition-all ${
                        copiedField === 'Email' 
                          ? 'bg-green-500/50 text-white' 
                          : 'bg-white/20 hover:bg-white/30 text-white/80'
                      }`}
                    >
                      {copiedField === 'Email' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {/* Copier tout */}
              <button
                onClick={handleCopyAll}
                className="w-full backdrop-blur-sm bg-white/20 hover:bg-white/30 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-white font-medium border border-white/30 transition-all group"
              >
                <span className="text-lg">📋</span>
                <span>Copier tous les identifiants</span>
                <span className="text-xs text-white/60 group-hover:translate-x-1 transition-transform">→</span>
              </button>

              {/* Envoyer par email (si email existe) */}
              {client.email && (
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="w-full backdrop-blur-sm bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/40 hover:to-purple-500/40 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-white font-medium border border-white/30 transition-all disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">✉️</span>
                      <span>Envoyer par email à {client.email}</span>
                    </>
                  )}
                </button>
              )}

              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="w-full backdrop-blur-sm bg-white/10 hover:bg-white/20 rounded-xl py-3 px-4 text-white/80 hover:text-white transition-all border border-white/20"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes waterDrop {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-waterDrop {
          animation: waterDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

// Fonction principale à intégrer dans votre composant
const handleShowCredentials = (client) => {
  setSelectedClient(client)
  setShowGlassModal(true)
}

// Fonction pour envoyer l'email (à implémenter avec votre API)
const handleSendEmail = async ({ to, subject, body }) => {
  // Implémentez ici votre logique d'envoi d'email
  // Par exemple avec une API route Next.js
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, body })
  })
  
  if (!response.ok) throw new Error('Failed to send email')
  return response.json()
}

// Dans votre JSX, ajoutez le modal
{showGlassModal && (
  <GlassCredentialsModal
    isOpen={showGlassModal}
    onClose={() => setShowGlassModal(false)}
    client={selectedClient}
    onSendEmail={handleSendEmail}
  />
)}
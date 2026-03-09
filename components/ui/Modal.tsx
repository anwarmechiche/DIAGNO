'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  children,
  size = 'md' 
}: ModalProps) {
  
  // BLOQUER LE SCROLL DE FORCE
  useEffect(() => {
    if (isOpen) {
      // 🔥 FORCER LE BLOCAGE - PLUS RIEN NE BOUGE
      const scrollY = window.scrollY
      
      // Bloquer TOUS les éléments qui peuvent scroller
      document.documentElement.style.overflow = 'hidden'
      document.documentElement.style.height = '100vh'
      document.documentElement.style.position = 'fixed'
      document.documentElement.style.top = `-${scrollY}px`
      document.documentElement.style.left = '0'
      document.documentElement.style.right = '0'
      document.documentElement.style.width = '100%'
      
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      
      // 🔥 Éviter les rebounds sur mobile
      document.body.style.touchAction = 'none'
      document.documentElement.style.touchAction = 'none'
      
    } else {
      // Restaurer le scroll
      const top = document.documentElement.style.top || document.body.style.top
      
      document.documentElement.style.overflow = ''
      document.documentElement.style.height = ''
      document.documentElement.style.position = ''
      document.documentElement.style.top = ''
      document.documentElement.style.left = ''
      document.documentElement.style.right = ''
      document.documentElement.style.width = ''
      document.documentElement.style.touchAction = ''
      
      document.body.style.overflow = ''
      document.body.style.height = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.touchAction = ''
      
      if (top) {
        window.scrollTo(0, parseInt(top || '0') * -1)
      }
    }

    return () => {
      // Nettoyage complet
      document.documentElement.style.overflow = ''
      document.documentElement.style.height = ''
      document.documentElement.style.position = ''
      document.documentElement.style.top = ''
      document.documentElement.style.left = ''
      document.documentElement.style.right = ''
      document.documentElement.style.width = ''
      document.documentElement.style.touchAction = ''
      
      document.body.style.overflow = ''
      document.body.style.height = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.touchAction = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  // Tailles du modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95%] md:max-w-4xl'
  }

  return (
    <>
      {/* Overlay avec z-index TRÈS élevé */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 999999,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal - CENTRAGE PARFAIT */}
      <div 
        className="fixed bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95%',
          maxWidth: size === 'sm' ? '400px' : 
                   size === 'md' ? '600px' : 
                   size === 'lg' ? '900px' : 
                   size === 'xl' ? '1200px' : '95%',
          maxHeight: '85vh',
          zIndex: 1000000,
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            {icon && <span className="text-xl">{icon}</span>}
            <h2 className="text-lg font-bold truncate">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content scrollable - UNIQUEMENT ICI */}
        <div 
          className="p-6 "
          style={{ maxHeight: 'calc(85vh - 0px)' }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
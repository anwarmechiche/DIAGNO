import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
}

export default function Toast({ message, type = 'info', duration = 3500, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 250)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const typeClasses = {
    success: 'border-success bg-gradient-to-br from-green-50 to-white',
    error: 'border-danger bg-gradient-to-br from-red-50 to-white',
    warning: 'border-warning bg-gradient-to-br from-yellow-50 to-white',
    info: 'border-primary bg-gradient-to-br from-blue-50 to-white'
  }

  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  }

  if (!isVisible) return null

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl border-2 shadow-xl ${typeClasses[type]} animate-slideInRight`}>
      <span className="text-xl font-bold">{icons[type]}</span>
      <span className="font-medium text-dark">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onClose?.(), 250)
        }}
        className="ml-4 w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
      >
        ×
      </button>
    </div>
  )
}
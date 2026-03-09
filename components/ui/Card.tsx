'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  const hoverClass = hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : ''
  
  return (
    <div className={`bg-white/95 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg ${hoverClass} ${className}`}>
      {children}
    </div>
  )
}
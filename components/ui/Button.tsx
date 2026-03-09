'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  loading?: boolean
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  loading,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    success: 'bg-success text-white hover:bg-success-dark',
    danger: 'bg-danger text-white hover:bg-danger-dark',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg'
  }

  // Extrayez 'loading' des props pour ne pas le passer au DOM

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${loading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
        ${className}
      `}
      disabled={loading || disabled}
      {...props} // Utilisez restProps au lieu de props
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          Chargement...
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}
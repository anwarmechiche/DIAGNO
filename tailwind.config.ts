/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'primary-dark': '#4f46e5',
        'primary-light': '#818cf8',
        secondary: '#8b5cf6',
        'secondary-dark': '#7c3aed',
        accent: '#ec4899',
        success: '#10b981',
        'success-light': '#34d399',
        warning: '#f59e0b',
        danger: '#ef4444',
        dark: '#0f172a',
        'dark-900': '#1e293b',
        'dark-800': '#334155',
        light: '#ffffff',
        'gray-50': '#f8fafc',
        'gray-100': '#f1f5f9',
        'gray-200': '#e2e8f0',
        'gray-300': '#cbd5e1',
        'gray-400': '#94a3b8',
        'gray-500': '#64748b',
        'gray-600': '#475569',
      },
      borderRadius: {
        'sm': '8px',
        'DEFAULT': '12px',
        'lg': '16px',
        'xl': '20px',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(15, 23, 42, 0.05)',
        'DEFAULT': '0 4px 12px rgba(15, 23, 42, 0.08)',
        'md': '0 8px 24px rgba(15, 23, 42, 0.12)',
        'lg': '0 16px 48px rgba(15, 23, 42, 0.16)',
        'xl': '0 24px 64px rgba(15, 23, 42, 0.24)',
      },
    },
  },
  plugins: [],
}
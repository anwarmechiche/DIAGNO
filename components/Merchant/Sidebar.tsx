'use client'

interface SidebarProps {
  user: any
  onLogout: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Sidebar({ 
  user, 
  onLogout, 
  isOpen, 
  setIsOpen, 
  activeTab, 
  setActiveTab 
}: SidebarProps) {

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'products', label: 'Produits', icon: '📦' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'orders', label: 'Commandes', icon: '🛒' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' },
  ]

  const handleNavigation = (id: string) => {
    // Sécurité pour éviter l'erreur runtime si la prop est absente
    if (typeof setActiveTab === 'function') {
      setActiveTab(id);
    }
    // Ferme toujours sur mobile après un clic
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* BOUTON MENU (Visible uniquement si sidebar fermée) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[60] w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-2xl border border-white/10"
        >
          <span className="text-white text-lg">☰</span>
        </button>
      )}

      {/* OVERLAY SOMBRE (Mobile uniquement) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR - Complètement cachée à gauche si !isOpen */}
      <aside className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out border-r border-white/5 bg-[#050505] flex flex-col
        ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center text-sm">
              🏪
            </div>
            <span className="font-bold text-white tracking-tight">
              Trade<span className="text-emerald-500">Pro</span>
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center px-3 py-2.5 gap-3 rounded-lg transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium text-[13px]">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <div className="p-2 bg-white/5 rounded-lg flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <p className="text-xs font-semibold text-gray-200 truncate">{user?.name || 'Admin'}</p>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:bg-red-500/5 font-medium text-[13px] rounded-lg transition-colors"
          >
            <span>🚪</span>
            <span>Quitter</span>
          </button>
        </div>
      </aside>
    </>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ProductForm from '@/components/Merchant/ProductForm'
import ClientForm from '@/components/Merchant/ClientForm'
import OrdersPage from './OrdersPage'
import { db } from '@/utils/supabase/client'
import MerchantSettingsTab from '@/components/Merchant/MerchantSettingsTab'
import { Product, Client, Order } from '@/utils/supabase/types'
import StatBI from './StatBI'  // Le fichier que tu veux importer
import PwdIdButton from '@/components/ui/PwdIdButton'
import CompanyInfoForm from './CompanyInfoForm'

interface MerchantDashboardProps {
  merchantId: string
  user: any
}

export default function MerchantDashboard({ merchantId, user }: MerchantDashboardProps) {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    products: 0,
    clients: 0,
    orders: 0,
    revenue: 0
  })
  const [statBIModalOpen, setStatBIModalOpen] = useState(false)
  // États pour les modales
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [viewProductModalOpen, setViewProductModalOpen] = useState(false)
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [viewClientModalOpen, setViewClientModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  
  useEffect(() => {
    if (merchantId) {
      loadData()
    }
  }, [merchantId])

  const loadData = async () => {
    setLoading(true)
    try {
      console.log('Chargement des données pour merchantId:', merchantId)
      
      const [productsData, clientsData, ordersData] = await Promise.all([
        db.getProducts(merchantId),
        db.getClients(merchantId),
        db.getOrders(merchantId)
      ])

      console.log('Données récupérées:', {
        produits: productsData.length,
        clients: clientsData.length,
        commandes: ordersData.length
      })

      setProducts(productsData)
      setClients(clientsData)
      setOrders(ordersData)

      // Calculate stats
      const revenue = ordersData.reduce((total, order) => {
        const product = productsData.find(p => p.id === order.product_id)
        return total + (order.quantity * (product?.price || 0))
      }, 0)

      setStats({
        products: productsData.length,
        clients: clientsData.length,
        orders: ordersData.length,
        revenue
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(value)
  }

  // Fonctions pour les produits
  const handleViewProduct = async (productId: string) => {
    try {
      console.log('Visualisation produit ID:', productId)
      const product = await db.getProductById(productId)
      if (product) {
        setSelectedProduct(product)
        setViewProductModalOpen(true)
      } else {
        alert('❌ Produit non trouvé')
      }
    } catch (error) {
      console.error('Error viewing product:', error)
      alert('❌ Erreur lors du chargement du produit')
    }
  }

  const handleEditProduct = async (productId: string) => {
    try {
      console.log('Édition produit ID:', productId)
      const product = await db.getProductById(productId)
      if (product) {
        setSelectedProduct(product)
        setProductModalOpen(true)
      } else {
        alert('❌ Produit non trouvé')
      }
    } catch (error) {
      console.error('Error editing product:', error)
      alert('❌ Erreur lors du chargement du produit')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        const success = await db.deleteProduct(productId)
        if (success) {
          alert('✅ Produit supprimé avec succès')
          await loadData()
        } else {
          alert('❌ Erreur lors de la suppression du produit')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('❌ Erreur lors de la suppression du produit')
      }
    }
  }

  const handleProductSubmit = async (productData: any) => {
    if (!merchantId) {
      alert("❌ Erreur : Aucun marchand identifié. Veuillez vous reconnecter.")
      return
    }

    console.log("1. Début soumission pour le fournisseur ID:", merchantId)
    
    try {
      const payload = {
        name: productData.name,
        price: parseFloat(productData.price) || 0,
        description: productData.description || "",
        active: productData.active ?? true,
        image: productData.image,
		provenance: productData.provenance,
		expiration_date:productData.expiration_date,
		volume_ml:productData.volume_ml,
		supplier: productData.supplier,
		reference_code: productData.reference_code,
		lot_number: productData.lot_number,
		ref: productData.ref,
		supplier: productData.supplier,
        merchant_id: merchantId 
      }

      console.log("2. Payload envoyé à Supabase:", payload)

      const result = await db.createProduct(payload)

      if (result) {
        console.log("3. ✅ Succès stockage dans la BDD:", result)
        alert('✅ Produit enregistré avec succès!')
        setProductModalOpen(false)
        setSelectedProduct(null)
        await loadData()
      } else {
        console.error("3. ❌ Le résultat est vide.")
        alert('❌ Erreur lors de l\'enregistrement')
      }
    } catch (error: any) {
      console.error("3. ❌ ERREUR CRITIQUE:", error)
      alert(`❌ Erreur de stockage: ${error.message}`)
    }
  }

  // Fonctions pour les clients
  const handleViewClient = async (clientId: string) => {
    try {
      console.log('Visualisation client ID:', clientId)
      const client = await db.getClientById(clientId)
      if (client) {
        setSelectedClient(client)
        setViewClientModalOpen(true)
      } else {
        alert('❌ Client non trouvé')
      }
    } catch (error) {
      console.error('Error viewing client:', error)
      alert('❌ Erreur lors du chargement du client')
    }
  }

  const handleEditClient = async (clientId: string) => {
    try {
      console.log('Édition client ID:', clientId)
      const client = await db.getClientById(clientId)
      if (client) {
        setSelectedClient(client)
        setClientModalOpen(true)
      } else {
        alert('❌ Client non trouvé')
      }
    } catch (error) {
      console.error('Error editing client:', error)
      alert('❌ Erreur lors du chargement du client')
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        alert('⚙️ Fonction de suppression en cours d\'implémentation')
        await loadData()
      } catch (error) {
        console.error('Error deleting client:', error)
        alert('❌ Erreur lors de la suppression du client')
      }
    }
  }
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result + Math.floor(Math.random() * 10); // Ajoute un chiffre à la fin
}
const handleClientSubmit = async (clientData: Partial<Client>) => {
  setLoading(true) // Optionnel: pour montrer un spinner
  try {
    // Préparation commune des données (Mapping BDD)
    const formattedData = {
      ...clientData,
      merchant_id: Number(merchantId),
  password: clientData.password || generateRandomPassword(),
      show_qty: clientData.show_quantity ?? true, // Mapping vers ta colonne show_qty
      credit_limit: parseFloat(String(clientData.credit_limit)) || 0,
    }

    if (selectedClient) {
      // MODE MODIFICATION
      await db.updateClient(selectedClient.id, formattedData)
      alert('✅ Client mis à jour')
    } else {
      // MODE CRÉATION - ON UTILISE L'OBJET DB MAINTENANT
      await db.createClient(formattedData) 
      alert('✅ Client créé avec succès')
    }

    // Actions après succès
    setClientModalOpen(false)
    setSelectedClient(null)
    await loadData() // Recharge la liste

  } catch (error: any) {
    console.error('Error saving client:', error)
    alert(`❌ Erreur: ${error.message || 'Problème de connexion'}`)
  } finally {
    setLoading(false)
  }
}

  // Filtrer les produits
// États pour les filtres
const [selectedProvenances, setSelectedProvenances] = useState([]);
const [selectedSuppliers, setSelectedSuppliers] = useState([]);
const [selectedVolumes, setSelectedVolumes] = useState([]);
const [selectedNames, setSelectedNames] = useState([]);

// Options uniques pour les filtres
const uniqueProvenances = [...new Set(products.map(p => p.provenance).filter(Boolean))];
const uniqueSuppliers = [...new Set(products.map(p => p.supplier).filter(Boolean))];
const uniqueVolumes = [...new Set(products.map(p => p.volume_ml).filter(Boolean))];
const uniqueNames = [...new Set(products.map(p => p.name).filter(Boolean))];
// Dans votre composant

// Filtrer les produits
const filteredProducts = products.filter(p => {
  // Filtre par provenance
  if (selectedProvenances.length > 0 && !selectedProvenances.includes(p.provenance)) {
    return false;
  }
  
  // Filtre par fournisseur
  if (selectedSuppliers.length > 0 && !selectedSuppliers.includes(p.supplier)) {
    return false;
  }
  
  // Filtre par volume
  if (selectedVolumes.length > 0 && !selectedVolumes.includes(p.volume_ml)) {
    return false;
  }
  
  // Filtre par nom
  if (selectedNames.length > 0 && !selectedNames.includes(p.name)) {
    return false;
  }
  
  return true;
});

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Premium */}
      <Card className="p-8 bg-gradient-to-br from-white via-blue-500/30 to-white border-2 border-blue-100/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-blue-700 to-blue-900 rounded-2xl flex items-center justify-center text-white text-5xl shadow-2xl shadow-blue-600/30 transform group-hover:scale-105 transition-transform duration-300">
              🏢
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30 animate-fade-in">
                ⭐ Administrateur des ventes
              </div>
              <div className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Compte Actif
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
              {user?.name || 'Société'}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold border-2 border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-blue-300">
                <span className="text-lg">🆔</span> 
                <span className="text-slate-600">ID:</span>
                <code className="text-blue-600 font-mono">{user?.merchant_id}</code>
              </div>
              
              <button
  onClick={() => setStatBIModalOpen(true)}
  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 animate-pulse"
>
  <span>📊</span> Statistiques BI
</button>
			  
            </div>
          </div>
		  
        </div>
        
        <div className="flex flex-wrap items-center justify-between pt-6 border-t-2 border-slate-100">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
              <span>👤</span> 
              <span className="font-semibold">{user?.name}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
              <span>📧</span> 
              <span className="font-medium">{user?.email || 'contact@merchant.dz'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 lg:mt-0">
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm text-xs font-bold text-slate-600">
              🕐 Dernière connexion: {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation - Modern Design */}
      <Card className="p-6 shadow-xl border-2 border-slate-100">
        <div className="flex flex-wrap gap-3 mb-8 bg-slate-50 p-2 rounded-2xl">
          {[
            { id: 'products', label: 'Produits', icon: '⚗️', color: 'blue' },
            { id: 'clients', label: 'Clients', icon: '👥', color: 'green' },
            { id: 'orders', label: 'Commandes', icon: '🛒', color: 'yellow' },
            { id: 'settings', label: 'Paramètres', icon: '⚙️', color: 'slate' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-md'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Button 
                icon={<span>➕</span>}
                onClick={() => {
                  setSelectedProduct(null)
                  setProductModalOpen(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:scale-105 transition-all"
              >
                Ajouter un produit
              </Button>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium"
                  />
                </div>
              </div>
            </div>
    <div style={{ 
  marginBottom: '30px',
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
}}>
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: '20px'
  }}>
    <h3 style={{ 
      margin: 0,
      color: '#1e293b',
      fontSize: '1.25rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
      </svg>
      Filtres
    </h3>
    
    {/* Indicateur de filtres actifs */}
    {(selectedProvenances.length > 0 || selectedSuppliers.length > 0 || 
      selectedVolumes.length > 0 || selectedNames.length > 0) && (
      <span style={{
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '500'
      }}>
        {selectedProvenances.length + selectedSuppliers.length + 
         selectedVolumes.length + selectedNames.length} filtre(s) actif(s)
      </span>
    )}
  </div>
  
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
    gap: '16px'
  }}>
    {/* Provenance */}
    <div style={{ position: 'relative' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '6px',
        color: '#4b5563',
        fontSize: '0.9rem',
        fontWeight: '500'
      }}>
        Provenance
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={selectedProvenances[0] || ''}
          onChange={(e) => setSelectedProvenances(e.target.value ? [e.target.value] : [])}
          style={{
            width: '100%',
            padding: '10px 12px',
            paddingRight: '30px',
            backgroundColor: 'white',
            border: selectedProvenances.length > 0 ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            color: '#1e293b',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s',
            appearance: 'none',
            boxShadow: selectedProvenances.length > 0 ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none'
          }}
        >
          <option value="">Toutes les provenances</option>
          {[...new Set(products.map(p => p.provenance).filter(Boolean))].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <div style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: '#94a3b8'
        }}>
          ▼
        </div>
      </div>
    </div>

    {/* Fournisseur */}
    <div style={{ position: 'relative' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '6px',
        color: '#4b5563',
        fontSize: '0.9rem',
        fontWeight: '500'
      }}>
        Fournisseur
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={selectedSuppliers[0] || ''}
          onChange={(e) => setSelectedSuppliers(e.target.value ? [e.target.value] : [])}
          style={{
            width: '100%',
            padding: '10px 12px',
            paddingRight: '30px',
            backgroundColor: 'white',
            border: selectedSuppliers.length > 0 ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            color: '#1e293b',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s',
            appearance: 'none',
            boxShadow: selectedSuppliers.length > 0 ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none'
          }}
        >
          <option value="">Tous les fournisseurs</option>
          {[...new Set(products.map(p => p.supplier).filter(Boolean))].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: '#94a3b8'
        }}>
          ▼
        </div>
      </div>
    </div>

    {/* Volume */}
    <div style={{ position: 'relative' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '6px',
        color: '#4b5563',
        fontSize: '0.9rem',
        fontWeight: '500'
      }}>
        Volume (ml)
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={selectedVolumes[0] || ''}
          onChange={(e) => setSelectedVolumes(e.target.value ? [Number(e.target.value)] : [])}
          style={{
            width: '100%',
            padding: '10px 12px',
            paddingRight: '30px',
            backgroundColor: 'white',
            border: selectedVolumes.length > 0 ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            color: '#1e293b',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s',
            appearance: 'none',
            boxShadow: selectedVolumes.length > 0 ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none'
          }}
        >
          <option value="">Tous les volumes</option>
          {[...new Set(products.map(p => p.volume_ml).filter(Boolean))].map(v => (
            <option key={v} value={v}>{v} ml</option>
          ))}
        </select>
        <div style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: '#94a3b8'
        }}>
          ▼
        </div>
      </div>
    </div>

    {/* Nom */}
    <div style={{ position: 'relative' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '6px',
        color: '#4b5563',
        fontSize: '0.9rem',
        fontWeight: '500'
      }}>
        Nom du produit
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={selectedNames[0] || ''}
          onChange={(e) => setSelectedNames(e.target.value ? [e.target.value] : [])}
          style={{
            width: '100%',
            padding: '10px 12px',
            paddingRight: '30px',
            backgroundColor: 'white',
            border: selectedNames.length > 0 ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            color: '#1e293b',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s',
            appearance: 'none',
            boxShadow: selectedNames.length > 0 ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none'
          }}
        >
          <option value="">Tous les noms</option>
          {[...new Set(products.map(p => p.name).filter(Boolean))].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <div style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: '#94a3b8'
        }}>
          ▼
        </div>
      </div>
    </div>
  </div>

  {/* Barre d'actions */}
  <div style={{ 
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '16px'
  }}>
    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
      {filteredProducts.length} produit(s) trouvé(s)
    </div>
    
    <button 
      onClick={() => {
        setSelectedProvenances([]);
        setSelectedSuppliers([]);
        setSelectedVolumes([]);
        setSelectedNames([]);
      }}
      style={{
        padding: '8px 16px',
        backgroundColor: selectedProvenances.length > 0 || selectedSuppliers.length > 0 || 
                         selectedVolumes.length > 0 || selectedNames.length > 0 
                         ? '#ef4444' : '#94a3b8',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: selectedProvenances.length > 0 || selectedSuppliers.length > 0 || 
                selectedVolumes.length > 0 || selectedNames.length > 0 
                ? 'pointer' : 'not-allowed',
        opacity: selectedProvenances.length > 0 || selectedSuppliers.length > 0 || 
                 selectedVolumes.length > 0 || selectedNames.length > 0 ? 1 : 0.5,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
      disabled={!(selectedProvenances.length > 0 || selectedSuppliers.length > 0 || 
                  selectedVolumes.length > 0 || selectedNames.length > 0)}
      onMouseOver={(e) => {
        if (selectedProvenances.length > 0 || selectedSuppliers.length > 0 || 
            selectedVolumes.length > 0 || selectedNames.length > 0) {
          e.target.style.backgroundColor = '#dc2626';
        }
      }}
      onMouseOut={(e) => {
        if (selectedProvenances.length > 0 || selectedSuppliers.length > 0 || 
            selectedVolumes.length > 0 || selectedNames.length > 0) {
          e.target.style.backgroundColor = '#ef4444';
        }
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
      Réinitialiser les filtres
    </button>
  </div>
</div>
            <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 shadow-lg">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="text-left p-5 text-xs font-black text-slate-700 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="text-left p-5 text-xs font-black text-slate-700 uppercase tracking-wider">
                      Provenence
                    </th>
                    <th className="text-left p-5 text-xs font-black text-slate-700 uppercase tracking-wider">
                      Volume
                    </th>
                    <th className="text-left p-5 text-xs font-black text-slate-700 uppercase tracking-wider">
                      réference
                    </th>
					<th className="text-left p-4 text-xs font-black text-slate-700 uppercase tracking-wider">
                      lot
                    </th>
					<th className="text-left p-5 text-xs font-black text-slate-700 uppercase tracking-wider">
                      Prix
                    </th>
					<th className="text-left p-7 text-xs font-black text-slate-800 uppercase tracking-wider">
                      Statut
                    </th>
					<th className="text-center-1 p-7 text-xs font-black text-slate-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <div className="text-6xl mb-4">⚗️</div>
                        <p className="text-lg font-bold text-slate-600 mb-2">Aucun produit trouvé</p>
                        <p className="text-sm text-slate-500">Ajoutez votre premier produit pour commencer</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <tr 
                        key={product.id} 
                        className="border-t-2 border-slate-100 hover:bg-blue-50/50 transition-colors"
                        style={{animationDelay: `${index * 50}ms`}}
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-2xl">
                              ⚗️
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{product.name}</div>
                              <div className="text-xs text-slate-500 font-mono">ID: {String(product.id).slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
						<td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-2xl">
                              ⚗️
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{product.provenance}</div>
                              <div className="text-xs text-slate-500 font-mono">ID: {String(product.id).slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
						<td className="p-5">
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-2xl">
      ⚗️
    </div>
    <div>
      <div className="font-bold text-slate-900">
        {product.volume_ml} <span className="text-sm font-normal text-slate-500">ml</span>
      </div>
      <div className="text-xs text-slate-500 font-mono">ID: {String(product.id).slice(0, 8)}...</div>
    </div>
  </div>
</td>
						<td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-2xl">
                              ⚗️
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{product.reference_code}</div>
                              <div className="text-xs text-slate-500 font-mono">ID: {String(product.id).slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
						<td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-2xl">
                              ⚗️
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{product.lot_number}</div>
                              <div className="text-xs text-slate-500 font-mono">ID: {String(product.id).slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="font-black text-lg text-slate-900">{formatCurrency(product.price)}</div>
                        </td>
						
                        <td className="p-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                            product.active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${product.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {product.active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex gap-2 justify-end">
                            
 <button
    onClick={() => handleViewProduct(product.id)}
    className="group relative p-2.5 rounded-xl backdrop-blur-md bg-white/30 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
    style={{
      background: 'linear-gradient(135deg, rgba(173, 216, 255, 0.4), rgba(135, 206, 250, 0.3))',
      WebkitBackdropFilter: 'blur(10px)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(135, 206, 250, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
    }}
  >
    <span className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
    <span className="relative text-blue-600/90 text-lg">👁️</span>
  </button>

  {/* Bouton Modifier - Glassmorphisme */}
  <button
    onClick={() => handleEditProduct(product.id)}
    className="group relative p-2.5 rounded-xl backdrop-blur-md bg-white/30 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
    style={{
      background: 'linear-gradient(135deg, rgba(173, 216, 255, 0.4), rgba(135, 206, 250, 0.3))',
      WebkitBackdropFilter: 'blur(10px)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(135, 206, 250, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
    }}
  >
    <span className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
    <span className="relative text-blue-600/90 text-lg">✏️</span>
  </button>

  {/* Bouton Supprimer - Glassmorphisme */}
  <button
    onClick={() => handleDeleteProduct(product.id)}
    className="group relative p-2.5 rounded-xl backdrop-blur-md bg-white/30 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
    style={{
      background: 'linear-gradient(135deg, rgba(173, 216, 255, 0.4), rgba(135, 206, 250, 0.3))',
      WebkitBackdropFilter: 'blur(10px)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(135, 206, 250, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
    }}
  >
    <span className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
    <span className="relative text-blue-600/90 text-lg">🗑️</span>
  </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Button 
                icon={<span>➕</span>}
                onClick={() => {
                  setSelectedClient(null)
                  setClientModalOpen(true)
                }}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg shadow-green-600/30 hover:shadow-xl hover:scale-105 transition-all"
              >
                Ajouter un medecin
              </Button>
            </div>

            <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 shadow-lg">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="text-left p-5 text-xs font-black text-slate-700 uppercase tracking-wider">Nom</th>
                    <th className="text-left p-5 text-xs font-black text-slate-700 uppercase tracking-wider">ID</th>
                    <th className="text-left p-5 text-xs font-black text-slate-700 uppercase tracking-wider">Téléphone</th>
                    <th className="text-left p-5 text-xs font-black text-slate-700 uppercase tracking-wider">Ville</th>
                    <th className="text-right p-5 text-xs font-black text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <p className="text-lg font-bold text-slate-600 mb-2">Aucun medecin enregistré</p>
                        <p className="text-sm text-slate-500">Ajoutez votre premier medecin pour commencer</p>
                      </td>
                    </tr>
                  ) : (
                    clients.map((client, index) => (
                      <tr 
                        key={client.id} 
                        className="border-t-2 border-slate-100 hover:bg-green-50/50 transition-colors"
                        style={{animationDelay: `${index * 50}ms`}}
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center text-2xl">
                              👤
                            </div>
                            <div className="font-bold text-slate-900">{client.name}</div>
                          </div>
                        </td>
                        <td className="p-5">
                          <code className="bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-mono text-slate-800 font-bold">
                            {client.client_id}
                          </code>
                        </td>
                        <td className="p-5 text-slate-700 font-medium">{client.phone || '-'}</td>
                        <td className="p-5 text-slate-700 font-medium">{client.city || '-'}</td>
                       

<td className="p-5">
  <div className="flex gap-2 justify-end">
    {/* Bouton Voir existant */}
    <Button 
      size="sm" 
      variant="success" 
      icon={<span>👁️</span>}
      onClick={() => handleViewClient(client.id)}
      className="hover:scale-110 transition-transform"
    >
      
    </Button>
    
    {/* NOUVEAU BOUTON PWDID */}
    <PwdIdButton 
      client={client}
      
      size="sm"
    />
    
    {/* Bouton Éditer existant */}
    <Button 
      size="sm" 
      variant="primary" 
      icon={<span>✏️</span>}
      onClick={() => handleEditClient(client.id)}
      className="hover:scale-110 transition-transform"
    >
      
    </Button>
    
    {/* Bouton Supprimer existant */}
    <Button 
      size="sm" 
      variant="danger" 
      icon={<span>🗑️</span>}
      onClick={() => handleDeleteClient(client.id)}
      className="hover:scale-110 transition-transform"
    >
      
    </Button>
  </div>
</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrdersPage 
            merchantId={merchantId} 
            products={products} 
            formatCurrency={formatCurrency} 
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <MerchantSettingsTab 
            merchantId={merchantId} 
            user={user} 
          />
        )}
      </Card>

      {/* Modales - Product View */}
      <Modal
        isOpen={viewProductModalOpen}
        onClose={() => setViewProductModalOpen(false)}
        title="Détails du produit"
        icon="⚗️"
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-white rounded-2xl border-2 border-blue-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white text-4xl shadow-xl">
                ⚗️
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedProduct.name}</h2>
                <code className="text-xs bg-slate-100 px-3 py-1 rounded-lg font-mono text-slate-600">
                  ID: {selectedProduct.id}
                </code>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border-2 border-blue-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prix</div>
                <div className="text-3xl font-black text-blue-600">{formatCurrency(selectedProduct.price)}</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border-2 border-green-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Statut</div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
                  selectedProduct.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedProduct.active ? '✅ Actif' : '❌ Inactif'}
                </div>
              </div>
            </div>

            {selectedProduct.description && (
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Description</div>
                <p className="text-slate-700 leading-relaxed">{selectedProduct.description}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t-2 border-slate-100">
              <Button
                variant="primary"
                icon={<span>✏️</span>}
                onClick={() => {
                  setViewProductModalOpen(false)
                  handleEditProduct(selectedProduct.id)
                }}
              >
                Éditer ce produit
              </Button>
              <Button variant="outline" onClick={() => setViewProductModalOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal - Client View */}
      <Modal
        isOpen={viewClientModalOpen}
        onClose={() => setViewClientModalOpen(false)}
        title="Détails du client"
        icon="👥"
        size="lg"
      >
        {selectedClient && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-white rounded-2xl border-2 border-green-100">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center text-white text-4xl shadow-xl">
                👤
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedClient.name}</h2>
                <code className="text-xs bg-slate-100 px-3 py-1 rounded-lg font-mono text-slate-600">
                  ID: {selectedClient.client_id}
                </code>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Contact</div>
                <div className="space-y-2">
                  {selectedClient.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>📧</span> {selectedClient.email}
                    </div>
                  )}
                  {selectedClient.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>📱</span> {selectedClient.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Localisation</div>
                <div className="space-y-2">
                  {selectedClient.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>📍</span> {selectedClient.city}
                    </div>
                  )}
                  {selectedClient.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>🏠</span> {selectedClient.address}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t-2 border-slate-100">
              <Button
                variant="primary"
                icon={<span>✏️</span>}
                onClick={() => {
                  setViewClientModalOpen(false)
                  handleEditClient(selectedClient.id)
                }}
              >
                Éditer ce client
              </Button>
              <Button variant="outline" onClick={() => setViewClientModalOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal - Product Form */}
      <ProductForm
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false)
          setSelectedProduct(null)
        }}
        onSubmit={handleProductSubmit}
        product={selectedProduct}
      />

      {/* Modal - Client Form */}
      <ClientForm
        isOpen={clientModalOpen}
        onClose={() => {
          setClientModalOpen(false)
          setSelectedClient(null)
        }}
        onSubmit={handleClientSubmit}
        client={selectedClient}
        merchantId={merchantId}
      />
	  {/* Modal Statistiques BI - Style Glassmorphisme */}
{statBIModalOpen && (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/20 animate-fade-in"
    onClick={() => setStatBIModalOpen(false)}
  >
    <div 
      className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* En-tête glass */}
      <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 backdrop-blur-md flex items-center justify-center text-purple-300 text-xl border border-purple-500/30">
            📊
          </div>
          <h2 className="text-xl font-bold text-white drop-shadow-lg">
            Tableau de Bord Statistique
          </h2>
        </div>
        <button
          onClick={() => setStatBIModalOpen(false)}
          className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all"
        >
          ✕
        </button>
      </div>
      
      {/* Contenu scrollable avec verre dépoli */}
      <div className="overflow-y-auto p-6 max-h-[calc(90vh-80px)] bg-white/5 backdrop-blur-sm">
        <StatBI merchantId={merchantId} />
      </div>
    </div>
  </div>
)}
    </div>
  )
}
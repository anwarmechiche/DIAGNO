'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/utils/supabase/client'
import { supabase } from '@/lib/supabase'
import { Product, Order, Client, MerchantSettings } from '@/utils/supabase/types'
import { Bell, X, CheckCircle, Package, ShoppingCart, Plus, Minus, FileText, CreditCard, MapPin, Phone, Mail, Download, Eye, Printer, Truck, Calendar, Clock } from 'lucide-react'
import { generateOrderSlip, OrderSlip } from '@/utils/orderUtils'

interface ClientDashboardProps {
  client: Client
  merchantId: string
  onLogout: () => void
}

// Interface pour les détails de commande
interface OrderDetails {
  groupId: string
  date: string
  status: string
  orders: Order[]
  totalAmount: number
  merchantInfo?: MerchantSettings
  clientInfo: Client
}

export default function ClientDashboard({ client, merchantId, onLogout }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState('shop')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [cart, setCart] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{title: string, message: string} | null>(null)
  const [orderSlip, setOrderSlip] = useState<OrderSlip | null>(null)
  const [showOrderSlip, setShowOrderSlip] = useState(false)
  const [merchantSettings, setMerchantSettings] = useState<MerchantSettings | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  
  // Notifications
  const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied'>('default')
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(true)

  // Charger les paramètres du marchand
  useEffect(() => {
    const loadMerchantSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('merchant_settings')
          .select('*')
          .eq('merchant_id', merchantId)
          .single()
        
        if (!error && data) {
          setMerchantSettings(data)
        }
      } catch (error) {
        console.error('Erreur chargement settings:', error)
      }
    }
    
    loadMerchantSettings()
  }, [merchantId])

  // Vérifier permission notifications
  useEffect(() => {
    if ('Notification' in window) {
      const perm = Notification.permission as 'default' | 'granted' | 'denied'
      setNotificationPermission(perm)
      if (perm === 'default' || perm === 'denied') {
        setShowPermissionPrompt(true)
      }
    }
  }, [])

  // Demander permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission as any)
    setShowPermissionPrompt(false)
  }, [])

  // Afficher notification
  const showSystemNotification = useCallback((title: string, message: string) => {
    if (notificationPermission === 'granted' && 'Notification' in window) {
      try {
        new Notification(title, {
          body: message,
          icon: merchantSettings?.logo_url || '/favicon.ico',
        })
      } catch (e) {
        console.error('Erreur notification:', e)
      }
    }
    setNotification({ title, message })
    setTimeout(() => setNotification(null), 5000)
  }, [notificationPermission, merchantSettings])

  // Setup Realtime pour les commandes
  useEffect(() => {
  if (!client?.id) return

  const channel = supabase
    .channel(`client:${client.id}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `client_id=eq.${client.id}`
      },
      (payload) => {
        // ✅ METTRE À JOUR INSTANTANÉMENT LE STATUT CHEZ LE CLIENT
        showSystemNotification(
          '📦 Statut mis à jour',
          `Votre commande est maintenant: ${payload.new.status}`
        )
        loadOrders() // Rafraîchir la liste
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [client?.id])
  // Charger les commandes
  const loadOrders = useCallback(async () => {
    try {
      const ordersData = await db.getOrders(merchantId)
      const filteredOrders = ordersData
        .filter(order => String(order.client_id) === String(client.id))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setOrders(filteredOrders)
    } catch (error) {
      console.error('❌ Erreur chargement commandes:', error)
    }
  }, [merchantId, client.id])

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const productsData = await db.getProducts(merchantId)
        setProducts(productsData.filter(p => p.active))
        await loadOrders()
      } catch (error) {
        console.error('❌ Erreur loadData:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [merchantId, loadOrders])

  // Gestion du panier
  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[productId] > 1) {
        newCart[productId] -= 1
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }

  const clearCart = () => {
    setCart({})
    setOrderSlip(null)
    setShowOrderSlip(false)
  }

  // Générer le bon de commande
  const generateSlip = () => {
    const slip = generateOrderSlip(
      client.name || client.email?.split('@')[0] || 'Client',
      merchantId,
      Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })),
      products
    )
    setOrderSlip(slip)
    setShowOrderSlip(true)
  }

  // ✅ VALIDER LA COMMANDE
  const handleCheckout = async () => {
    if (Object.keys(cart).length === 0) {
      showSystemNotification('❌ Panier vide', 'Ajoutez des produits avant de commander')
      return
    }

    setLoading(true)
    
    try {
      // Générer un ID de commande unique
      const orderRef = `CMD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      // Créer UNE COMMANDE PAR PRODUIT
      const promises = Object.entries(cart).map(([productId, quantity]) => {
        return db.createOrder({
          client_id: client.id,
          merchant_id: merchantId,
          product_id: productId,
          quantity: quantity,
          status: 'pending'
        })
      })
      
      const results = await Promise.all(promises)
      
      // Notification de succès
      showSystemNotification(
        '✅ Commande confirmée !',
        `${Object.keys(cart).length} produit(s) commandé(s) - Réf: ${orderRef}`
      )
      
      // Vider le panier
      clearCart()
      
      // Rafraîchir les commandes
      await loadOrders()
      
      // Basculer vers l'onglet commandes
      setActiveTab('orders')
      
    } catch (error) {
      console.error('❌ Erreur lors de la commande:', error)
      showSystemNotification(
        '❌ Erreur',
        'Impossible de passer la commande. Veuillez réessayer.'
      )
    } finally {
      setLoading(false)
      setShowOrderSlip(false)
    }
  }

  // 📄 Générer et télécharger le PDF du bon de commande
  // 📄 Générer et télécharger le PDF du bon de commande (VERSION AMÉLIORÉE)
const generateOrderPDF = (orderDetails: OrderDetails) => {
  const win = window.open('', '_blank')
  if (!win) return

  const date = new Date(orderDetails.date)
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Générer une référence courte pour l'affichage
  const shortRef = orderDetails.groupId.length > 12 
    ? orderDetails.groupId.substring(0, 12) + '...' 
    : orderDetails.groupId

  // Générer le HTML du bon de commande
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bon de commande ${shortRef}</title>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background: #f9fafb;
          padding: 40px 20px;
          color: #111827;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 32px;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .header p {
          opacity: 0.9;
          font-size: 14px;
        }
        
        .content {
          padding: 32px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 32px;
        }
        
        .info-box {
          background: #f9fafb;
          padding: 20px;
          border-radius: 16px;
        }
        
        .info-box h3 {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          margin-bottom: 12px;
        }
        
        .info-box .name {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .info-box .detail {
          font-size: 14px;
          color: #4b5563;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
        }
        
        th {
          background: #f3f4f6;
          padding: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #4b5563;
          text-align: left;
        }
        
        td {
          padding: 16px 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        
        .product-name {
          font-weight: 600;
          color: #111827;
        }
        
        .product-sku {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
        
        .product-ref {
          font-family: monospace;
          font-size: 11px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        }
        
        .total-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 2px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
        }
        
        .total-box {
          width: 300px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
        }
        
        .grand-total {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 2px solid #e5e7eb;
          font-size: 18px;
          font-weight: 700;
          color: #059669;
        }
        
        .footer {
          margin-top: 32px;
          padding-top: 32px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        
        .status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          background: ${orderDetails.status === 'delivered' ? '#10b98120' : '#f59e0b20'};
          color: ${orderDetails.status === 'delivered' ? '#10b981' : '#f59e0b'};
          border: 1px solid ${orderDetails.status === 'delivered' ? '#10b98140' : '#f59e0b40'};
        }
        
        @media print {
          body { background: white; padding: 0; }
          .container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BON DE COMMANDE</h1>
          <p>Référence: ${orderDetails.groupId}</p>
          <p style="margin-top: 8px;">Date: ${formattedDate}</p>
          <span class="status" style="margin-top: 16px; background: white; color: #059669;">
            ${orderDetails.status === 'delivered' ? 'LIVRÉE' : 'EN COURS'}
          </span>
        </div>
        
        <div class="content">
          <div class="info-grid">
            <div class="info-box">
              <h3>FOURNISSEUR</h3>
              <div class="name">${merchantSettings?.company_name || 'TradePro'}</div>
              ${merchantSettings?.company_address ? `<div class="detail">📍 ${merchantSettings.company_address}</div>` : ''}
              ${merchantSettings?.company_city ? `<div class="detail">🏙️ ${merchantSettings.company_city}, ${merchantSettings.company_country || ''}</div>` : ''}
              ${merchantSettings?.company_phone ? `<div class="detail">📞 ${merchantSettings.company_phone}</div>` : ''}
              ${merchantSettings?.company_email ? `<div class="detail">✉️ ${merchantSettings.company_email}</div>` : ''}
              ${merchantSettings?.tax_id ? `<div class="detail">🏢 NIF: ${merchantSettings.tax_id}</div>` : ''}
              ${merchantSettings?.trade_registry ? `<div class="detail">📋 RC: ${merchantSettings.trade_registry}</div>` : ''}
            </div>
            
            <div class="info-box">
              <h3>CLIENT</h3>
              <div class="name">${client.name || 'Client'}</div>
              ${client.email ? `<div class="detail">✉️ ${client.email}</div>` : ''}
              ${client.phone ? `<div class="detail">📞 ${client.phone}</div>` : ''}
              ${client.address ? `<div class="detail">📍 ${client.address}</div>` : ''}
              ${client.city ? `<div class="detail">🏙️ ${client.city}${client.wilaya ? `, ${client.wilaya}` : ''}</div>` : ''}
              ${client.fiscal_number ? `<div class="detail">🏢 NIF: ${client.fiscal_number}</div>` : ''}
              ${client.payment_mode ? `<div class="detail">💳 Paiement: ${client.payment_mode}</div>` : ''}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Réf.</th>
                <th>Qté</th>
                <th>Prix unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.orders.map(order => {
                const product = products.find(p => String(p.id) === String(order.product_id))
                // 🔥 CORRECTION: Convertir en string et prendre les 6 derniers caractères
                const productIdStr = String(order.product_id)
                const shortProductId = productIdStr.length > 6 
                  ? productIdStr.substring(productIdStr.length - 6) 
                  : productIdStr
                
                return `
                  <tr>
                    <td>
                      <div class="product-name">${product?.name || 'Produit'}</div>
                      ${product?.description ? `<div class="product-sku">${product.description.substring(0, 50)}</div>` : ''}
                    </td>
                    <td><span class="product-ref">${shortProductId}</span></td>
                    <td>${order.quantity}</td>
                    <td>${formatCurrency(product?.price || 0)}</td>
                    <td><strong>${formatCurrency((product?.price || 0) * order.quantity)}</strong></td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-box">
              <div class="total-row">
                <span>Sous-total</span>
                <span>${formatCurrency(orderDetails.totalAmount)}</span>
              </div>
              <div class="total-row">
                <span>TVA (0%)</span>
                <span>0 DZD</span>
              </div>
              <div class="grand-total">
                <span>TOTAL</span>
                <span>${formatCurrency(orderDetails.totalAmount)}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>${merchantSettings?.company_name || 'TradePro'} - Bon de commande généré le ${new Date().toLocaleDateString('fr-FR')}</p>
            ${merchantSettings?.notes ? `<p style="margin-top: 8px;">${merchantSettings.notes}</p>` : ''}
            ${merchantSettings?.signature ? `<p style="margin-top: 16px; font-style: italic;">${merchantSettings.signature}</p>` : ''}
          </div>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `

  win.document.write(html)
  win.document.close()
}
  // 📄 Ouvrir les détails de la commande
  const openOrderDetails = (group: { id: string, date: string, status: string, orders: Order[] }) => {
    const totalAmount = group.orders.reduce((sum, order) => {
      const product = products.find(p => String(p.id) === String(order.product_id))
      return sum + (product?.price || 0) * order.quantity
    }, 0)

    setSelectedOrder({
      groupId: group.id,
      date: group.date,
      status: group.status,
      orders: group.orders,
      totalAmount,
      merchantInfo: merchantSettings || undefined,
      clientInfo: client
    })
    setShowOrderDetails(true)
  }

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('fr-DZ', { 
        style: 'currency', 
        currency: merchantSettings?.currency || 'DZD', 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    } catch (e) {
      return `${value} ${merchantSettings?.currency || 'DZD'}`
    }
  }

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const product = products.find(p => String(p.id) === String(id))
      return total + (product?.price || 0) * qty
    }, 0)
  }

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  }

  // Regrouper les commandes par minute
  const groupedOrders = orders.reduce((groups, order) => {
    const clientId = order?.client_id ? String(order.client_id) : ''
    const createdAt = order?.created_at || new Date().toISOString()
    
    const date = new Date(createdAt)
    const groupKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${clientId.substring(0, 4)}`
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        id: `CMD-${date.getTime()}`,
        date: createdAt,
        status: order.status,
        orders: []
      }
    }
    
    groups[groupKey].orders.push(order)
    
    if (order.status !== 'delivered') {
      groups[groupKey].status = 'pending'
    }
    
    return groups
  }, {} as Record<string, { id: string, date: string, status: string, orders: Order[] }>)

  const orderGroups = Object.values(groupedOrders).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (loading && products.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center dark:bg-black">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white p-4 lg:p-8 transition-colors">
      
      {/* 🔔 PROMPT PERMISSION NOTIFICATIONS */}
      {showPermissionPrompt && notificationPermission === 'default' && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] bg-gradient-to-r from-emerald-500 to-blue-600 text-white p-6 rounded-3xl shadow-2xl max-w-md mx-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center gap-4 mb-4">
            <Bell className="w-8 h-8 animate-pulse" />
            <div>
              <h3 className="font-black text-xl">Activer les notifications ?</h3>
              <p className="text-sm opacity-90">Recevez vos mises à jour commande instantanément</p>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/20">
            <button 
              onClick={() => setShowPermissionPrompt(false)}
              className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl py-3 font-bold text-sm uppercase tracking-wider hover:bg-white/30 transition-all"
            >
              Plus tard
            </button>
            <button 
              onClick={requestNotificationPermission}
              className="flex-1 bg-white text-emerald-600 rounded-2xl py-3 font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Activer
            </button>
          </div>
        </div>
      )}

      {/* 🔔 NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-right-10 duration-300">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-5 rounded-3xl shadow-2xl flex items-start gap-4 max-w-sm border border-white/20 backdrop-blur-sm">
            <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-xs uppercase tracking-widest mb-1">{notification.title}</p>
              <p className="text-sm opacity-90 leading-tight">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)} 
              className="opacity-50 hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 📄 BON DE COMMANDE MODAL */}
      {showOrderSlip && orderSlip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-[#1f1f1f]">
            <div className="p-6 border-b dark:border-[#1f1f1f] flex justify-between items-center sticky top-0 bg-white dark:bg-[#0A0A0A]">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-emerald-500" />
                <h2 className="font-black text-xl">Bon de commande</h2>
              </div>
              <button 
                onClick={() => setShowOrderSlip(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-[#1f1f1f] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations fournisseur */}
              <div className="bg-slate-50 dark:bg-[#050505] p-4 rounded-2xl space-y-2">
                <p className="text-xs uppercase tracking-widest text-slate-400">Fournisseur</p>
                <p className="font-bold text-lg">{merchantSettings?.company_name || 'TradePro'}</p>
                {merchantSettings?.company_address && (
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {merchantSettings.company_address}
                  </p>
                )}
                {merchantSettings?.company_phone && (
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {merchantSettings.company_phone}
                  </p>
                )}
                {merchantSettings?.company_email && (
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {merchantSettings.company_email}
                  </p>
                )}
                {merchantSettings?.tax_id && (
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    NIF: {merchantSettings.tax_id}
                  </p>
                )}
              </div>
              
              {/* Informations client */}
              <div className="bg-slate-50 dark:bg-[#050505] p-4 rounded-2xl space-y-2">
                <p className="text-xs uppercase tracking-widest text-slate-400">Client</p>
                <p className="font-bold text-lg">{orderSlip.clientName}</p>
                {client.email && (
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </p>
                )}
                {client.phone && (
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </p>
                )}
                {client.address && (
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {client.address}
                  </p>
                )}
                {client.payment_mode && (
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {client.payment_mode}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-slate-400">Référence commande</p>
                <p className="font-mono font-bold">{orderSlip.id}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-slate-400">Date</p>
                <p>{new Date(orderSlip.date).toLocaleString('fr-FR')}</p>
              </div>
              
              <div className="border-t dark:border-[#1f1f1f] pt-4">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">Articles</p>
                <div className="space-y-3">
                  {orderSlip.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-bold">{formatCurrency(item.total)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t dark:border-[#1f1f1f] pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Total</p>
                  <p className="text-2xl font-black text-emerald-500">
                    {formatCurrency(orderSlip.total)}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowOrderSlip(false)}
                  className="flex-1 py-3 border dark:border-[#1f1f1f] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-[#1f1f1f] transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Envoi...' : 'Confirmer la commande'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📄 MODAL DÉTAILS DE COMMANDE */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-[#1f1f1f]">
            <div className="p-6 border-b dark:border-[#1f1f1f] flex justify-between items-center sticky top-0 bg-white dark:bg-[#0A0A0A]">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-emerald-500" />
                <h2 className="font-black text-xl">Détails de la commande</h2>
              </div>
              <button 
                onClick={() => setShowOrderDetails(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-[#1f1f1f] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* En-tête avec statut et référence */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Référence</p>
                  <p className="font-mono font-bold text-lg">{selectedOrder.groupId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                    selectedOrder.status === 'delivered' 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                      : 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                  }`}>
                    {selectedOrder.status === 'delivered' ? 'Livrée' : 'En cours'}
                  </span>
                  <button
                    onClick={() => generateOrderPDF(selectedOrder)}
                    className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">PDF</span>
                  </button>
                </div>
              </div>
              
              {/* Date */}
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                <p className="text-sm">
                  {new Date(selectedOrder.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              {/* Grille d'informations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fournisseur */}
                <div className="bg-slate-50 dark:bg-[#050505] p-5 rounded-2xl">
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Fournisseur
                  </p>
                  <p className="font-bold text-lg">{merchantSettings?.company_name || 'TradePro'}</p>
                  {merchantSettings?.company_address && (
                    <p className="text-sm text-slate-400 mt-2">{merchantSettings.company_address}</p>
                  )}
                  {merchantSettings?.company_city && (
                    <p className="text-sm text-slate-400">{merchantSettings.company_city}, {merchantSettings.company_country || ''}</p>
                  )}
                  {merchantSettings?.company_phone && (
                    <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {merchantSettings.company_phone}
                    </p>
                  )}
                  {merchantSettings?.company_email && (
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {merchantSettings.company_email}
                    </p>
                  )}
                  {merchantSettings?.tax_id && (
                    <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                      <CreditCard className="w-3 h-3" />
                      NIF: {merchantSettings.tax_id}
                    </p>
                  )}
                </div>
                
                {/* Client */}
                <div className="bg-slate-50 dark:bg-[#050505] p-5 rounded-2xl">
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Client
                  </p>
                  <p className="font-bold text-lg">{selectedOrder.clientInfo.name || 'Client'}</p>
                  {selectedOrder.clientInfo.email && (
                    <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {selectedOrder.clientInfo.email}
                    </p>
                  )}
                  {selectedOrder.clientInfo.phone && (
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {selectedOrder.clientInfo.phone}
                    </p>
                  )}
                  {selectedOrder.clientInfo.address && (
                    <p className="text-sm text-slate-400 mt-2">{selectedOrder.clientInfo.address}</p>
                  )}
                  {selectedOrder.clientInfo.city && (
                    <p className="text-sm text-slate-400">
                      {selectedOrder.clientInfo.city}{selectedOrder.clientInfo.wilaya ? `, ${selectedOrder.clientInfo.wilaya}` : ''}
                    </p>
                  )}
                  {selectedOrder.clientInfo.payment_mode && (
                    <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                      <CreditCard className="w-3 h-3" />
                      {selectedOrder.clientInfo.payment_mode}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Liste des articles */}
              <div className="border-t dark:border-[#1f1f1f] pt-6">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Articles ({selectedOrder.orders.length})
                </p>
                
                <div className="space-y-4">
                  {selectedOrder.orders.map((order) => {
                    const product = products.find(p => String(p.id) === String(order.product_id))
                    return (
                      <div key={order.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-[#050505] rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            {product?.image_data ? (
                              <img src={product.image_data} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                              <div className="w-12 h-12 bg-slate-200 dark:bg-[#0A0A0A] rounded-lg flex items-center justify-center">
                                📦
                              </div>
                            )}
                            <div>
                              <p className="font-bold">{product?.name || 'Produit'}</p>
                              {product?.description && (
                                <p className="text-xs text-slate-400 mt-1">{product.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2">
                                <p className="text-xs text-slate-400">
                                  Quantité: <span className="font-bold text-white">{order.quantity}</span>
                                </p>
                                <p className="text-xs text-slate-400">
                                  Prix unitaire: <span className="font-bold text-white">{formatCurrency(product?.price || 0)}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="font-bold text-lg text-emerald-500">
                          {formatCurrency((product?.price || 0) * order.quantity)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Total */}
              <div className="border-t dark:border-[#1f1f1f] pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Total de la commande</p>
                  <p className="text-3xl font-black text-emerald-500">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </p>
                </div>
              </div>
              
              {/* Notes */}
              {selectedOrder.clientInfo.notes && (
                <div className="bg-slate-50 dark:bg-[#050505] p-4 rounded-2xl">
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Notes</p>
                  <p className="text-sm italic">{selectedOrder.clientInfo.notes}</p>
                </div>
              )}
              
              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="flex-1 py-3 border dark:border-[#1f1f1f] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-[#1f1f1f] transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => generateOrderPDF(selectedOrder)}
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header avec infos client */}
        <header className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b dark:border-[#1f1f1f]">
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tighter">
              Bonjour, {client.name || client.email?.split('@')[0] || 'Client'}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              {client.credit_limit !== undefined && client.credit_limit > 0 && (
                <span className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  Limite crédit: {formatCurrency(client.credit_limit)}
                </span>
              )}
              {!client.show_price && (
                <span className="text-xs bg-slate-100 dark:bg-[#1f1f1f] px-2 py-1 rounded-full">
                  Prix masqués
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-slate-100 dark:bg-[#1f1f1f] px-4 py-2 rounded-full text-sm">
              {getCartCount()} article(s)
            </span>
            <button 
              onClick={onLogout} 
              className="text-[10px] font-bold text-red-500 uppercase border border-red-500/20 px-4 py-2 rounded-full hover:bg-red-500/10 transition-colors"
            >
              Quitter
            </button>
          </div>
        </header>

        {/* Onglets */}
        <div className="flex bg-slate-100 dark:bg-[#0A0A0A] p-1 rounded-2xl w-fit border dark:border-[#1f1f1f]">
          <button 
            onClick={() => setActiveTab('shop')} 
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all
              ${activeTab === 'shop' 
                ? 'bg-white dark:bg-[#1f1f1f] shadow-sm text-slate-900 dark:text-white' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Boutique
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all
              ${activeTab === 'orders' 
                ? 'bg-white dark:bg-[#1f1f1f] shadow-sm text-slate-900 dark:text-white' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
          >
            <Package className="w-4 h-4" />
            Commandes ({orderGroups.length})
          </button>
        </div>

        {/* Contenu - Onglet Boutique */}
        {activeTab === 'shop' ? (
          <>
            {/* Grille produits */}
            {products.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-slate-50 dark:bg-[#050505] rounded-3xl border dark:border-[#1f1f1f]">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-bold mb-2">Aucun produit disponible</p>
                <p className="text-sm">La boutique n'a pas encore de produits.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => {
                  const quantity = cart[String(product.id)] || 0
                  const showPrice = client.show_price !== false
                  
                  return (
                    <div 
                      key={product.id} 
                      className="bg-slate-50 dark:bg-[#050505] border dark:border-[#1f1f1f] p-5 rounded-[2rem] flex flex-col group hover:shadow-xl transition-all"
                    >
                      {product.image_data ? (
                        <img 
                          src={product.image_data} 
                          alt={product.name}
                          className="h-40 w-full object-cover rounded-2xl mb-4 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="h-40 bg-slate-200 dark:bg-[#0A0A0A] rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-105 transition-transform">
                          📦
                        </div>
                      )}
                      
                      <h3 className="font-bold mb-1 text-lg line-clamp-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-xs text-slate-400 mb-2 line-clamp-2">{product.description}</p>
                      )}
                      
                      {showPrice && (
                        <p className="text-emerald-500 font-black mb-4 text-xl">
                          {formatCurrency(product.price)}
                        </p>
                      )}
                      
                      {quantity > 0 ? (
                        <div className="flex items-center gap-2 mt-auto">
                          <button
                            onClick={() => removeFromCart(String(product.id))}
                            className="flex-1 bg-red-500/10 text-red-500 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-1"
                          >
                            <Minus className="w-3 h-3" />
                            Retirer
                          </button>
                          <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                          <button
                            onClick={() => addToCart(String(product.id))}
                            className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:dark:bg-emerald-400 transition-all flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Ajouter
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(String(product.id))}
                          className="mt-auto w-full bg-slate-900 dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:dark:bg-emerald-400 transition-all"
                        >
                          Ajouter au panier
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Panier Flottant */}
            {Object.keys(cart).length > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-[2.5rem] shadow-2xl z-50 backdrop-blur-sm border border-white/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase opacity-80 tracking-widest">
                        Mon panier • {getCartCount()} articles
                      </span>
                    </div>
                    
                    <div className="hidden md:flex flex-wrap gap-2 text-xs">
                      {Object.entries(cart).slice(0, 3).map(([id, qty]) => {
                        const product = products.find(p => String(p.id) === String(id))
                        return (
                          <span key={id} className="bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                            {product?.name} x{qty}
                          </span>
                        )
                      })}
                      {Object.keys(cart).length > 3 && (
                        <span className="bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                          +{Object.keys(cart).length - 3} autre(s)
                        </span>
                      )}
                    </div>
                    
                    <p className="md:hidden text-sm">
                      {Object.keys(cart).length} produit(s) • {getCartCount()} article(s)
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Total</p>
                      <p className="text-xl font-black">
                        {formatCurrency(getCartTotal())}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={clearCart}
                        className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/30 transition-all"
                      >
                        Vider
                      </button>
                      <button 
                        onClick={generateSlip}
                        disabled={loading}
                        className="bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        {loading ? '...' : 'Commander'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Onglet Commandes - Avec bouton ouvrir */
          <div className="space-y-6">
            {orderGroups.map((group) => {
              const date = new Date(group.date)
              const totalAmount = group.orders.reduce((sum, order) => {
                const product = products.find(p => String(p.id) === String(order.product_id))
                return sum + (product?.price || 0) * order.quantity
              }, 0)
              
              return (
                <div 
                  key={group.id} 
                  className="bg-slate-50 dark:bg-[#050505] border dark:border-[#1f1f1f] rounded-3xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => openOrderDetails(group)}
                >
                  <div className="p-6 border-b dark:border-[#1f1f1f] bg-gradient-to-r from-slate-100/50 to-transparent dark:from-[#1f1f1f]/50">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-5 h-5 text-emerald-500" />
                          <p className="text-xs uppercase tracking-widest text-slate-400">
                            Commande #{group.id}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {date.toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          group.status === 'delivered' 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                            : 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                        }`}>
                          {group.status === 'delivered' ? 'Livrée' : 'En cours'}
                        </span>
                        {client.show_price !== false && (
                          <p className="text-2xl font-black text-emerald-500">
                            {formatCurrency(totalAmount)}
                          </p>
                        )}
                        <button 
                          className="p-2 bg-white dark:bg-[#1f1f1f] rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                            openOrderDetails(group)
                          }}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Aperçu des articles */}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-3">
                      {group.orders.slice(0, 3).map((order) => {
                        const product = products.find(p => String(p.id) === String(order.product_id))
                        return (
                          <div key={order.id} className="flex items-center gap-2 bg-slate-100 dark:bg-[#0A0A0A] px-3 py-2 rounded-full">
                            <span className="text-sm font-bold">{product?.name || 'Produit'}</span>
                            <span className="text-xs text-slate-400">x{order.quantity}</span>
                          </div>
                        )
                      })}
                      {group.orders.length > 3 && (
                        <div className="bg-slate-100 dark:bg-[#0A0A0A] px-3 py-2 rounded-full">
                          <span className="text-sm">+{group.orders.length - 3} autre(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {orderGroups.length === 0 && (
              <div className="text-center py-16 text-slate-400 bg-slate-50 dark:bg-[#050505] rounded-3xl border dark:border-[#1f1f1f]">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-bold mb-2">Aucune commande</p>
                <p className="text-sm max-w-sm mx-auto mb-6">
                  Votre historique de commandes apparaîtra ici.
                </p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg"
                >
                  Découvrir la boutique
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
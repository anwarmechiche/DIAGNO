'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import { db } from '@/utils/supabase/client'

interface StatBIProps {
  merchantId: string
}

interface Stats {
  products: number
  clients: number
  orders: number
  revenue: number
  pendingOrders: number
  deliveredOrders: number
  activeProducts: number
  inactiveProducts: number
}

export default function StatBI({ merchantId }: StatBIProps) {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    clients: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    activeProducts: 0,
    inactiveProducts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (merchantId) {
      loadStats()
    }
  }, [merchantId])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [productsData, clientsData, ordersData] = await Promise.all([
        db.getProducts(merchantId),
        db.getClients(merchantId),
        db.getOrders(merchantId)
      ])

      // Calcul du revenu total
      const revenue = ordersData.reduce((total, order) => {
        const product = productsData.find(p => p.id === order.product_id)
        return total + (order.quantity * (product?.price || 0))
      }, 0)

      // Compter les commandes par statut
      const pendingOrders = ordersData.filter(o => o.status === 'pending').length
      const deliveredOrders = ordersData.filter(o => o.status === 'delivered').length

      // Compter les produits actifs/inactifs
      const activeProducts = productsData.filter(p => p.active).length
      const inactiveProducts = productsData.filter(p => !p.active).length

      setStats({
        products: productsData.length,
        clients: clientsData.length,
        orders: ordersData.length,
        revenue,
        pendingOrders,
        deliveredOrders,
        activeProducts,
        inactiveProducts
      })
    } catch (error) {
      console.error('Erreur chargement stats:', error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Cartes principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Produits */}
        <Card className="p-6 hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:border-blue-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              📦
            </div>
            <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              Total
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Produits
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {stats.products}
          </div>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="text-green-600">✓ {stats.activeProducts} actifs</span>
            <span className="text-red-600">✗ {stats.inactiveProducts} inactifs</span>
          </div>
        </Card>

        {/* Clients */}
        <Card className="p-6 hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-green-50 to-white border border-green-100 hover:border-green-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              👥
            </div>
            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              Total
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Clients
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            {stats.clients}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Clients enregistrés
          </div>
        </Card>

        {/* Commandes */}
        <Card className="p-6 hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-yellow-50 to-white border border-yellow-100 hover:border-yellow-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              🛒
            </div>
            <div className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
              Total
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Commandes
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
            {stats.orders}
          </div>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="text-blue-600">⏳ {stats.pendingOrders} en attente</span>
            <span className="text-green-600">✅ {stats.deliveredOrders} livrées</span>
          </div>
        </Card>

        {/* Revenu */}
        <Card className="p-6 hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:border-purple-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              💰
            </div>
            <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
              CA
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Chiffre d'affaires
          </div>
          <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            {formatCurrency(stats.revenue)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Revenu total généré
          </div>
        </Card>
      </div>

      {/* Graphiques ou statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Distribution des commandes */}
        <Card className="p-6 bg-white border border-gray-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
            Distribution des commandes
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>En attente</span>
                <span className="font-bold">{stats.pendingOrders}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${stats.orders ? (stats.pendingOrders / stats.orders) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Livrées</span>
                <span className="font-bold">{stats.deliveredOrders}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${stats.orders ? (stats.deliveredOrders / stats.orders) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistiques produits */}
        <Card className="p-6 bg-white border border-gray-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-green-500 rounded-full"></span>
            État des produits
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Produits actifs</span>
                <span className="font-bold">{stats.activeProducts}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${stats.products ? (stats.activeProducts / stats.products) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Produits inactifs</span>
                <span className="font-bold">{stats.inactiveProducts}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${stats.products ? (stats.inactiveProducts / stats.products) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Résumé rapide */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-white border border-purple-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Tableau de bord BI</h3>
            <p className="text-sm text-slate-600">
              Analyse en temps réel de votre activité commerciale
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-slate-800">{stats.products}</div>
              <div className="text-xs text-slate-500">Produits</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-800">{stats.clients}</div>
              <div className="text-xs text-slate-500">Clients</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-800">{stats.orders}</div>
              <div className="text-xs text-slate-500">Commandes</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
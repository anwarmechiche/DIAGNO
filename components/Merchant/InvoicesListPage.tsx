'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' 
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

// Type local étendu pour inclure les données du client
interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  merchant_id: string
  date: string
  due_date: string
  items: any[]
  total_ht: number
  tva_rate: number
  total_ttc: number
  status: 'draft' | 'pending' | 'paid' | 'cancelled'
  payment_method?: string
  payment_date?: string
  notes?: string
  created_at: string
  updated_at: string
  // Jointure manuelle ou auto
  clients?: {
    name: string
    phone: string
    email: string
    city?: string
    address?: string
  }
}

export default function InvoicesListPage({ merchantId }: { merchantId: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [viewInvoiceModalOpen, setViewInvoiceModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    if (merchantId) {
      fetchData()
    }
  }, [merchantId])

  const fetchData = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      // 1. Récupérer les factures
      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })

      if (invError) throw invError

      // 2. Récupérer les clients pour le mapping (évite l'erreur de relation)
      const { data: cliData, error: cliError } = await supabase
        .from('clients')
        .select('id, name, phone, email, city, address')
        .eq('merchant_id', merchantId)

      if (cliError) throw cliError

      // 3. Fusionner les données
      const mergedData = (invData || []).map(inv => ({
        ...inv,
        clients: cliData?.find(c => c.id === inv.client_id)
      }))

      setInvoices(mergedData)
      
    } catch (error: any) {
      console.error('Fetch error:', error)
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  // --- Fonctions Utilitaires ---
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  const formatDate = (date: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const getStatusBadge = (status: string) => {
    const config: any = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Brouillon' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Payée' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulée' }
    }
    const s = config[status] || config.draft
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>
  }

  const handleMarkAsPaid = async (id: string) => {
    if (!confirm('Confirmer le paiement ?')) return
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid', payment_date: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      fetchData()
      setViewInvoiceModalOpen(false)
    } catch (e: any) { alert(e.message) }
  }

  // --- Filtrage ---
  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-500">Chargement...</div>

  return (
    <div className="space-y-6 p-4">
      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Facturation</h2>
        <input 
          type="text" 
          placeholder="Rechercher..." 
          className="border p-2 rounded-lg w-64 outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">N° Facture</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Client</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">Total TTC</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Statut</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-blue-600">{inv.invoice_number}</td>
                <td className="p-4 font-semibold">{inv.clients?.name || 'Inconnu'}</td>
                <td className="p-4 text-gray-500 text-sm">{formatDate(inv.date)}</td>
                <td className="p-4 text-right font-bold">{formatCurrency(inv.total_ttc)}</td>
                <td className="p-4">{getStatusBadge(inv.status)}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => { setSelectedInvoice(inv); setViewInvoiceModalOpen(true); }}
                    className="text-blue-500 hover:underline text-sm font-bold"
                  >
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Détails */}
      <Modal 
        isOpen={viewInvoiceModalOpen} 
        onClose={() => setViewInvoiceModalOpen(false)} 
        title="Détails de la Facture"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-4">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-bold text-lg">{selectedInvoice.clients?.name}</p>
                <p className="text-sm">{selectedInvoice.clients?.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Facture n°</p>
                <p className="font-mono font-bold text-lg">{selectedInvoice.invoice_number}</p>
              </div>
            </div>

            {/* Liste simplifiée des items */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-bold mb-2 text-sm uppercase text-gray-500">Articles</p>
              {selectedInvoice.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between py-1 border-b border-gray-200 last:border-0">
                  <span>{item.name} (x{item.quantity})</span>
                  <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-xl font-black text-blue-600">
                Total: {formatCurrency(selectedInvoice.total_ttc)}
              </div>
              <div className="space-x-2">
                {selectedInvoice.status !== 'paid' && (
                  <Button variant="success" onClick={() => handleMarkAsPaid(selectedInvoice.id)}>Payer</Button>
                )}
                <Button variant="outline" onClick={() => window.print()}>Imprimer</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
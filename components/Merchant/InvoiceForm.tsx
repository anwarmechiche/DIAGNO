'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface InvoiceFormProps {
  onSubmit: (data: any) => void
  onClose: () => void
  invoice?: any
  deliveryNote?: any
  merchantId: string
  formatCurrency: (value: number) => string
}

export default function InvoiceForm({
  onSubmit,
  onClose,
  invoice,
  deliveryNote,
  merchantId,
  formatCurrency
}: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    client_id: invoice?.client_id || deliveryNote?.client_id || '',
    date: invoice?.date || new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: invoice?.items || deliveryNote?.items || [],
    total_ht: invoice?.total_ht || deliveryNote?.total_ht || 0,
    tva_rate: invoice?.tva_rate || deliveryNote?.tva_rate || 19,
    total_ttc: invoice?.total_ttc || deliveryNote?.total_ttc || 0,
    status: invoice?.status || 'draft',
    payment_method: invoice?.payment_method || '',
    notes: invoice?.notes || '',
    delivery_note_id: deliveryNote?.id || invoice?.delivery_note_id
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Date de facture
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Date d'échéance
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({...formData, due_date: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none"
            required
          />
        </div>
      </div>

      {/* Statut */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Statut
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none"
        >
          <option value="draft">Brouillon</option>
          <option value="pending">En attente</option>
          <option value="paid">Payée</option>
        </select>
      </div>

      {/* Mode de paiement */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Mode de paiement
        </label>
        <select
          value={formData.payment_method}
          onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none"
        >
          <option value="">Sélectionner...</option>
          <option value="cash">Espèces</option>
          <option value="card">Carte bancaire</option>
          <option value="check">Chèque</option>
          <option value="bank_transfer">Virement bancaire</option>
        </select>
      </div>

      {/* Articles */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Articles
        </label>
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-xs font-bold text-gray-500">Article</th>
                <th className="text-right p-3 text-xs font-bold text-gray-500">Prix HT</th>
                <th className="text-right p-3 text-xs font-bold text-gray-500">Qté</th>
                <th className="text-right p-3 text-xs font-bold text-gray-500">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item: any, index: number) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                  <td className="p-3 text-right">{item.quantity}</td>
                  <td className="p-3 text-right font-bold">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totaux */}
      <div className="flex justify-end">
        <div className="w-72 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Total HT:</span>
            <span className="font-bold">{formatCurrency(formData.total_ht)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">TVA ({formData.tva_rate}%):</span>
            <span className="font-bold">{formatCurrency(formData.total_ht * formData.tva_rate / 100)}</span>
          </div>
          <div className="flex justify-between text-lg border-t-2 border-gray-200 pt-2">
            <span className="font-black text-gray-700">Total TTC:</span>
            <span className="font-black text-blue-600">{formatCurrency(formData.total_ttc)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none resize-none"
          placeholder="Notes supplémentaires..."
        />
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-100">
        <Button variant="outline" onClick={onClose} type="button">
          Annuler
        </Button>
        <Button type="submit">
          {invoice ? 'Mettre à jour' : 'Créer la facture'}
        </Button>
      </div>
    </form>
  )
}
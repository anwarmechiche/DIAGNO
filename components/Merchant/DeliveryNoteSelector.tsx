'use client'

import Button from '@/components/ui/Button'

interface DeliveryNoteSelectorProps {
  deliveryNotes: any[]
  onSelect: (deliveryNote: any) => void
  onClose: () => void
  formatCurrency: (value: number) => string
}

export default function DeliveryNoteSelector({ 
  deliveryNotes, 
  onSelect, 
  onClose,
  formatCurrency 
}: DeliveryNoteSelectorProps) {
  
  if (deliveryNotes.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-lg font-bold text-gray-600 mb-2">Aucun bon de livraison disponible</p>
        <p className="text-sm text-gray-500 mb-6">Tous les bons de livraison ont déjà été facturés ou sont en attente de livraison</p>
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Sélectionnez un bon de livraison pour créer une facture :
      </p>
      
      <div className="max-h-96 overflow-y-auto space-y-3">
        {deliveryNotes.map((dn) => (
          <div
            key={dn.id}
            onClick={() => onSelect(dn)}
            className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-mono font-bold text-gray-900">{dn.delivery_note_number}</div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Client:</span> {dn.client_name}
                </div>
                {dn.order_number && (
                  <div className="text-xs text-gray-500">
                    Commande: {dn.order_number}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">{formatCurrency(dn.total_ttc)}</div>
                <div className="text-xs text-gray-500">
                  {new Date(dn.date).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-100">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

// Liste des 69 villes d'Algérie avec codes postaux
const ALGERIAN_CITIES = [
  { name: "Adrar", postalCode: "01000" },
  { name: "Chlef", postalCode: "02000" },
  { name: "Laghouat", postalCode: "03000" },
  { name: "Oum El Bouaghi", postalCode: "04000" },
  { name: "Batna", postalCode: "05000" },
  { name: "Béjaïa", postalCode: "06000" },
  { name: "Biskra", postalCode: "07000" },
  { name: "Béchar", postalCode: "08000" },
  { name: "Blida", postalCode: "09000" },
  { name: "Bouira", postalCode: "10000" },
  { name: "Tamanrasset", postalCode: "11000" },
  { name: "Tébessa", postalCode: "12000" },
  { name: "Tlemcen", postalCode: "13000" },
  { name: "Tiaret", postalCode: "14000" },
  { name: "Tizi Ouzou", postalCode: "15000" },
  { name: "Alger", postalCode: "16000" },
  { name: "Djelfa", postalCode: "17000" },
  { name: "Jijel", postalCode: "18000" },
  { name: "Sétif", postalCode: "19000" },
  { name: "Saïda", postalCode: "20000" },
  { name: "Skikda", postalCode: "21000" },
  { name: "Sidi Bel Abbès", postalCode: "22000" },
  { name: "Annaba", postalCode: "23000" },
  { name: "Guelma", postalCode: "24000" },
  { name: "Constantine", postalCode: "25000" },
  { name: "Médéa", postalCode: "26000" },
  { name: "Mostaganem", postalCode: "27000" },
  { name: "M'Sila", postalCode: "28000" },
  { name: "Mascara", postalCode: "29000" },
  { name: "Ouargla", postalCode: "30000" },
  { name: "Oran", postalCode: "31000" },
  { name: "El Bayadh", postalCode: "32000" },
  { name: "Illizi", postalCode: "33000" },
  { name: "Bordj Bou Arréridj", postalCode: "34000" },
  { name: "Boumerdès", postalCode: "35000" },
  { name: "El Tarf", postalCode: "36000" },
  { name: "Tindouf", postalCode: "37000" },
  { name: "Tissemsilt", postalCode: "38000" },
  { name: "El Oued", postalCode: "39000" },
  { name: "Khenchela", postalCode: "40000" },
  { name: "Souk Ahras", postalCode: "41000" },
  { name: "Tipaza", postalCode: "42000" },
  { name: "Mila", postalCode: "43000" },
  { name: "Aïn Defla", postalCode: "44000" },
  { name: "Naâma", postalCode: "45000" },
  { name: "Aïn Témouchent", postalCode: "46000" },
  { name: "Ghardaïa", postalCode: "47000" },
  { name: "Relizane", postalCode: "48000" },
  { name: "Timimoun", postalCode: "49000" },
  { name: "Bordj Badji Mokhtar", postalCode: "50000" },
  { name: "Ouled Djellal", postalCode: "51000" },
  { name: "Béni Abbès", postalCode: "52000" },
  { name: "In Salah", postalCode: "53000" },
  { name: "In Guezzam", postalCode: "54000" },
  { name: "Touggourt", postalCode: "55000" },
  { name: "Djanet", postalCode: "56000" },
  { name: "El Meghaier", postalCode: "57000" },
  { name: "El Menia", postalCode: "58000" }
].sort((a, b) => a.name.localeCompare(b.name))

type Client = {
  id?: string
  name: string
  client_id: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  wilaya?: string
  payment_mode?: string
  credit_limit?: number
  fiscal_number?: string  // IF - Identifiant Fiscal
  ai_number?: string      // AI - Article d'Imposition
  agrement_number?: string // N° Agr - Numéro d'agrément
  notes?: string
  active: boolean
  show_price: boolean
  show_quantity: boolean
  merchant_id: string
}

interface ClientFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (clientData: Partial<Client>) => Promise<void>
  client: Client | null
  merchantId: string
}

export default function ClientForm({
  isOpen,
  onClose,
  onSubmit,
  client,
  merchantId,
}: ClientFormProps) {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    client_id: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    wilaya: '',
    payment_mode: '',
    credit_limit: 0,
    fiscal_number: '',
    ai_number: '',
    agrement_number: '',
    notes: '',
    active: true,
    show_price: true,
    show_quantity: true,
    merchant_id: merchantId,
  })

  const [loading, setLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const [activeSection, setActiveSection] = useState(0)
  
  // Références pour le scroll
  const sectionRefs = [
    useRef<HTMLDivElement>(null), // Identité
    useRef<HTMLDivElement>(null), // Contact
    useRef<HTMLDivElement>(null), // Adresse
    useRef<HTMLDivElement>(null), // Documents
    useRef<HTMLDivElement>(null), // Paiement
    useRef<HTMLDivElement>(null), // Notes
    useRef<HTMLDivElement>(null), // Paramètres
  ]

  // Sections pour la navigation
  const sections = [
    { id: 'identity', label: 'Identité', icon: '👤' },
    { id: 'contact', label: 'Contact', icon: '📞' },
    { id: 'address', label: 'Adresse', icon: '📍' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'payment', label: 'Paiement', icon: '💰' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' },
  ]

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        client_id: client.client_id,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        postal_code: client.postal_code || '',
        wilaya: client.wilaya || '',
        payment_mode: client.payment_mode || '',
        credit_limit: client.credit_limit || 0,
        fiscal_number: client.fiscal_number || '',
        ai_number: client.ai_number || '',
        agrement_number: client.agrement_number || '',
        notes: client.notes || '',
        active: client.active,
        show_price: client.show_price,
        show_quantity: client.show_quantity,
        merchant_id: client.merchant_id,
      })
      setSelectedCity(client.city || '')
    } else {
      setFormData({
        name: '',
        client_id: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        wilaya: '',
        payment_mode: '',
        credit_limit: 0,
        fiscal_number: '',
        ai_number: '',
        agrement_number: '',
        notes: '',
        active: true,
        show_price: true,
        show_quantity: true,
        merchant_id: merchantId,
      })
      setSelectedCity('')
    }
  }, [client, merchantId])

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value
    setSelectedCity(cityName)
    
    const city = ALGERIAN_CITIES.find(c => c.name === cityName)
    setFormData({ 
      ...formData, 
      city: cityName,
      postal_code: city?.postalCode || '',
      wilaya: cityName
    })
  }

  // Fonction pour scroller vers une section
  const scrollToSection = (index: number) => {
    setActiveSection(index)
    sectionRefs[index].current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }

  // Gestion de la molette
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    container.scrollTop += e.deltaY
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? '✏️ Modifier le médecin' : '➕ Ajouter un médecin'}
      icon={client ? '✏️' : '➕'}
    >
      <div className="flex gap-4">
        {/* Navigation latérale style roulette */}
        <div className="w-40 shrink-0">
          <div className="sticky top-0 bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
              <h4 className="text-xs font-semibold text-blue-800 text-center">Navigation</h4>
            </div>
            <div className="p-1">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(index)}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs transition-all flex items-center gap-2 ${
                    activeSection === index
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-sm">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
            
            {/* Indicateur de progression */}
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500 text-center">
                Section {activeSection + 1}/{sections.length}
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${((activeSection + 1) / sections.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire avec molette */}
        <div 
          className="flex-1 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
          onWheel={handleWheel}
          style={{ scrollBehavior: 'smooth' }}
        >
          <form onSubmit={handleSubmit} className="space-y-6 pb-4">
            {/* Section Identité */}
            <div 
              ref={sectionRefs[0]} 
              className="bg-blue-50/30 p-4 rounded-lg border border-blue-100 scroll-mt-2"
            >
              <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                👤 Identité du médecin
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Nom complet <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Dr. Nom et prénom"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    ID Client <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.client_id || ''}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="MED-001"
                  />
                </div>
              </div>
            </div>

            {/* Section Contact */}
            <div 
              ref={sectionRefs[1]} 
              className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 scroll-mt-2"
            >
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-slate-400 rounded-full"></span>
                📞 Contact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">📧</span>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="email@cabinet.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Téléphone</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">📞</span>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="+213 XXX XX XX XX"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Adresse */}
            <div 
              ref={sectionRefs[2]} 
              className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 scroll-mt-2"
            >
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-slate-400 rounded-full"></span>
                📍 Adresse du cabinet
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Viaalle</label>
                  <select
                    value={selectedCity}
                    onChange={handleCityChange}
className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-black"                  >
                    <option value="">Sélectionner une ville</option>
                    {ALGERIAN_CITIES.map(city => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Code postal</label>
                    <input
                      type="text"
                      value={formData.postal_code || ''}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500"
                      placeholder="Auto-rempli"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Wilaya</label>
                    <input
                      type="text"
                      value={formData.wilaya || formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Wilaya"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Adresse complète</label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    rows={2}
                    placeholder="Numéro, rue, quartier, bâtiment..."
                  />
                </div>
              </div>
            </div>

            {/* Section Documents */}
            <div 
              ref={sectionRefs[3]} 
              className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 scroll-mt-2"
            >
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-slate-400 rounded-full"></span>
                📄 Documents (optionnels)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">IF (Identifiant Fiscal)</label>
                  <input
                    type="text"
                    value={formData.fiscal_number || ''}
                    onChange={(e) => setFormData({ ...formData, fiscal_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Optionnel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">AI (Article d'Imposition)</label>
                  <input
                    type="text"
                    value={formData.ai_number || ''}
                    onChange={(e) => setFormData({ ...formData, ai_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Optionnel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">N° Agrément</label>
                  <input
                    type="text"
                    value={formData.agrement_number || ''}
                    onChange={(e) => setFormData({ ...formData, agrement_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Optionnel"
                  />
                </div>
              </div>
            </div>

            {/* Section Paiement */}
            <div 
              ref={sectionRefs[4]} 
              className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 scroll-mt-2"
            >
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-slate-400 rounded-full"></span>
                💰 Paiement
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Mode de paiement</label>
                  <select
                    value={formData.payment_mode || ''}
                    onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                  >
                    <option value="">Sélectionner</option>
                    <option value="cash">💵 Espèces</option>
                    <option value="check">📝 Chèque</option>
                    <option value="transfer">🏦 Virement</option>
                    <option value="credit">💳 Crédit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Limite de crédit (DZD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">💰</span>
                    <input
                      type="number"
                      value={formData.credit_limit || 0}
                      onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Notes */}
            <div 
              ref={sectionRefs[5]} 
              className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 scroll-mt-2"
            >
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-slate-400 rounded-full"></span>
                📝 Notes
              </h4>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                rows={2}
                placeholder="Spécialité, horaires, informations complémentaires..."
              />
            </div>

            {/* Section Paramètres */}
            <div 
              ref={sectionRefs[6]} 
              className="bg-blue-50/30 p-4 rounded-lg border border-blue-100 scroll-mt-2"
            >
              <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                ⚙️ Paramètres d'affichage
              </h4>
              <div className="flex flex-wrap gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active || false}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Client actif</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_price || false}
                    onChange={(e) => setFormData({ ...formData, show_price: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Afficher les prix</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_quantity || false}
                    onChange={(e) => setFormData({ ...formData, show_quantity: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Afficher les quantités</span>
                </label>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                loading={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
              >
                {loading ? (
                  <>⏳ Traitement...</>
                ) : (
                  <>{client ? '✏️ Mettre à jour' : '➕ Créer le médecin'}</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Styles pour la scrollbar personnalisée */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </Modal>
  )
}
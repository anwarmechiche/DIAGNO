'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Building2, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

interface CompanyInfoFormProps {
  merchantId: string
}

export default function CompanyInfoForm({ merchantId }: CompanyInfoFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    rc: '',
    nif: '',
    nis: '',
    ai: ''
  })

  // Charger les informations existantes
  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        setError(null)
        console.log('Chargement des infos pour merchant:', merchantId)
        
        const { data, error } = await supabase
          .from('merchants')
          .select('rc, nif, nis, ai')
          .eq('id', merchantId)
          .single()

        if (error) {
          console.error('Erreur Supabase:', error)
          throw error
        }

        console.log('Données chargées:', data)

        if (data) {
          setFormData({
            rc: data.rc?.toString() || '',
            nif: data.nif?.toString() || '',
            nis: data.nis?.toString() || '',
            ai: data.ai?.toString() || ''
          })
        }
      } catch (error: any) {
        console.error('Erreur chargement:', error)
        setError(`Erreur de chargement: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (merchantId) loadCompanyInfo()
  }, [merchantId])

  // Sauvegarder les modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('Sauvegarde pour merchant:', merchantId)
      console.log('Données à sauvegarder:', formData)

      // Vérifier que merchantId est valide
      if (!merchantId) {
        throw new Error('ID marchand manquant')
      }

      // Préparer les données
      const updates = {
        rc: formData.rc ? parseInt(formData.rc) : null,
        nif: formData.nif ? parseInt(formData.nif) : null,
        nis: formData.nis ? parseInt(formData.nis) : null,
        ai: formData.ai ? parseInt(formData.ai) : null,
        updated_at: new Date().toISOString()
      }

      console.log('Updates:', updates)

      const { data, error } = await supabase
        .from('merchants')
        .update(updates)
        .eq('id', merchantId)
        .select()

      if (error) {
        console.error('Erreur Supabase:', error)
        throw error
      }

      console.log('Réponse Supabase:', data)
      setSuccess(true)
      
      // Cacher le message de succès après 3 secondes
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error)
      setError(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin text-blue-600" size={24} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Informations fiscales</h3>
            <p className="text-xs text-gray-500">Ces informations apparaîtront sur vos factures et bons de livraison</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Messages d'erreur/succès */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <div>
              <p className="text-sm font-medium text-red-800">Erreur</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-500" size={20} />
            <p className="text-sm text-green-700">✅ Informations mises à jour avec succès</p>
          </div>
        )}

        {/* Merchant ID caché pour débogage */}
        <div className="mb-4 text-xs text-gray-400">
          Merchant ID: {merchantId}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RC - Registre de Commerce */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RC <span className="text-gray-400 text-xs">(Registre de Commerce)</span>
            </label>
            <input
              type="text"
              name="rc"
              value={formData.rc}
              onChange={handleChange}
              placeholder="Ex: RC-123456"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* NIF - Numéro d'Identification Fiscale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIF <span className="text-gray-400 text-xs">(Numéro d'Identification Fiscale)</span>
            </label>
            <input
              type="text"
              name="nif"
              value={formData.nif}
              onChange={handleChange}
              placeholder="Ex: 123456789"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* NIS - Numéro d'Identification Statistique */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIS <span className="text-gray-400 text-xs">(Numéro d'Identification Statistique)</span>
            </label>
            <input
              type="text"
              name="nis"
              value={formData.nis}
              onChange={handleChange}
              placeholder="Ex: 123456789012345"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* AI - Article d'Imposition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI <span className="text-gray-400 text-xs">(Article d'Imposition)</span>
            </label>
            <input
              type="text"
              name="ai"
              value={formData.ai}
              onChange={handleChange}
              placeholder="Ex: 000465"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Message d'information */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <span className="text-lg">ℹ️</span>
            Ces informations seront automatiquement ajoutées sur vos factures et bons de livraison
          </p>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save size={18} />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>

      {/* Aperçu de ce qui apparaîtra sur les documents */}
      <div className="border-t border-gray-200 bg-gray-50 p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
          Aperçu sur vos documents :
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xs text-gray-400 mb-1">RC</div>
            <div className="font-mono font-medium">{formData.rc || 'Non renseigné'}</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xs text-gray-400 mb-1">NIF</div>
            <div className="font-mono font-medium">{formData.nif || 'Non renseigné'}</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xs text-gray-400 mb-1">NIS</div>
            <div className="font-mono font-medium">{formData.nis || 'Non renseigné'}</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xs text-gray-400 mb-1">AI</div>
            <div className="font-mono font-medium">{formData.ai || 'Non renseigné'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
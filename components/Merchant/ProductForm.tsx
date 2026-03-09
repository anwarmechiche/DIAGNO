'use client'

import { useState, useEffect, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (productData: Partial<Product>) => Promise<void>
  product?: Product | null
}

export default function ProductForm({ isOpen, onClose, onSubmit, product }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    provenance: '',
    description: '',
    lot_number: '',
    reference_code: '',
    supplier: '',
    expiration_date: '',
    volume_ml: '',
    active: true
  })
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Fonction de compression d'image
  const processAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          const MAX_SIZE = 800
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width
              width = MAX_SIZE
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height
              height = MAX_SIZE
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          
          if (ctx) {
            ctx.fillStyle = "#FFFFFF"
            ctx.fillRect(0, 0, width, height)
            ctx.drawImage(img, 0, 0, width, height)
          }

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5)
          resolve(compressedBase64)
        }
        img.onerror = () => reject("Erreur lors du traitement de l'image")
      }
      reader.onerror = () => reject("Erreur de lecture du fichier")
    })
  }

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        provenance: product.provenance || '',
        description: product.description || '',
        supplier: product.supplier || '',
        reference_code: product.reference_code || '',
        lot_number: product.lot_number || '',
        expiration_date: product.expiration_date || '',
        volume_ml: product.volume_ml?.toString() || '',
        active: product.active !== false
      })
      setPreviewUrl(product.image_data || '')
    } else {
      resetForm()
    }
  }, [product, isOpen])

  const resetForm = () => {
    setFormData({ 
      name: '', 
      price: '', 
      description: '', 
      provenance: '', 
      supplier: '',
      reference_code: '',
      lot_number: '',
      expiration_date: '',
      volume_ml: '',
      active: true 
    })
    setPreviewUrl('')
    setImageFile(null)
    setError('')
    setSuccess('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => setPreviewUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const productData: any = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim() || null,
        supplier: formData.supplier.trim() || null,
        provenance: formData.provenance.trim() || null, 
        reference_code: formData.reference_code.trim() || null,
        lot_number: formData.lot_number.trim() || null,
        expiration_date: formData.expiration_date || null,
        volume_ml: formData.volume_ml ? parseFloat(formData.volume_ml) : null,
        active: formData.active
      }

      if (imageFile) {
        productData.image = await processAndCompressImage(imageFile)
      } else if (previewUrl) {
        productData.image = previewUrl
      }

      await onSubmit(productData)
      setSuccess('Produit enregistré avec succès !')
      setTimeout(() => {
        onClose()
        resetForm()
      }, 1500)
    } catch (err: any) {
      setError("Erreur : " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
    >
      {/* En-tête fixe */}
      <div className="border-b border-purple-100 pb-4 mb-4 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <span className="text-xl text-purple-600">
                {product ? '✏️' : '➕'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-800">
                {product ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <p className="text-xs text-gray-500">
                {product ? 'Modifiez les informations' : 'Créez un nouveau produit'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-3 h-px bg-purple-100"></div>
      </div>

      {/* Zone défilante avec scroll */}
      <div 
        ref={scrollContainerRef}
        className="overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-purple-50"
        style={{ 
          maxHeight: 'calc(80vh - 180px)',
          minHeight: '300px'
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto pb-2">
          {/* Section Informations générales */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-3">
              Informations générales
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-600">
                  Nom <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-300 outline-none transition-shadow"
                  placeholder="Nom du produit"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-gray-600">
                  Prix (DA) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-300 outline-none"
                    placeholder="0.00"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">DA</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-600">Code référence</label>
                <input
                  type="text"
                  value={formData.reference_code}
                  onChange={(e) => setFormData({ ...formData, reference_code: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-300 outline-none"
                  placeholder="REF-001"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Numéro de lot</label>
                <input
                  type="text"
                  value={formData.lot_number}
                  onChange={(e) => setFormData({ ...formData, lot_number: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-300 outline-none"
                  placeholder="LOT-2024-001"
                />
              </div>
            </div>
          </div>

          {/* Section Détails produit */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-3">
              Détails produit
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Fournisseur</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-300 outline-none"
                  placeholder="Nom du fournisseur"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-600">Provenance</label>
                <input
                  type="text"
                  value={formData.provenance}
                  onChange={(e) => setFormData({ ...formData, provenance: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-300 outline-none"
                  placeholder="Pays d'origine"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-600">Volume (ml)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.volume_ml}
                    onChange={(e) => setFormData({ ...formData, volume_ml: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-300 outline-none"
                    placeholder="500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">ml</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-600">Date d'expiration</label>
                <input
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-300 outline-none"
                />
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <label className="text-xs text-gray-600">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-300 outline-none h-20 resize-none"
                placeholder="Description du produit..."
              />
            </div>
          </div>

          {/* Section Image */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-3">
              Image
            </h3>
            
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="relative group">
                <div className={`w-20 h-20 bg-gray-50 rounded-md border overflow-hidden ${
                  previewUrl ? 'border-purple-200' : 'border-gray-200 border-dashed'
                }`}>
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">
                      🖼️
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100 cursor-pointer"
                />
                <p className="text-[10px] text-purple-400 mt-2">
                  ⚡ Compression auto (JPEG, max 800px)
                </p>
              </div>
            </div>
          </div>

          {/* Section Statut */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active-status"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-purple-400 border-gray-300 rounded focus:ring-purple-200"
              />
              <div>
                <label htmlFor="active-status" className="text-sm text-gray-700 cursor-pointer">
                  Produit disponible à la vente
                </label>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-md border border-red-100">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-purple-50 text-purple-600 text-xs rounded-md border border-purple-100">
              ✓ {success}
            </div>
          )}
        </form>
      </div>

      {/* Boutons fixes en bas */}
      <div className="border-t border-gray-200 pt-4 mt-4 sticky bottom-0 bg-white z-10">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose} 
            className="flex-1 py-2 text-sm border border-gray-200 hover:bg-gray-50"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading} 
            onClick={handleSubmit}
            className="flex-[2] py-2 text-sm bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 disabled:opacity-50"
          >
            {loading ? 'Optimisation...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
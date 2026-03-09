import { supabase } from '@/lib/supabase'

// --- INTERFACES ---

export interface Merchant {
  id: string
  merchant_id: string
  name: string
  password: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  merchant_id: string
  client_id: string
  name: string
  password: string
  email?: string
  phone?: string
  address?: string
  city?: string
  zip?: string
  wilaya?: string
  payment_mode?: string
  credit_limit?: number
  fiscal_number?: string
  notes?: string
  active: boolean
  show_price: boolean
  show_quantity: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  merchant_id: string
  name: string
  price: number
  description?: string
  image_data?: string
  image?: string // Ajout pour la compatibilité avec le champ image
  active: boolean
  created_at: string
  updated_at: string
  provenance?: string
  reference_code?: string
  lot_number?: string
  supplier?: string
  volume_ml?: number // Ajout du champ manquant
  expiration_date?: string // Ajout du champ manquant
}

export interface Order {
  id: string
  merchant_id: string
  client_id: string
  product_id: string
  quantity: number
  status: 'pending' | 'delivered'
  client_email?: string // Ajouté pour les notifications mail
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  client_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

// --- CLASSE CLIENT ---

export class SupabaseClient {
  
  // 1. AUTHENTIFICATION
  async loginMerchant(merchantId: string, password: string): Promise<Merchant | null> {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('password', password)
      .single()

    if (error || !data) return null
    return data
  }

  async loginClient(clientId: string, password: string, merchantId: string): Promise<Client | null> {
    try {
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('merchant_id', merchantId)
        .single()

      if (merchantError || !merchantData) return null

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('client_id', clientId)
        .eq('password', password)
        .eq('merchant_id', merchantData.id)
        .single()

      if (error || !data) return null
      return data
    } catch (error) {
      console.error('Login client error:', error)
      return null
    }
  }

  // 2. RÉCUPÉRATION DE DONNÉES (LISTES)
  async getProducts(merchantId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })

    if (error) return []
    
    // Transformer les données pour inclure image_data si image existe
    const products = data?.map(product => ({
      ...product,
      image_data: product.image || undefined // Pour la compatibilité avec l'ancien code
    })) || []
    
    return products
  }

  async getClients(merchantId: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })

    if (error) return []
    return data || []
  }

  async getOrders(merchantId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })

    if (error) return []
    return data || []
  }

  // 3. RÉCUPÉRATION PAR ID
  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      
    if (error) return null
    
    // Transformer pour inclure image_data
    if (data) {
      return {
        ...data,
        image_data: data.image || undefined
      }
    }
    return null
  }

  async getClientById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
      
    if (error) return null
    return data
  }

  // 4. GESTION DES NOTIFICATIONS
  async getNotifications(clientId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get notifications error:', error)
      return []
    }
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    return !error
  }

  // 5. CRUD OPÉRATIONS (INSERT / UPDATE / DELETE)
  async createProduct(product: any): Promise<Product | null> {
    // Préparer les données pour l'insertion
    const productData: any = {
      name: product.name,
      price: product.price,
      description: product.description || null,
      supplier: product.supplier || null,
      active: product.active ?? true,
      volume_ml: product.volume_ml || null,
      expiration_date: product.expiration_date || null,
      provenance: product.provenance || null,
      reference_code: product.reference_code || null,
      lot_number: product.lot_number || null,
      image: product.image || null, // Stockage Base64 compressé
      merchant_id: parseInt(product.merchant_id) // Forcer le format int8
    }

    // Supprimer les propriétés undefined
    Object.keys(productData).forEach(key => 
      productData[key] === undefined && delete productData[key]
    )

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) {
      console.error("Erreur Supabase createProduct:", error.message)
      throw error
    }
    
    // Transformer la réponse pour inclure image_data
    if (data) {
      return {
        ...data,
        image_data: data.image || undefined
      }
    }
    return null
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    // Préparer les mises à jour
    const updateData: any = { 
      ...updates, 
      updated_at: new Date().toISOString() 
    }
    
    // Gérer le cas où image_data est fourni
    if (updates.image_data) {
      updateData.image = updates.image_data
      delete updateData.image_data
    }

    // Supprimer les propriétés undefined
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    )

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
      
    if (error) {
      console.error("Erreur Supabase updateProduct:", error.message)
      return null
    }
    
    // Transformer la réponse
    if (data) {
      return {
        ...data,
        image_data: data.image || undefined
      }
    }
    return null
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      
    if (error) {
      console.error("Erreur Supabase deleteProduct:", error.message)
      return false
    }
    return true
  }

  async createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .insert([{ 
        ...client, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }])
      .select()
      .single()
      
    if (error) {
      console.error("Erreur Supabase createClient:", error.message)
      return null
    }
    return data
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()
      
    if (error) {
      console.error("Erreur Supabase updateClient:", error.message)
      return null
    }
    return data
  }

  async deleteClient(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      
    if (error) {
      console.error("Erreur Supabase deleteClient:", error.message)
      return false
    }
    return true
  }

  async createOrder(order: any): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Create order error details:', error.message)
        return null
      }
      return data
    } catch (error) {
      console.error('Create order exception:', error)
      return null
    }
  }

  async createMerchant(merchant: Omit<Merchant, 'id' | 'created_at' | 'updated_at'>): Promise<Merchant | null> {
    const { data, error } = await supabase
      .from('merchants')
      .insert([{ 
        ...merchant, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }])
      .select()
      .single()
      
    if (error) {
      console.error("Erreur Supabase createMerchant:", error.message)
      return null
    }
    return data
  }
}

export const db = new SupabaseClient()
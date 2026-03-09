import { supabase } from '@/lib/supabase'

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
  agrement_number?: string
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
  image?: string
  active: boolean
  created_at: string
  updated_at: string
  provenance: string
  reference_code: string
}

export interface Order {
  id: string
  merchant_id: string
  client_id: string
  product_id: string
  quantity: number
  status: 'pending' | 'delivered'
  created_at: string
  updated_at: string
}

export class SupabaseClient {
  async loginMerchant(merchantId: string, password: string): Promise<Merchant | null> {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('password', password)
        .single()
      if (error) { console.error('Login merchant error:', error.message); return null }
      return data as Merchant
    } catch (error) { console.error('Login merchant exception:', error); return null }
  }

  async loginClient(clientId: string, password: string, merchantId: string): Promise<Client | null> {
    try {
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants').select('id').eq('merchant_id', merchantId).single()
      if (merchantError || !merchantData) return null

      const { data, error } = await supabase
        .from('clients').select('*')
        .eq('client_id', clientId).eq('password', password).eq('merchant_id', merchantData.id).single()
      if (error) return null
      return data as Client
    } catch (error) { console.error('Login client exception:', error); return null }
  }

  async createMerchant(merchant: Omit<Merchant, 'id' | 'created_at' | 'updated_at'>): Promise<Merchant | null> {
    try {
      const { data, error } = await supabase.from('merchants')
        .insert([{ ...merchant, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select().single()
      if (error) throw error
      return data as Merchant
    } catch (error) { console.error('Create merchant error:', error); return null }
  }

  async createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> {
    try {
      const { data, error } = await supabase.from('clients')
        .insert([{ ...client, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select().single()
      if (error) throw error
      return data as Client
    } catch (error) { console.error('Create client error:', error); return null }
  }

  async getProducts(merchantId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from('products').select('*')
        .eq('merchant_id', merchantId).order('created_at', { ascending: false })
      if (error) return []
      return data as Product[] || []
    } catch (error) { console.error('Get products exception:', error); return [] }
  }

  async getClients(merchantId: string): Promise<Client[]> {
    try {
      const { data, error } = await supabase.from('clients').select('*')
        .eq('merchant_id', merchantId).order('created_at', { ascending: false })
      if (error) return []
      return data as Client[] || []
    } catch (error) { console.error('Get clients exception:', error); return [] }
  }

  async getOrders(merchantId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase.from('orders').select('*')
        .eq('merchant_id', merchantId).order('created_at', { ascending: false })
      if (error) return []
      return data as Order[] || []
    } catch (error) { console.error('Get orders exception:', error); return [] }
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
    try {
      const { data, error } = await supabase.from('products')
        .insert([{ ...product, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select().single()
      if (error) throw error
      return data as Product
    } catch (error) { console.error('Create product error:', error); return null }
  }

  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> {
    try {
      const { data, error } = await supabase.from('orders')
        .insert([{ ...order, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select().single()
      if (error) throw error
      return data as Order
    } catch (error) { console.error('Create order error:', error); return null }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
      if (error) return null
      return data as Product
    } catch (error) { console.error('Get product by id exception:', error); return null }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const { data, error } = await supabase.from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id).select().single()
      if (error) { console.error('Update product error:', error); return null }
      return data as Product
    } catch (error) { console.error('Update product exception:', error); return null }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) return false
      return true
    } catch (error) { console.error('Delete product error:', error); return false }
  }

  async getClientById(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()
      if (error) return null
      return data as Client
    } catch (error) { console.error('Get client by id exception:', error); return null }
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    try {
      const { data, error } = await supabase.from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id).select().single()
      if (error) return null
      return data as Client
    } catch (error) { console.error('Update client error:', error); return null }
  }

  async getMerchantSettings(merchantId: string): Promise<any> {
    try {
      const { data, error } = await supabase.from('merchant_settings').select('*')
        .eq('merchant_id', merchantId).single()
      if (error) { console.error('Get merchant settings error:', error); return null }
      return data
    } catch (error) { console.error('Get merchant settings exception:', error); return null }
  }

  async saveMerchantSettings(settings: any): Promise<boolean> {
    try {
      const { error } = await supabase.from('merchant_settings')
        .upsert(settings, { onConflict: 'merchant_id' })
      if (error) { console.error('Save merchant settings error:', error); return false }
      return true
    } catch (error) { console.error('Save merchant settings exception:', error); return false }
  }

  async uploadLogo(merchantId: string, file: File): Promise<{ url: string } | null> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${merchantId}-${Date.now()}.${fileExt}`
      const filePath = `merchant-logos/${fileName}`
      const { error } = await supabase.storage.from('merchant-assets').upload(filePath, file)
      if (error) { console.error('Upload logo error:', error); return null }
      const { data } = supabase.storage.from('merchant-assets').getPublicUrl(filePath)
      return { url: data.publicUrl }
    } catch (error) { console.error('Upload logo exception:', error); return null }
  }
}

export const db = new SupabaseClient()
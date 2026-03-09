// lib/supabase/index.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const db = {
  // Méthodes basiques
  getMerchantSettings: async (merchantId: string) => {
    const { data } = await supabase
      .from('merchant_settings')
      .select('*')
      .eq('merchant_id', merchantId)
      .single()
    return data
  },
  
  saveMerchantSettings: async (settings: any) => {
    const { error } = await supabase
      .from('merchant_settings')
      .upsert(settings, { onConflict: 'merchant_id' })
    return !error
  },
  
  // Autres méthodes essentielles
  loginMerchant: async (merchantId: string, password: string) => {
    const { data } = await supabase
      .from('merchants')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('password', password)
      .single()
    return data
  },
  
  loginClient: async (clientId: string, password: string, merchantId: string) => {
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('merchant_id', merchantId)
      .single()

    if (!merchant) return null

    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('client_id', clientId)
      .eq('password', password)
      .eq('merchant_id', merchant.id)
      .single()
    return data
  },
  
  // Méthodes par défaut pour les autres
  getProductById: async (id: string) => null,
  getProducts: async (merchantId: string) => [],
  getClients: async (merchantId: string) => [],
  getOrders: async (merchantId: string) => [],
  uploadLogo: async () => ({ url: '' }),
}
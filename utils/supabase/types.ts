// utils/supabase/types.ts
export interface Product {
  id: string
  merchant_id: string
  name: string
  price: number
  description?: string
  image_data?: string
  stock?: number
  active: boolean
  created_at: string
  updated_at: string
  provenance: string
  reference_code: string
  lot_number: string
 
}

export interface Order {
  id: string
  merchant_id: string
  client_id: string
  product_id: string
  quantity: number
  status: 'pending' | 'validated' | 'delivered' | 'cancelled'
  order_group_id?: string  // 🔥 NOUVEAU
  created_at: string
  updated_at: string
}

export interface OrderGroup {  // 🔥 NOUVEAU
  order_group_id: string
  merchant_id: string
  client_id: string
  created_at: string
  updated_at: string
  total_items: number
  total_quantity: number
  status: 'pending' | 'validated' | 'delivered' | 'cancelled'
  orders: Order[]
}

export interface Client {
  id: string
  merchant_id: string
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

export interface Merchant {
  id: string
  merchant_id: string
  name: string
  password: string
  created_at: string
  updated_at: string
}

export interface MerchantSettings {
  id: string
  merchant_id: string
  company_name: string
  company_email: string
  company_phone: string
  company_address: string
  company_city: string
  company_country: string
  company_website: string
  tax_id: string
  trade_registry: string
  bank_name: string
  bank_account: string
  currency: string
  payment_terms: number
  invoice_prefix: string
  invoice_start_number: number
  logo_url: string
  theme_color: string
  language: string
  timezone: string
  notification_email: boolean
  notification_sms: boolean
  notification_whatsapp: boolean
  auto_invoice: boolean
  auto_reminder: boolean
  reminder_days: number
  signature: string
  notes: string
  created_at: string
  updated_at: string
}

export interface BrandSettings {
  name: string
  fiscal: string
  logo: string
}

export interface CartItem {
  productId: string
  quantity: number
  product?: Product
}
export interface Invoice {
  id: string
  merchant_id: string
  client_id: string       // Relation avec l'interface Client
  invoice_number: string   // Ex: "FAC-2024-001"
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  
  // Détails financiers
  total_ht: number
  tva_rate: number         // Ex: 19 pour l'Algérie
  total_tva: number
  total_ttc: number
  
  // Dates
  issue_date: string
  due_date: string
  
  // Informations complémentaires
  notes?: string
  payment_method?: 'cash' | 'check' | 'transfer' | 'other'
  
  created_at: string
  updated_at: string
  
  // Optionnel : Inclusion des données du client pour l'affichage/PDF
  client?: Client 
}

// Optionnel : Si vous voulez gérer des lignes de facture détaillées
export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
}
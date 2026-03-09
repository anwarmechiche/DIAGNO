// utils/orderUtils.ts
export interface OrderSlip {
  id: string
  clientName: string
  merchantId: string
  date: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax?: number
  total: number
  status: 'pending'
}

export const generateOrderSlip = (
  clientName: string,
  merchantId: string,
  cartItems: any[],
  products: Product[]
): OrderSlip => {
  const items = cartItems.map(({ productId, quantity }) => {
    const product = products.find(p => String(p.id) === String(productId))
    return {
      name: product?.name || 'Produit',
      quantity,
      unitPrice: product?.price || 0,
      total: (product?.price || 0) * quantity
    }
  })

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)

  return {
    id: `BON-${Date.now()}`,
    clientName,
    merchantId,
    date: new Date().toISOString(),
    items,
    subtotal,
    total: subtotal,
    status: 'pending'
  }
}
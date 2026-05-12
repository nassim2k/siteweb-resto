'use client'

import { useState, useCallback } from 'react'
import { CartItem, Product } from '@/types'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === productId)
      if (existing && existing.quantity > 1) {
        return prev.map(i =>
          i.product_id === productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
      }
      return prev.filter(i => i.product_id !== productId)
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return { items, addItem, removeItem, clearCart, total, itemCount }
}

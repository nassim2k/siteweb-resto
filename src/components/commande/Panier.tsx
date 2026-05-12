'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Plus, Minus, Trash2, Send } from 'lucide-react'
import { Product, CartItem } from '@/types'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, generateCode } from '@/lib/utils'

interface PanierProps {
  items: CartItem[]
  onAdd: (product: Product) => void
  onRemove: (productId: string) => void
  onClear: () => void
}

export default function Panier({ items, onAdd, onRemove, onClear }: PanierProps) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[var(--primary)] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform"
      >
        <ShoppingBag size={24} />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
            {itemCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="relative w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Votre commande</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Panier vide</p>
              ) : (
                items.map(item => (
                  <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRemove(item.product_id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => onAdd({ id: item.product_id, name: item.name, price: item.price } as Product)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-xl font-bold text-[var(--primary)]">{formatPrice(total)}</span>
                </div>
                <Button
                  onClick={() => { onClear(); setOpen(false) }}
                  variant="primary"
                  className="w-full"
                >
                  <Send size={18} />
                  Passer la commande
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  )
}

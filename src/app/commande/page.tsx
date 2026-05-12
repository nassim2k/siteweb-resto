'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ProductFamily, Product, CartItem } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Panier from '@/components/commande/Panier'
import ValidationEmail from '@/components/commande/ValidationEmail'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Check } from 'lucide-react'

export default function CommandePage() {
  const supabase = createClient()
  const [families, setFamilies] = useState<ProductFamily[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [activeFamily, setActiveFamily] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [step, setStep] = useState<'catalogue' | 'client' | 'code' | 'success'>('catalogue')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  useEffect(() => {
    supabase.from('product_families').select('*').eq('active', true).order('sort_order').then(({ data }) => {
      if (data) { setFamilies(data); if (data.length > 0) setActiveFamily(data[0].id) }
    })
  }, [])

  useEffect(() => {
    if (!activeFamily) return
    supabase.from('products').select('*').eq('family_id', activeFamily).eq('active', true).order('name').then(({ data }) => {
      if (data) setProducts(data)
    })
  }, [activeFamily])

  const addItem = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  const removeItem = (productId: string) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product_id === productId)
      if (existing && existing.quantity > 1) return prev.map(i => i.product_id === productId ? { ...i, quantity: i.quantity - 1 } : i)
      return prev.filter(i => i.product_id !== productId)
    })
  }

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleProceedToClient = () => {
    setStep('client')
  }

  const handleSubmitOrder = async () => {
    const { data: order } = await supabase.from('orders').insert({
      customer_name: customerName,
      customer_email: customerEmail,
      total,
      status: 'pending',
      confirmed: false,
    }).select().single()

    if (order) {
      await supabase.from('order_items').insert(
        cartItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
        }))
      )
    }

    setStep('code')
  }

  const handleConfirmed = async () => {
    setStep('success')
    setCartItems([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[var(--primary)] text-white py-6">
        <div className="container mx-auto px-6">
          <h1 className="text-2xl font-bold">Commande en ligne</h1>
          <p className="text-white/70 text-sm">Choisissez vos plats et commandez</p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {step === 'catalogue' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Familles */}
            <div className="lg:col-span-1 space-y-2">
              {families.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFamily(f.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeFamily === f.id ? 'bg-[var(--primary)] text-white' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium">{f.name}</p>
                  {f.description && <p className="text-xs opacity-70">{f.description}</p>}
                </button>
              ))}
            </div>

            {/* Produits */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(product => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 shadow-sm flex gap-4"
                  >
                    {product.image_url && (
                      <img src={product.image_url} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold">{product.name}</h3>
                      {product.description && <p className="text-sm text-gray-500">{product.description}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-[var(--primary)]">{formatPrice(product.price)}</span>
                        <Button size="sm" onClick={() => addItem(product)}>
                          <ShoppingBag size={14} /> Ajouter
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {products.length === 0 && (
                  <p className="text-gray-400 col-span-full text-center py-12">Aucun produit</p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'client' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm p-8"
          >
            <h2 className="text-xl font-bold mb-6">Vos coordonnées</h2>
            <div className="space-y-4 mb-6">
              <Input label="Nom complet" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Votre nom" />
              <Input label="Email" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="votre@email.com" />
            </div>

            <div className="border-t pt-4 mb-6">
              <h3 className="font-bold mb-2">Récapitulatif</h3>
              {cartItems.map(item => (
                <div key={item.product_id} className="flex justify-between text-sm py-1">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total</span>
                <span className="text-[var(--primary)]">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <ValidationEmail
                email={customerEmail}
                orderData={{
                  customer_name: customerName,
                  customer_email: customerEmail,
                  items: cartItems.map(i => ({ product_name: i.name, quantity: i.quantity, unit_price: i.price })),
                  total,
                }}
                onConfirmed={handleConfirmed}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep('catalogue')}
              >
                Retour au catalogue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Commande confirmée !</h2>
            <p className="text-gray-600 mb-8">Votre commande a été envoyée au restaurant.</p>
            <Button onClick={() => { setStep('catalogue'); setCartItems([]) }}>
              Nouvelle commande
            </Button>
          </motion.div>
        )}
      </div>

      {step === 'catalogue' && (
        <Panier
          items={cartItems}
          onAdd={(p: Product) => addItem(p)}
          onRemove={removeItem}
          onClear={handleProceedToClient}
        />
      )}
    </div>
  )
}

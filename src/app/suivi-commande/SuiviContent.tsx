'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/ThemeProvider'
import Button from '@/components/ui/Button'
import { formatPrice, formatDate, formatTime } from '@/lib/utils'
import { Check, Package, Bike, CookingPot, ArrowLeft, Search, ShoppingBag, ThumbsUp } from 'lucide-react'
import Link from 'next/link'

interface OrderWithItems {
  id: string
  customer_name: string
  customer_email: string
  total: number
  status: string
  order_type: string
  address: string | null
  delivery_status: string
  created_at: string
  updated_at: string
  order_items: {
    id: string
    product_name: string
    quantity: number
    unit_price: number
  }[]
}

const statusSteps = [
  { key: 'confirmed', label: 'Confirmée', icon: Check },
  { key: 'preparing', label: 'En cuisine', icon: CookingPot },
  { key: 'ready', label: 'Prête', icon: Package },
  { key: 'in_transit', label: 'En route', icon: Bike },
  { key: 'delivered', label: 'Livrée', icon: Check },
]

const statusImages: Record<string, string> = {
  confirmed: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  preparing: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80',
  ready: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  in_transit: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&q=80',
  delivered: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
}

function getStepIndex(status: string): number {
  const order = ['confirmed', 'preparing', 'ready', 'in_transit', 'delivered']
  const idx = order.indexOf(status)
  return idx >= 0 ? idx : -1
}

function getProgress(status: string): number {
  const pcts: Record<string, number> = {
    confirmed: 25, preparing: 50, ready: 75, in_transit: 90, delivered: 100,
    pending: 0, cancelled: 0,
  }
  return pcts[status] ?? 0
}

export default function SuiviContent({ initialEmail }: { initialEmail: string }) {
  const supabase = createClient()
  const theme = useTheme()
  const [email, setEmail] = useState(initialEmail)
  const [searchedEmail, setSearchedEmail] = useState(initialEmail)
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderStatus, setOrderStatus] = useState<string>('')
  const [orderItems, setOrderItems] = useState<OrderWithItems['order_items']>([])
  const channelRef = useRef<any>(null)
  const searchedRef = useRef(false)

  const activeOrder = orders.find(o => o.id === selectedOrderId)
  const currentStatus = activeOrder?.status || ''
  const stepIndex = getStepIndex(currentStatus)
  const progress = getProgress(currentStatus)
  const bgImage = statusImages[currentStatus] || statusImages.confirmed

  useEffect(() => {
    if (!initialEmail || searchedRef.current) return
    searchedRef.current = true
    handleSearchWithEmail(initialEmail)
  }, [])

  useEffect(() => {
    if (!selectedOrderId) return
    const order = orders.find(o => o.id === selectedOrderId)
    if (order) { setOrderStatus(order.status); setOrderItems(order.order_items) }
  }, [selectedOrderId, orders])

  useEffect(() => {
    if (!selectedOrderId) return
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    const channel = supabase
      .channel(`order-${selectedOrderId}-${Math.random().toString(36).slice(2, 8)}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${selectedOrderId}` },
        (payload: any) => {
          if (payload.new) {
            setOrderStatus(payload.new.status)
            setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
          }
        })
      .subscribe()
    channelRef.current = channel
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [selectedOrderId])

  const pollRef = useRef<any>(null)
  useEffect(() => {
    if (!selectedOrderId) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/poll-order', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: selectedOrderId }),
        })
        const data = await res.json()
        if (data.order) {
          setOrderStatus(data.order.status)
          setOrders(prev => prev.map(o => o.id === data.order.id ? { ...o, ...data.order } : o))
        }
      } catch {}
    }, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [selectedOrderId])

  const handleSearchWithEmail = async (searchEmail: string) => {
    if (!searchEmail) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/orders-by-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: searchEmail }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setOrders([]) }
      else {
        setOrders(data.orders || []); setSearchedEmail(searchEmail)
        if (data.orders?.length > 0) setSelectedOrderId(data.orders[0].id)
        else setSelectedOrderId(null)
      }
    } catch { setError('Erreur de connexion') }
    setLoading(false)
  }

  const handleSearch = () => handleSearchWithEmail(email)

  const handleReceived = async () => {
    if (!selectedOrderId) return
    await fetch('/api/confirm-received', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: selectedOrderId }),
    })
    setOrderStatus('delivered')
    setOrders(prev => prev.map(o => o.id === selectedOrderId ? { ...o, status: 'delivered', delivery_status: 'received' } : o))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[var(--primary)] text-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={20} /></Link>
            {theme?.logo_url && <img src={theme.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />}
            <div>
              <h1 className="text-lg font-bold">Suivi de commande</h1>
              <p className="text-white/60 text-xs">Suivez votre commande en temps réel</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-md mx-auto mb-8">
          <div className="flex gap-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Votre email" onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            <Button onClick={handleSearch} disabled={loading}>
              <Search size={18} /> {loading ? '...' : 'Rechercher'}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {orders.length > 1 && (
          <div className="max-w-lg mx-auto mb-6">
            <p className="text-sm text-gray-500 mb-2">{orders.length} commande(s) trouvée(s) :</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {orders.map(order => (
                <button key={order.id} onClick={() => setSelectedOrderId(order.id)}
                  className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    selectedOrderId === order.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}>
                  {formatDate(order.created_at)} — {formatPrice(order.total)}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeOrder ? (
          <div className="relative w-full min-h-screen"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
            <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl flex flex-col gap-4">
              <div className="text-white">
                <p className="text-xl font-bold">{activeOrder.customer_name}</p>
                <p className="text-sm opacity-80">
                  {activeOrder.order_type === 'livraison' ? 'Livraison' : 'Sur place'}
                  {activeOrder.address && ` — ${activeOrder.address}`}
                </p>
              </div>

              <div className="bg-white/40 backdrop-blur-lg rounded-xl p-5 shadow-lg">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <ShoppingBag size={18} /> Détails de la commande
                </h3>
                <div className="space-y-3">
                  {orderItems.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.unit_price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold mt-4 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[var(--primary)]">{formatPrice(activeOrder.total)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Commandé le {formatDate(activeOrder.created_at)} à {formatTime(activeOrder.created_at)}
                </p>
                {currentStatus === 'in_transit' && activeOrder.order_type === 'livraison' && (
                  <Button onClick={handleReceived} className="w-full mt-4">
                    <ThumbsUp size={18} /> Livré
                  </Button>
                )}
                {currentStatus === 'delivered' && activeOrder.delivery_status !== 'received' && (
                  <Button onClick={handleReceived} className="w-full mt-4">
                    <ThumbsUp size={18} /> Bien reçu
                  </Button>
                )}
                {currentStatus === 'delivered' && activeOrder.delivery_status === 'received' && (
                  <p className="text-green-600 text-sm font-medium text-center mt-4">✓ Commande bien reçue</p>
                )}
              </div>

              <div className="bg-white/40 backdrop-blur-lg rounded-xl p-5 shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Progression</span>
                  <span className="text-sm font-bold text-[var(--primary)]">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="bg-[var(--primary)] h-2.5 rounded-full" />
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-lg rounded-xl p-5 shadow-lg">
                <div className="relative">
                  {statusSteps.map((step, i) => {
                    const isPast = stepIndex >= i
                    const isCurrent = stepIndex === i
                    const isDelivery = activeOrder.order_type === 'livraison'
                    if (step.key === 'in_transit' && !isDelivery) return null
                    return (
                      <div key={step.key} className="flex items-start gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isPast ? 'bg-green-500 text-white' : isCurrent ? 'bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20' : 'bg-gray-200 text-gray-400'
                          }`}>
                            {isPast ? <Check size={16} /> : <step.icon size={16} />}
                          </div>
                          {i < statusSteps.length - 1 && (
                            <div className={`w-0.5 h-8 ${isPast && i < statusSteps.length - 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
                          )}
                        </div>
                        <div className="pt-1">
                          <p className={`font-medium ${isPast || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                          {isCurrent && <p className="text-sm text-gray-500">En cours...</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : searchedEmail && orders.length === 0 && !loading && (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400">Aucune commande trouvée pour {searchedEmail}</p>
          </div>
        )}
      </div>
    </div>
  )
}

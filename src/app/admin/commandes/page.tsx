'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderItem } from '@/types'
import { formatPrice, formatDate, formatTime } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { Check, X, Clock, CookingPot, Package, Bike, UtensilsCrossed, ShoppingBag } from 'lucide-react'

export default function AdminCommandes() {
  const supabase = createClient()
  const [orders, setOrders] = useState<(Order & { table_name?: string; order_items?: OrderItem[] })[]>([])
  const [tab, setTab] = useState<'pending' | 'confirmed' | 'preparing' | 'ready' | 'all'>('pending')
  const [typeFilter, setTypeFilter] = useState<'all' | 'sur_place' | 'livraison'>('all')

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
    if (data) {
      const enriched = await Promise.all(data.map(async (o: any) => {
        if (o.table_id) {
          const { data: t } = await supabase.from('tables_resto').select('name').eq('id', o.table_id).single()
          return { ...o, table_name: t?.name }
        }
        return o
      }))
      setOrders(enriched)
    }
  }

  useEffect(() => {
    fetchOrders()
    const channel = supabase.channel('orders-changes-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    fetchOrders()
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  const filtered = orders.filter(o => {
    if (tab === 'all') return true
    return o.status === tab
  }).filter(o => {
    if (typeFilter === 'all') return true
    return o.order_type === typeFilter
  })

  const groupedByDate: Record<string, typeof filtered> = {}
  for (const order of filtered) {
    const dateKey = order.created_at.slice(0, 10)
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = []
    groupedByDate[dateKey].push(order)
  }

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    if (a === todayStr) return -1
    if (b === todayStr) return 1
    return b.localeCompare(a)
  })

  const formatDateHeader = (dateStr: string) => {
    if (dateStr === todayStr) return "Aujourd'hui"
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    if (dateStr === yesterday.toISOString().slice(0, 10)) return 'Hier'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: Check },
    preparing: { label: 'En cuisine', color: 'bg-purple-100 text-purple-800', icon: CookingPot },
    ready: { label: 'Prête', color: 'bg-green-100 text-green-800', icon: Package },
    in_transit: { label: 'En route', color: 'bg-orange-100 text-orange-800', icon: Bike },
    delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: Check },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: X },
  }

  const tabs = [
    { key: 'pending' as const, label: 'En attente' },
    { key: 'confirmed' as const, label: 'Confirmées' },
    { key: 'preparing' as const, label: 'En cuisine' },
    { key: 'ready' as const, label: 'Prêtes' },
    { key: 'all' as const, label: 'Toutes' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Commandes</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-[var(--primary)] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-6">
        {(['all', 'sur_place', 'livraison'] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === t ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}>
            {t === 'all' ? 'Tous' : t === 'sur_place' ? 'Sur place' : 'Livraison'}
          </button>
        ))}
      </div>
      <div className="space-y-8">
        {sortedDates.map(dateStr => {
          const ordersForDate = groupedByDate[dateStr]
          const isToday = dateStr === todayStr
          return (
            <div key={dateStr}>
              <div className={`flex items-center gap-2 mb-3 ${isToday ? 'sticky top-0 z-10' : ''}`}>
                <span className={`text-lg font-bold ${isToday ? 'text-[var(--primary)]' : 'text-gray-700'}`}>
                  {formatDateHeader(dateStr)}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500">
                  {ordersForDate.length} commande{ordersForDate.length > 1 ? 's' : ''}
                </span>
                {isToday && <span className="ml-auto text-xs text-[var(--primary)] font-medium">En cours</span>}
              </div>
              <div className="space-y-4">
                {ordersForDate.map(order => {
                  const StatusIcon = statusConfig[order.status]?.icon || Clock
                  const isDelivery = order.order_type === 'livraison'
                  return (
                    <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{order.customer_name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status]?.color}`}>
                              <StatusIcon size={12} className="inline mr-1" />
                              {statusConfig[order.status]?.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDelivery ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                              {isDelivery ? <Bike size={12} className="inline mr-1" /> : <UtensilsCrossed size={12} className="inline mr-1" />}
                              {isDelivery ? 'Livraison' : 'Sur place'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{order.customer_email}</p>
                          {order.customer_phone && <p className="text-sm text-gray-500">Tél: {order.customer_phone}</p>}
                          {order.table_name && <p className="text-sm text-gray-500">Table: {order.table_name}</p>}
                          {order.address && <p className="text-sm text-gray-500">Adresse: {order.address}</p>}
                          <p className="text-xs text-gray-400">{formatDate(order.created_at)} à {formatTime(order.created_at)}</p>
                          {order.order_items && order.order_items.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                                <ShoppingBag size={12} /> Articles
                              </p>
                              <div className="space-y-1">
                                {order.order_items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-xs">
                                    <span className="text-gray-600">{item.quantity}x {item.product_name}</span>
                                    <span className="text-gray-500">{formatPrice(item.unit_price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xl font-bold text-[var(--primary)]">{formatPrice(order.total)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {order.status === 'pending' && (
                          <>
                            <Button size="sm" variant="primary" onClick={() => updateStatus(order.id, 'confirmed')}>
                              <Check size={16} /> Confirmer
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => updateStatus(order.id, 'cancelled')}>
                              <X size={16} /> Annuler
                            </Button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <>
                            <Button size="sm" variant="secondary" onClick={() => updateStatus(order.id, 'preparing')}>
                              <CookingPot size={16} /> En cuisine
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => updateStatus(order.id, 'cancelled')}>
                              <X size={16} /> Annuler
                            </Button>
                          </>
                        )}
                        {order.status === 'preparing' && (
                          <Button size="sm" variant="primary" onClick={() => updateStatus(order.id, 'ready')}>
                            <Package size={16} /> Prête
                          </Button>
                        )}
                        {order.status === 'ready' && isDelivery && (
                          <Button size="sm" variant="secondary" onClick={() => updateStatus(order.id, 'in_transit')}>
                            <Bike size={16} /> En route
                          </Button>
                        )}
                        {order.status === 'ready' && !isDelivery && (
                          <Button size="sm" variant="primary" onClick={() => updateStatus(order.id, 'delivered')}>
                            <Check size={16} /> Servi
                          </Button>
                        )}
                        {order.status === 'in_transit' && (
                          <Button size="sm" variant="primary" onClick={() => updateStatus(order.id, 'delivered')}>
                            <Check size={16} /> Livré
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {sortedDates.length === 0 && (
          <p className="text-center text-gray-400 py-12">Aucune commande</p>
        )}
      </div>
    </div>
  )
}

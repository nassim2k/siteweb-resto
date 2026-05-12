'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, Room, Table } from '@/types'
import { formatPrice, formatDate, formatTime } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { Check, X, Clock, CookingPot } from 'lucide-react'

export default function AdminCommandes() {
  const supabase = createClient()
  const [orders, setOrders] = useState<(Order & { table_name?: string })[]>([])
  const [tab, setTab] = useState<'pending' | 'confirmed' | 'all'>('pending')

  useEffect(() => {
    fetchOrders()
    const channel = supabase.channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data) {
      const enriched = await Promise.all(data.map(async (o) => {
        if (o.table_id) {
          const { data: t } = await supabase.from('tables_resto').select('name').eq('id', o.table_id).single()
          return { ...o, table_name: t?.name }
        }
        return o
      }))
      setOrders(enriched)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    fetchOrders()
  }

  const filtered = tab === 'all' ? orders : orders.filter(o => o.status === tab)

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: Check },
    preparing: { label: 'En préparation', color: 'bg-purple-100 text-purple-800', icon: CookingPot },
    served: { label: 'Servie', color: 'bg-green-100 text-green-800', icon: Check },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: X },
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Commandes</h1>

      <div className="flex gap-2 mb-6">
        {['pending', 'confirmed', 'all'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-[var(--primary)] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'pending' ? 'En attente' : t === 'confirmed' ? 'Confirmées' : 'Toutes'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(order => {
          const StatusIcon = statusConfig[order.status]?.icon || Clock
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
                  </div>
                  <p className="text-sm text-gray-500">{order.customer_email}</p>
                  {order.table_name && <p className="text-sm text-gray-500">Table: {order.table_name}</p>}
                  <p className="text-xs text-gray-400">{formatDate(order.created_at)} à {formatTime(order.created_at)}</p>
                </div>
                <p className="text-xl font-bold text-[var(--primary)]">{formatPrice(order.total)}</p>
              </div>

              {order.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => updateStatus(order.id, 'confirmed')}>
                    <Check size={16} /> Confirmer
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => updateStatus(order.id, 'cancelled')}>
                    <X size={16} /> Annuler
                  </Button>
                </div>
              )}
              {order.status === 'confirmed' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => updateStatus(order.id, 'preparing')}>
                    <CookingPot size={16} /> En préparation
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => updateStatus(order.id, 'cancelled')}>
                    <X size={16} /> Annuler
                  </Button>
                </div>
              )}
              {order.status === 'preparing' && (
                <Button size="sm" variant="primary" onClick={() => updateStatus(order.id, 'served')}>
                  <Check size={16} /> Servi
                </Button>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">Aucune commande</p>
        )}
      </div>
    </div>
  )
}

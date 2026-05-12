'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Table2, ShoppingBag, Package, UtensilsCrossed, CheckCircle2, Bike } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StatsCardSkeleton } from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import { formatPrice, formatDate, formatTime } from '@/lib/utils'
import { Order } from '@/types'

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [readyDeliveries, setReadyDeliveries] = useState<(Order & { table_name?: string })[]>([])

  async function fetchReadyDeliveries() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'ready')
      .eq('order_type', 'livraison')
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setReadyDeliveries(data)
  }

  useEffect(() => {
    const fetchStats = async () => {
      const [rooms, tables, products, orders, reservations, confirmedOrders, deliveries] = await Promise.all([
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('tables_resto').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('reservations').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_type', 'livraison'),
      ])
      setStats({
        rooms: rooms.count || 0,
        tables: tables.count || 0,
        products: products.count || 0,
        orders: orders.count || 0,
        reservations: reservations.count || 0,
        confirmedOrders: confirmedOrders.count || 0,
        deliveries: deliveries.count || 0,
      })
    }
    fetchStats()
    fetchReadyDeliveries()
  }, [])

  const handleEnRoute = async (id: string) => {
    await supabase.from('orders').update({ status: 'in_transit', updated_at: new Date().toISOString() }).eq('id', id)
    setReadyDeliveries(prev => prev.filter(o => o.id !== id))
  }

  const cards = [
    { label: 'Salles', value: stats?.rooms, icon: UtensilsCrossed, color: 'bg-blue-500' },
    { label: 'Tables', value: stats?.tables, icon: Table2, color: 'bg-green-500' },
    { label: 'Produits', value: stats?.products, icon: Package, color: 'bg-purple-500' },
    { label: 'Commandes', value: stats?.orders, icon: ShoppingBag, color: 'bg-orange-500' },
    { label: 'Confirmées', value: stats?.confirmedOrders, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: 'Livraisons', value: stats?.deliveries, icon: Bike, color: 'bg-cyan-500' },
    { label: 'Réservations', value: stats?.reservations, icon: Users, color: 'bg-rose-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {card.value === undefined ? (
              <StatsCardSkeleton />
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {readyDeliveries.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Bike size={20} /> Commandes prêtes à être livrées
          </h2>
          <div className="space-y-3">
            {readyDeliveries.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold">{order.customer_name}</p>
                  <p className="text-sm text-gray-500">{order.customer_email} {order.customer_phone && `— ${order.customer_phone}`}</p>
                  <p className="text-sm text-gray-500">{order.address}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.created_at)} à {formatTime(order.created_at)} — {formatPrice(order.total)}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => handleEnRoute(order.id)}>
                  <Bike size={16} /> En route
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

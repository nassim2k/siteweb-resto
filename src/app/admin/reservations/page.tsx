'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Reservation } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { Check, X, Clock, CalendarDays, Users, Phone, Mail } from 'lucide-react'

export default function AdminReservations() {
  const supabase = createClient()
  const [reservations, setReservations] = useState<(Reservation & { table_name?: string; room_name?: string })[]>([])
  const [tab, setTab] = useState<'pending' | 'confirmed' | 'cancelled' | 'all'>('pending')

  async function fetchReservations() {
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .order('reservation_date', { ascending: false })
      .order('reservation_time', { ascending: false })

    if (data) {
      const enriched = await Promise.all(data.map(async (r) => {
        const { data: t } = await supabase.from('tables_resto').select('name, room_id').eq('id', r.table_id).single()
        let room_name = ''
        if (t?.room_id) {
          const { data: rm } = await supabase.from('rooms').select('name').eq('id', t.room_id).single()
          room_name = rm?.name || ''
        }
        return { ...r, table_name: t?.name, room_name: room_name }
      }))
      setReservations(enriched)
    }
  }

  useEffect(() => {
    fetchReservations()
    const channel = supabase.channel('reservations-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => fetchReservations())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const updateStatus = async (id: string, status: string, tableId?: string) => {
    await supabase.from('reservations').update({ status }).eq('id', id)
    if (status === 'cancelled' && tableId) {
      await supabase.from('tables_resto').update({ status: 'free' }).eq('id', tableId)
    }
    fetchReservations()
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  const filtered = tab === 'all' ? reservations : reservations.filter(r => r.status === tab)

  const groupedByDate: Record<string, typeof filtered> = {}
  for (const res of filtered) {
    const dateKey = res.reservation_date.slice(0, 10)
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = []
    groupedByDate[dateKey].push(res)
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
    confirmed: { label: 'Confirmée', color: 'bg-green-100 text-green-800', icon: Check },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: X },
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Réservations</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['pending', 'confirmed', 'cancelled', 'all'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-[var(--primary)] text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {t === 'pending' ? 'En attente' : t === 'confirmed' ? 'Confirmées' : t === 'cancelled' ? 'Annulées' : 'Toutes'}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {sortedDates.map(dateStr => {
          const resForDate = groupedByDate[dateStr]
          const isToday = dateStr === todayStr
          return (
            <div key={dateStr}>
              <div className={`flex items-center gap-2 mb-3 ${isToday ? 'sticky top-0 z-10' : ''}`}>
                <span className={`text-lg font-bold ${isToday ? 'text-[var(--primary)]' : 'text-gray-700'}`}>
                  {formatDateHeader(dateStr)}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500">
                  {resForDate.length} réservation{resForDate.length > 1 ? 's' : ''}
                </span>
                {isToday && <span className="ml-auto text-xs text-[var(--primary)] font-medium">En cours</span>}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {resForDate.map(res => {
                  const StatusIcon = statusConfig[res.status]?.icon || Clock
                  return (
                    <div key={res.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{res.customer_name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[res.status]?.color}`}>
                            <StatusIcon size={11} className="inline mr-0.5" />
                            {statusConfig[res.status]?.label}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span>{res.customer_email}</span>
                        </div>
                        {res.customer_phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            <span>{res.customer_phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} className="text-gray-400" />
                          <span>{formatDate(res.reservation_date)} à {formatTime(res.reservation_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-gray-400" />
                          <span>{res.guest_count} personne{res.guest_count > 1 ? 's' : ''}</span>
                        </div>
                        {res.table_name && (
                          <div className="text-gray-400">
                            Table <strong>{res.table_name}</strong>
                            {res.room_name && <> · {res.room_name}</>}
                          </div>
                        )}
                      </div>
                      {res.status === 'pending' && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button size="sm" variant="primary" onClick={() => updateStatus(res.id, 'confirmed', res.table_id)}>
                            <Check size={14} /> Confirmer
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => updateStatus(res.id, 'cancelled', res.table_id)}>
                            <X size={14} /> Annuler
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {sortedDates.length === 0 && (
          <p className="text-gray-400 text-center py-12 col-span-full">Aucune réservation</p>
        )}
      </div>
    </div>
  )
}

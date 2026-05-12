'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock } from 'lucide-react'

interface Reservation {
  id: string
  table_id: string
  reservation_time: string
  status: string
}

interface Props {
  tableId: string
  date: string
}

const SLOTS = [
  { label: 'Midi', start: '12:00', end: '14:00' },
  { label: 'Soir', start: '19:00', end: '22:00' },
]

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export default function DisponibilitesTimeline({ tableId, date }: Props) {
  const supabase = createClient()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tableId || !date) return
    setLoading(true)
    supabase
      .from('reservations')
      .select('id, table_id, reservation_time, status')
      .eq('table_id', tableId)
      .eq('reservation_date', date)
      .in('status', ['pending', 'confirmed'])
      .then(({ data }) => {
        if (data) setReservations(data)
        setLoading(false)
      })
  }, [tableId, date])

  const isBooked = (slotStart: string, slotEnd: string) => {
    // Une réservation bloque ~1h30 (90 min)
    const s = timeToMinutes(slotStart)
    const e = timeToMinutes(slotEnd)
    for (const r of reservations) {
      const rt = timeToMinutes(r.reservation_time)
      if (rt >= s && rt < e) return true
    }
    return false
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-[var(--primary)]" />
        <h3 className="font-bold text-sm">Disponibilités</h3>
        {!loading && <span className="text-xs text-gray-400">— {new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>}
      </div>

      {loading ? (
        <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
      ) : (
        <div className="space-y-3">
          {SLOTS.map(slot => {
            const booked = isBooked(slot.start, slot.end)
            const totalMin = timeToMinutes(slot.end) - timeToMinutes(slot.start)
            const reservedMin = reservations
              .filter(r => timeToMinutes(r.reservation_time) >= timeToMinutes(slot.start) && timeToMinutes(r.reservation_time) < timeToMinutes(slot.end))
              .reduce((acc, r) => {
                const rt = timeToMinutes(r.reservation_time)
                // Chaque réservation bloque 90 min
                const end = Math.min(rt + 90, timeToMinutes(slot.end))
                return acc + (end - rt)
              }, 0)
            const freePct = Math.max(0, ((totalMin - reservedMin) / totalMin) * 100)

            return (
              <div key={slot.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-600">{slot.label}</span>
                  <span className="text-xs text-gray-400">{slot.start} – {slot.end}</span>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex relative">
                  {/* Segments réservés */}
                  {reservations
                    .filter(r => timeToMinutes(r.reservation_time) >= timeToMinutes(slot.start) && timeToMinutes(r.reservation_time) < timeToMinutes(slot.end))
                    .map(r => {
                      const rt = timeToMinutes(r.reservation_time)
                      const startPct = ((rt - timeToMinutes(slot.start)) / totalMin) * 100
                      const widthPct = (90 / totalMin) * 100 // 90 min par réservation
                      return (
                        <div
                          key={r.id}
                          className="absolute top-0 h-full bg-orange-400 rounded"
                          style={{ left: `${startPct}%`, width: `${Math.min(widthPct, 100 - startPct)}%` }}
                          title={`Réservé à ${r.reservation_time}`}
                        />
                      )
                    })}
                  {/* Indicateurs d'heure */}
                  {[0, 25, 50, 75, 100].map(pct => (
                    <div key={pct} className="absolute top-0 h-full border-l border-white/30" style={{ left: `${pct}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[10px] text-gray-400">{slot.start}</span>
                  <span className={`text-[10px] font-medium ${freePct > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                    {freePct > 0 ? `${Math.round(freePct)}% libre` : 'Complet'}
                  </span>
                  <span className="text-[10px] text-gray-400">{slot.end}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

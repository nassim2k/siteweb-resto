'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Table } from '@/types'
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'

export function useRealtimeTables(roomId: string) {
  const [tables, setTables] = useState<Table[]>([])
  const supabase = createClient()
  const uid = useRef(`tables-${roomId}-${Math.random().toString(36).slice(2, 8)}`)

  useEffect(() => {
    if (!roomId) return

    const fetchTables = async () => {
      const { data } = await supabase
        .from('tables_resto')
        .select('*')
        .eq('room_id', roomId)
        .order('name')
      if (data) setTables(data)
    }

    fetchTables()

    const channel = supabase
      .channel(uid.current)
      .on<Table>(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL,
          schema: 'public',
          table: 'tables_resto',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: RealtimePostgresChangesPayload<Table>) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setTables(prev => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setTables(prev =>
              prev.map(t => t.id === payload.new!.id ? payload.new : t)
            )
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setTables(prev =>
              prev.filter(t => t.id !== (payload.old as Table).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  return tables
}

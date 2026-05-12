import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'orderId requis' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) throw error

    // Auto-advance : preparing → ready après le temps de préparation
    if (order.status === 'preparing' && order.preparation_minutes > 0) {
      const elapsed = (Date.now() - new Date(order.updated_at).getTime()) / 60000
      if (elapsed >= order.preparation_minutes) {
        const { data: updated } = await supabase
          .from('orders')
          .update({ status: 'ready', updated_at: new Date().toISOString() })
          .eq('id', orderId)
          .select()
          .single()
        return NextResponse.json({ order: updated || { ...order, status: 'ready' } })
      }
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error polling order:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

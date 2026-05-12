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

    const { error } = await supabase
      .from('orders')
      .update({ delivery_status: 'received', updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error confirming received:', error)
    return NextResponse.json({ error: 'Erreur de confirmation' }, { status: 500 })
  }
}

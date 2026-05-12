import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { tableId, customerName, customerEmail, customerPhone, reservationDate, reservationTime, guestCount, confirmationCode } = await req.json()

    if (!tableId || !customerName || !customerEmail || !reservationDate || !reservationTime) {
      return NextResponse.json({ error: 'Données requises manquantes' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: insertError } = await supabase.from('reservations').insert({
      table_id: tableId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      guest_count: guestCount || 1,
      confirmation_code: confirmationCode || null,
      status: 'confirmed',
    })
    if (insertError) throw insertError

    const { error: updateError } = await supabase
      .from('tables_resto')
      .update({ status: 'occupied' })
      .eq('id', tableId)
    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error confirming reservation:', error)
    return NextResponse.json({ error: 'Erreur de confirmation de la réservation' }, { status: 500 })
  }
}

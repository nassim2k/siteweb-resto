import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { customer_name, customer_email, customer_phone, total, order_type, address, table_id, items, text_values } = await req.json()
    if (!customer_name || !customer_email || !items || items.length === 0) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name,
        customer_email,
        customer_phone: customer_phone || null,
        total,
        status: 'pending',
        confirmed: false,
        order_type,
        address: address || null,
        table_id: table_id || null,
      })
      .select()
      .single()

    if (orderError) throw orderError

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      })))

    if (itemsError) throw itemsError

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Erreur de création de la commande' }, { status: 500 })
  }
}

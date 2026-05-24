import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { customer_name, customer_email, customer_phone, total, order_type, address, table_id, items, text_values, modifiers_data } = await req.json()
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
        modifiers: item.modifiers || [],
      })))

    if (itemsError) throw itemsError

    // Calcul du temps de préparation depuis les attributs produits
    const { data: prepDef } = await supabase
      .from('attribute_definitions')
      .select('id')
      .ilike('name', 'Temps de préparation')
      .maybeSingle()

    if (prepDef) {
      const productIds = items.map((item: any) => item.product_id)
      const { data: productAttrs } = await supabase
        .from('product_attributes')
        .select('product_id, value')
        .eq('attribute_id', prepDef.id)
        .in('product_id', productIds)

      if (productAttrs && productAttrs.length > 0) {
        const minutes = Math.max(...productAttrs.map(a => parseInt(a.value) || 0), 0)
        if (minutes > 0) {
          await supabase.from('orders').update({ preparation_minutes: minutes }).eq('id', order.id)
        }
      }
    }

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Erreur de création de la commande' }, { status: 500 })
  }
}

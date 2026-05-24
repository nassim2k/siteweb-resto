'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ProductFamily, Product, CartItem, Room, Table } from '@/types'
import { useTheme } from '@/components/ThemeProvider'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Panier from '@/components/commande/Panier'
import ValidationEmail from '@/components/commande/ValidationEmail'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Check, ArrowLeft, UtensilsCrossed, Bike, MessageSquareText } from 'lucide-react'
import Link from 'next/link'
import PlanSalle from '@/components/reservation/PlanSalle'

export default function CommandePage() {
  const supabase = createClient()
  const theme = useTheme()
  const [families, setFamilies] = useState<ProductFamily[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [activeFamily, setActiveFamily] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [step, setStep] = useState<'catalogue' | 'choice' | 'plan' | 'client' | 'code' | 'success'>('catalogue')
  const [orderType, setOrderType] = useState<'sur_place' | 'livraison'>('livraison')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  // Text-type attributes per product (for customer input like allergies)
  const [productTextAttrs, setProductTextAttrs] = useState<Record<string, { id: string; name: string }[]>>({})
  const [textValues, setTextValues] = useState<Record<string, Record<string, string>>>({})

  useEffect(() => {
    supabase.from('product_families').select('*').eq('active', true).order('sort_order').then(({ data }) => {
      if (data) { setFamilies(data); if (data.length > 0) setActiveFamily(data[0].id) }
    })
    supabase.from('rooms').select('*').eq('active', true).order('sort_order').then(({ data }) => {
      if (data) setRooms(data)
    })
  }, [])

  useEffect(() => {
    if (!activeFamily) return
    const fetchProducts = async () => {
      const { data: prods } = await supabase.from('products').select('*').eq('family_id', activeFamily).eq('active', true).order('name')
      if (!prods) return
      setProducts(prods)

      // Fetch text-type attributes for all products in this family
      const ids = prods.map(p => p.id)
      const { data: prodAttrs } = await supabase
        .from('product_attributes')
        .select('product_id, attribute_id')
        .in('product_id', ids)
      if (prodAttrs && prodAttrs.length > 0) {
        const attrIds = [...new Set(prodAttrs.map(a => a.attribute_id))]
        const { data: defs } = await supabase
          .from('attribute_definitions')
          .select('id, name, type')
          .in('id', attrIds)
        if (defs) {
          const textDefIds = new Set(defs.filter(d => d.type === 'text').map(d => d.id))
          const textMap: Record<string, { id: string; name: string }[]> = {}
          for (const pa of prodAttrs) {
            if (textDefIds.has(pa.attribute_id)) {
              const def = defs.find(d => d.id === pa.attribute_id)
              if (def) {
                if (!textMap[pa.product_id]) textMap[pa.product_id] = []
                textMap[pa.product_id].push({ id: def.id, name: def.name })
              }
            }
          }
          setProductTextAttrs(textMap)
        }
      }
    }
    fetchProducts()
  }, [activeFamily])

  const addItem = (product: Product) => {
    const tVals = textValues[product.id]
    const hasText = tVals && Object.keys(tVals).length > 0
    // For text-type attributes, also check if they're filled (for "allergies" type, empty is ok)
    setCartItems(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        text_values: hasText ? tVals : undefined,
      }]
    })
  }

  const removeItem = (productId: string) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product_id === productId)
      if (existing && existing.quantity > 1) return prev.map(i => i.product_id === productId ? { ...i, quantity: i.quantity - 1 } : i)
      return prev.filter(i => i.product_id !== productId)
    })
  }

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleProceedToChoice = () => { setStep('choice') }

  const handleChooseType = (type: 'sur_place' | 'livraison') => {
    setOrderType(type)
    if (type === 'livraison') setStep('client')
    else setStep('plan')
  }

  const handleSelectRoom = async (room: Room) => {
    setSelectedRoom(room)
    setSelectedTable(null)
    const { data } = await supabase.from('tables_resto').select('*').eq('room_id', room.id).order('name')
    if (data) setTables(data)
  }

  const handleSubmitOrder = async () => {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        total,
        order_type: orderType,
        address: orderType === 'livraison' ? customerAddress : null,
        table_id: orderType === 'sur_place' && selectedTable ? selectedTable.id : null,
        items: cartItems,
        text_values: cartItems.filter(i => i.text_values).reduce((acc, i) => ({ ...acc, [i.product_id]: i.text_values }), {}),
      }),
    })
    const data = await res.json()
    if (data.orderId) {
      setOrderId(data.orderId)
    }
    setStep('code')
  }

  const handleConfirmed = async () => {
    setStep('success')
    setCartItems([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[var(--primary)] text-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'catalogue' ? (
              <button onClick={() => { setStep('catalogue'); setSelectedRoom(null); setSelectedTable(null) }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
            ) : (
              <Link href="/" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={20} /></Link>
            )}
            {theme?.logo_url && <img src={theme.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />}
            <div>
              <h1 className="text-lg font-bold">Commande en ligne</h1>
              <p className="text-white/60 text-xs">
                {step === 'catalogue' ? 'Choisissez vos plats' :
                 step === 'choice' ? 'Sur place ou livraison ?' :
                 step === 'plan' ? 'Choisissez votre table' :
                 step === 'client' ? 'Vos coordonnées' :
                 step === 'code' ? 'Confirmation' : 'Commande confirmée'}
              </p>
            </div>
          </div>
          {theme?.site_name && <span className="text-white/40 text-sm hidden sm:block">{theme.site_name}</span>}
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {step === 'catalogue' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-3">
              {families.map(f => (
                <button key={f.id} onClick={() => setActiveFamily(f.id)}
                  className={`w-full text-left rounded-xl overflow-hidden transition-all duration-200 ${
                    activeFamily === f.id ? 'ring-2 ring-[var(--primary)] shadow-md' : 'bg-white hover:shadow-md shadow-sm'
                  }`}>
                  {f.image_url && (
                    <div className="h-20 overflow-hidden">
                      <img src={f.image_url} alt="" className={`w-full h-full object-cover transition-transform duration-300 ${activeFamily === f.id ? 'scale-110' : ''}`} />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-bold text-sm">{f.name}</p>
                    {f.description && <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>}
                  </div>
                </button>
              ))}
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map(product => {
                  const textAttrs = productTextAttrs[product.id]
                  return (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    {product.image_url ? (
                      <div className="h-40 overflow-hidden">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <UtensilsCrossed className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900">{product.name}</h3>
                      {product.description && <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">{product.description}</p>}
                      {textAttrs && textAttrs.map(attr => (
                        <div key={attr.id} className="mt-2">
                          <textarea value={textValues[product.id]?.[attr.id] || ''}
                            onChange={e => setTextValues(prev => ({...prev, [product.id]: {...(prev[product.id] || {}), [attr.id]: e.target.value}}))}
                            placeholder={`${attr.name}...`} rows={1}
                            className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none bg-gray-50" />
                        </div>
                      ))}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>{formatPrice(product.price)}</span>
                        <button onClick={() => addItem(product)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg active:scale-95"
                          style={{ background: `linear-gradient(135deg, var(--primary), var(--secondary, var(--primary)))` }}>
                          <ShoppingBag size={13} /> Ajouter
                        </button>
                      </div>
                    </div>
                  </motion.div>
                  )
                })}
                {products.length === 0 && (
                  <p className="text-gray-400 col-span-full text-center py-12">Aucun produit dans cette categorie</p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'choice' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-center mb-8">Comment souhaitez-vous manger ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => handleChooseType('sur_place')}
                className="bg-white rounded-2xl shadow-sm p-8 text-center hover:shadow-lg hover:ring-2 hover:ring-[var(--primary)] transition-all">
                <UtensilsCrossed size={48} className="mx-auto mb-4 text-[var(--primary)]" />
                <p className="text-lg font-bold">Sur place</p>
                <p className="text-sm text-gray-500 mt-1">Mangez au restaurant</p>
              </button>
              <button onClick={() => handleChooseType('livraison')}
                className="bg-white rounded-2xl shadow-sm p-8 text-center hover:shadow-lg hover:ring-2 hover:ring-[var(--primary)] transition-all">
                <Bike size={48} className="mx-auto mb-4 text-[var(--primary)]" />
                <p className="text-lg font-bold">Livraison</p>
                <p className="text-sm text-gray-500 mt-1">Reçu chez vous</p>
              </button>
            </div>
          </motion.div>
        )}

        {step === 'plan' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {!selectedRoom ? (
              <div>
                <h2 className="text-xl font-bold mb-6">Choisissez votre salle</h2>
                {rooms.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">Aucune salle disponible</p>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map(room => (
                    <button key={room.id} onClick={() => handleSelectRoom(room)}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all text-left">
                      {room.image_url && <div className="h-32 overflow-hidden"><img src={room.image_url} alt="" className="w-full h-full object-cover" /></div>}
                      <div className="p-4">
                        <p className="font-bold">{room.name}</p>
                        {room.description && <p className="text-sm text-gray-500">{room.description}</p>}
                      </div>
                    </button>
                  ))}
                </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setSelectedRoom(null)} className="text-sm text-[var(--primary)] hover:underline">
                    ← Changer de salle
                  </button>
                  <h2 className="text-xl font-bold">{selectedRoom.name}</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <PlanSalle tables={tables} selectedTableId={selectedTable?.id || null} onSelectTable={setSelectedTable} />
                  </div>
                  <div>
                    <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                      {selectedTable ? (
                        <div className="text-center">
                          <p className="text-lg font-bold mb-2">Table {selectedTable.name}</p>
                          <p className="text-sm text-gray-500 mb-6">{selectedTable.capacity} personnes</p>
                          <Button onClick={() => setStep('client')} className="w-full">
                            Choisir cette table
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400">Sélectionnez une table libre (verte)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 'client' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold mb-6">Vos coordonnées</h2>

            {orderType === 'sur_place' && selectedTable && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Table <strong>{selectedTable.name}</strong> — {selectedTable.capacity} personnes</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <Input label="Nom complet" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Votre nom" />
              <Input label="Email" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="votre@email.com" />
              <Input label="Téléphone" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="06 12 34 56 78" />
              {orderType === 'livraison' && (
                <Input label="Adresse de livraison" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Numéro, rue, code postal, ville" />
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <h3 className="font-bold mb-2">Récapitulatif</h3>
              {cartItems.map(item => (
                <div key={item.product_id} className="flex justify-between text-sm py-1">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total</span>
                <span className="text-[var(--primary)]">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleSubmitOrder} disabled={!customerName || !customerEmail || (orderType === 'livraison' && !customerAddress)} className="w-full">
                Passer la commande
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep(orderType === 'sur_place' ? 'plan' : 'choice')}>
                Retour
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'code' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold mb-6">Code de confirmation</h2>
            <ValidationEmail email={customerEmail} orderId={orderId || undefined}
              orderData={{ customer_name: customerName, customer_email: customerEmail, items: cartItems.map(i => ({ product_name: i.name, quantity: i.quantity, unit_price: i.price })), total }}
              onConfirmed={handleConfirmed} />
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={() => setStep('client')}>
                Retour
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Commande confirmée !</h2>
            <p className="text-gray-600 mb-4">Votre commande a été envoyée au restaurant.</p>
            {orderId && (
              <Link href={`/suivi-commande?email=${encodeURIComponent(customerEmail)}`}
                className="inline-block mb-4 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                Suivre ma commande
              </Link>
            )}
            <div>
              <Button onClick={() => { setStep('catalogue'); setCartItems([]) }}>
                Nouvelle commande
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {(step === 'catalogue' || step === 'choice') && (
        <Panier items={cartItems} onAdd={(p: Product) => addItem(p)} onRemove={removeItem} onClear={handleProceedToChoice} />
      )}
    </div>
  )
}

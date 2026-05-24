'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, ChevronRight, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductFamily } from '@/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const }
  }
}

const defaultProducts = [
  { id: '1', name: 'Pizza Margherita', description: 'Tomate, mozzarella, basilic frais', price: 14.90, image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
  { id: '2', name: 'Burger Presty', description: 'Double steak, cheddar, bacon, sauce maison', price: 16.90, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
  { id: '3', name: 'Pâtes Carbonara', description: 'Pâtes fraîches, lardons, crème, parmesan', price: 15.50, image_url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80' },
  { id: '4', name: 'Salade César', description: 'Poulet grillé, salade, parmesan, croûtons', price: 13.50, image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80' },
  { id: '5', name: 'Tiramisu', description: 'Mascarpone, café, cacao, biscuits', price: 8.90, image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80' },
  { id: '6', name: 'Mocktail Presty', description: 'Fruits frais, menthe, eau pétillante', price: 6.50, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80' },
]

export default function PopularProductsSection() {
  const [families, setFamilies] = useState<ProductFamily[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('product_families')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data) setFamilies(data)
      })
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(6)

    if (activeFilter) {
      query = query.eq('family_id', activeFilter)
    }

    query.then(({ data }) => {
      if (data) setProducts(data)
    })
  }, [activeFilter])

  const displayProducts = products.length > 0
    ? products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: p.price,
        image_url: p.image_url || defaultProducts.find(d => d.name === p.name)?.image_url || defaultProducts[0].image_url,
      }))
    : defaultProducts

  return (
    <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--surface-alt)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{
              color: 'var(--primary)',
              background: 'rgba(181, 160, 122, 0.12)',
              border: '1px solid rgba(181, 160, 122, 0.2)',
            }}
          >
            Nos plats populaires
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3 font-serif">
            Les plus demandés
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto mb-8">
            Découvrez les plats préférés de nos clients
          </p>

          {families.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveFilter(null)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  background: !activeFilter ? 'var(--primary)' : 'transparent',
                  color: !activeFilter ? 'white' : 'var(--foreground)',
                  border: '1px solid',
                  borderColor: !activeFilter ? 'var(--primary)' : 'rgba(0,0,0,0.1)',
                }}
              >
                Tous
              </button>
              {families.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                  style={{
                    background: activeFilter === f.id ? 'var(--primary)' : 'transparent',
                    color: activeFilter === f.id ? 'white' : 'var(--foreground)',
                    border: '1px solid',
                    borderColor: activeFilter === f.id ? 'var(--primary)' : 'rgba(0,0,0,0.1)',
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={cardVariants}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: 'rgba(239, 68, 68, 0.9)' }}
                >
                  <Flame className="w-3 h-3" /> Populaire
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black" style={{ color: 'var(--primary)' }}>
                    {product.price.toFixed(2).replace('.', ',')} €
                  </span>
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-300 active:scale-95"
                    style={{ background: 'var(--primary)' }}
                  >
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            href="/commande"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            style={{
              color: 'var(--primary)',
              background: 'rgba(181, 160, 122, 0.1)',
            }}
          >
            Voir toute la carte <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

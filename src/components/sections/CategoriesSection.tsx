'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ProductFamily } from '@/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
}

const defaultCategories = [
  { name: 'Entrées', description: 'Salades, soupes et antipasti', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', count: 12 },
  { name: 'Plats', description: 'Grillades, poissons et pasta', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', count: 24 },
  { name: 'Desserts', description: 'Tiramisu, panna cotta et glaces', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80', count: 8 },
  { name: 'Boissons', description: 'Vins, cocktails et boissons fraîches', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80', count: 16 },
]

export default function CategoriesSection() {
  const [families, setFamilies] = useState<ProductFamily[]>([])

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

  const displayData = families.length > 0
    ? families.map(f => ({
        name: f.name,
        description: f.description || '',
        image: f.image_url || defaultCategories.find(d => d.name === f.name)?.image || defaultCategories[0].image,
        count: 0,
      }))
    : defaultCategories

  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{
              color: 'var(--primary)',
              background: 'rgba(181, 160, 122, 0.12)',
              border: '1px solid rgba(181, 160, 122, 0.2)',
            }}
          >
            Notre Menu
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3 font-serif">
            Découvrez nos catégories
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Des plats préparés avec passion par nos chefs
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {displayData.map((cat, i) => (
            <motion.div
              key={cat.name}
              variants={cardVariants}
              className="group relative rounded-2xl overflow-hidden cursor-pointer h-72 sm:h-80"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
              {cat.count > 0 && (
                <div
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  {cat.count} plats
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-500 group-hover:-translate-y-1">
                <h3 className="text-xl font-bold text-white mb-1.5 font-serif">
                  {cat.name}
                </h3>
                <p className="text-sm text-white/70">{cat.description}</p>
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

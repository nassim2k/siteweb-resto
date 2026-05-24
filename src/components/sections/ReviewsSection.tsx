'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const defaultReviews = [
  { id: '1', customer_name: 'Sophie M.', rating: 5, comment: 'Une cuisine exceptionnelle, service impeccable. Je recommande !', created_at: '2025-12-15' },
  { id: '2', customer_name: 'Karim B.', rating: 5, comment: 'Les meilleures pizzas de la ville. Livraison rapide.', created_at: '2025-11-20' },
  { id: '3', customer_name: 'Léa C.', rating: 5, comment: 'Cadre magnifique, parfait pour un dîner en amoureux.', created_at: '2025-10-10' },
  { id: '4', customer_name: 'Mohamed A.', rating: 4, comment: 'Très bon rapport qualité-prix. Je reviendrai !', created_at: '2025-09-05' },
  { id: '5', customer_name: 'Claire D.', rating: 5, comment: 'Les desserts sont divins, surtout le tiramisu.', created_at: '2025-08-18' },
]

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      month: 'long', year: 'numeric',
    })
  } catch { return '' }
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState(defaultReviews)
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data && data.length > 0) setReviews(data as typeof defaultReviews)
      })
  }, [])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent(prev => (prev + 1) % reviews.length)
  }, [reviews.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent(prev => (prev - 1 + reviews.length) % reviews.length)
  }, [reviews.length])

  useEffect(() => {
    if (isPaused || reviews.length <= 1) return
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [isPaused, reviews.length, next])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '4.8'

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  }

  return (
    <section className="py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
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
            Avis clients
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3 font-serif">
            Ils nous ont aimés
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-2xl font-black text-gray-900">{avgRating}</span>
            <span className="text-gray-400">/5</span>
          </div>
          <p className="text-gray-500 text-sm">{reviews.length} avis vérifiés</p>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative overflow-hidden min-h-[200px] flex items-center justify-center px-12">
            <AnimatePresence mode="wait" custom={direction}>
              {reviews.length > 0 && (
                <motion.div
                  key={reviews[current].id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="w-full"
                >
                  <div
                    className="text-center max-w-xl mx-auto p-8 sm:p-10 rounded-2xl"
                    style={{
                      background: 'var(--surface-alt)',
                      border: '1px solid rgba(181, 160, 122, 0.15)',
                    }}
                  >
                    <Quote className="w-8 h-8 mx-auto mb-4 opacity-30" style={{ color: 'var(--primary)' }} />
                    <div className="flex justify-center gap-1 mb-4">
                      {Array.from({ length: reviews[current].rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-lg text-gray-700 italic leading-relaxed mb-6">
                      &ldquo;{reviews[current].comment}&rdquo;
                    </p>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-white text-sm font-bold"
                      style={{ background: 'var(--primary)' }}
                    >
                      {getInitials(reviews[current].customer_name)}
                    </div>
                    <p className="font-bold text-gray-900">{reviews[current].customer_name}</p>
                    <p className="text-sm text-gray-400">{formatDate(reviews[current].created_at)}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-md active:scale-95"
            style={{
              background: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              color: 'var(--foreground)',
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-md active:scale-95"
            style={{
              background: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              color: 'var(--foreground)',
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i === current ? 'var(--primary)' : 'rgba(0,0,0,0.15)',
                width: i === current ? 24 : 8,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

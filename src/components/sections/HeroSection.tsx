'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, CalendarDays, PackageSearch, ChevronDown, Star, Clock, UtensilsCrossed, Truck } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const defaultBgImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80',
]

const letterVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.03, duration: 0.4, ease: 'easeOut' as const }
  })
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.5 }
  }
}

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, x: -20 },
  visible: {
    opacity: 1, scale: 1, x: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
}

function TypewriterText({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let i = 0
    setDisplayed('')
    const t = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(t)
        setTimeout(() => setShowCursor(false), 1500)
      }
    }, 40)
    return () => clearInterval(t)
  }, [text])

  return (
    <span className={className}>
      {displayed}
      {showCursor && (
        <span className="inline-block w-0.5 h-[1em] ml-1 animate-pulse" style={{ background: 'var(--primary)' }} />
      )}
    </span>
  )
}

const stats = [
  { icon: UtensilsCrossed, value: '200+', label: 'Plats' },
  { icon: Clock, value: '30 min', label: 'Livraison' },
  { icon: Star, value: '4.8', label: 'Note moyenne' },
]

export default function HeroSection() {
  const theme = useTheme()
  const bgImages = theme?.hero_images?.length ? theme.hero_images : defaultBgImages
  const [bgIndex, setBgIndex] = useState(0)
  const siteName = theme?.site_name || 'Presty Food'

  useEffect(() => {
    const t = setInterval(() => setBgIndex(i => (i + 1) % bgImages.length), 6000)
    return () => clearInterval(t)
  }, [bgImages.length])

  const title = siteName.split('')

  return (
    <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
      {bgImages.map((url, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: i === bgIndex ? 1 : 0,
            backgroundImage: `url(${url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-3xl"
        >
          <motion.div
            variants={badgeVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{
              background: 'rgba(181, 160, 122, 0.15)',
              color: 'var(--primary-light)',
              border: '1px solid rgba(181, 160, 122, 0.3)',
            }}
          >
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold">4.8</span>
            <span className="opacity-60">·</span>
            <span>240 avis</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight mb-4 flex flex-wrap">
            {title.map((letter, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className="text-white"
                style={letter === ' ' ? { width: '0.3em' } : {}}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))}
          </h1>

          <motion.p
            variants={containerVariants}
            className="text-lg sm:text-xl text-white/70 max-w-xl mb-6 h-8"
          >
            <TypewriterText text="Une cuisine authentique préparée avec des produits frais." />
          </motion.p>

          <motion.div
            variants={containerVariants}
            className="flex flex-wrap gap-3 mb-16"
          >
            <Link
              href="/commande"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              }}
            >
              <ShoppingBag className="w-5 h-5" /> Commander
            </Link>
            <Link
              href="/reservation"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white/90 border-2 border-white/30 hover:border-white/50 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 backdrop-blur-sm"
            >
              <CalendarDays className="w-5 h-5" /> Réserver une table
            </Link>
            <Link
              href="/suivi-commande"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white/90 border-2 border-white/30 hover:border-white/50 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 backdrop-blur-sm"
            >
              <PackageSearch className="w-5 h-5" /> Suivre ma commande
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="flex gap-8 sm:gap-12"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <stat.icon className="w-3.5 h-3.5" />
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6 text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  )
}

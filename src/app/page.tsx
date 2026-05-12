'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UtensilsCrossed, ShoppingBag, LogIn, MapPin, Clock, Phone, PackageSearch, Search, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useTheme } from '@/components/ThemeProvider'

const defaultBgImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&q=80',
]

const features = [
  { icon: UtensilsCrossed, title: 'Réserver une table', desc: 'Choisissez votre salle et votre table sur un plan interactif', href: '/reservation', color: 'from-blue-500 to-blue-600' },
  { icon: ShoppingBag, title: 'Commander en ligne', desc: 'Parcourez notre carte et passez commande depuis chez vous', href: '/commande', color: 'from-orange-500 to-orange-600' },
  { icon: PackageSearch, title: 'Suivre ma commande', desc: 'Suivez l\'état de votre commande en temps réel', href: '#', color: 'from-purple-500 to-purple-600', action: 'tracking' },
  { icon: MapPin, title: 'Nous trouver', desc: 'Au cœur du quartier, venez profiter d\'une cuisine authentique', href: '#', color: 'from-green-500 to-green-600' },
]

export default function Home() {
  const theme = useTheme()
  const bgImages = theme?.hero_images?.length ? theme.hero_images : defaultBgImages
  const [bgIndex, setBgIndex] = useState(0)
  const [trackingEmail, setTrackingEmail] = useState('')
  const [showTrackingForm, setShowTrackingForm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showTrackingForm && inputRef.current) inputRef.current.focus()
  }, [showTrackingForm])

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingEmail.trim()) {
      window.location.href = `/suivi-commande?email=${encodeURIComponent(trackingEmail.trim())}`
    }
  }

  useEffect(() => {
    setBgIndex(0)
    const timer = setInterval(() => {
      setBgIndex(i => (i + 1) % bgImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [bgImages])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[var(--primary)] text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme?.logo_url && <img src={theme.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />}
            <h1 className="text-lg sm:text-xl font-bold truncate">{theme?.site_name || 'Mon Restaurant'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/reservation" className="hidden sm:flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm">
              <UtensilsCrossed size={14} /> Réservation
            </Link>
            <Link href="/commande" className="hidden sm:flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm">
              <ShoppingBag size={14} /> Commande
            </Link>
            <Link href="/login" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium">
              <LogIn size={14} /> Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero with animated background */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImages[bgIndex]})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            {theme?.logo_url && (
              <motion.img initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                src={theme.logo_url} alt="Logo" className="h-20 sm:h-28 mx-auto mb-6 rounded-2xl shadow-2xl" />
            )}
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 leading-tight">
              {theme?.site_name || 'Mon Restaurant'}
            </h2>
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl mx-auto">
              Réservez votre table et commandez vos plats préférés en quelques clics
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/reservation">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base !px-8">
                  <UtensilsCrossed size={20} /> Réserver une table
                </Button>
              </Link>
              <Link href="/commande">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base !px-8 !border-white !text-white hover:!bg-white hover:!text-[var(--primary)]">
                  <ShoppingBag size={20} /> Commander
                </Button>
              </Link>
              {!showTrackingForm ? (
                <Button variant="outline" size="lg" onClick={() => setShowTrackingForm(true)}
                  className="w-full sm:w-auto text-base !px-8 !border-white/60 !text-white/90 hover:!bg-white hover:!text-[var(--primary)]">
                  <PackageSearch size={20} /> Suivre ma commande
                </Button>
              ) : (
                <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-1">
                  <input ref={inputRef} type="email" value={trackingEmail} onChange={e => setTrackingEmail(e.target.value)}
                    placeholder="Votre email..." className="flex-1 px-4 py-2.5 sm:py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border-0 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm" />
                  <div className="flex gap-2">
                    <button type="submit" disabled={!trackingEmail.trim()}
                      className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-lg bg-white text-[var(--primary)] font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                      Suivre <ArrowRight size={16} />
                    </button>
                    <button type="button" onClick={() => { setShowTrackingForm(false); setTrackingEmail('') }}
                      className="px-3 py-2.5 sm:py-2 rounded-lg bg-white/10 text-white/70 hover:text-white text-sm">✕</button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
        {/* Dots indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {bgImages.map((_, i) => (
            <button key={i} onClick={() => setBgIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${i === bgIndex ? 'bg-white w-6' : 'bg-white/50'}`} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl sm:text-3xl font-bold text-center mb-12">Comment ça marche</motion.h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                {(f as any).action === 'tracking' ? (
                  <button onClick={() => setShowTrackingForm(true)} className="block group w-full text-left">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                        <f.icon size={26} className="text-white" />
                      </div>
                      <h4 className="text-lg font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">{f.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </button>
                ) : (
                <Link href={f.href} className="block group">
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <f.icon size={26} className="text-white" />
                    </div>
                    <h4 className="text-lg font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">{f.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Infos */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto text-center">
            <div className="space-y-3">
              <Clock className="mx-auto text-[var(--primary)]" size={28} />
              <h4 className="font-bold">Horaires</h4>
              <p className="text-sm text-gray-500">Lun-Sam : 12h-14h · 19h-22h<br />Dim : 12h-15h</p>
            </div>
            <div className="space-y-3">
              <MapPin className="mx-auto text-[var(--primary)]" size={28} />
              <h4 className="font-bold">Adresse</h4>
              <p className="text-sm text-gray-500">122 Rue du Restaurant<br />75000 Paris</p>
            </div>
            <div className="space-y-3">
              <Phone className="mx-auto text-[var(--primary)]" size={28} />
              <h4 className="font-bold">Contact</h4>
              <p className="text-sm text-gray-500">01 23 45 67 89<br />contact@restaurant.fr</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tracking email modal */}
      <AnimatePresence>
        {showTrackingForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setShowTrackingForm(false); setTrackingEmail('') }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-6">
                <PackageSearch size={40} className="mx-auto text-[var(--primary)] mb-3" />
                <h3 className="text-xl font-bold">Suivre ma commande</h3>
                <p className="text-gray-500 text-sm mt-1">Entrez votre email pour voir l'état de votre commande</p>
              </div>
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <input type="email" value={trackingEmail} onChange={e => setTrackingEmail(e.target.value)}
                  placeholder="votre@email.com" autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-center text-lg" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowTrackingForm(false); setTrackingEmail('') }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                  <button type="submit" disabled={!trackingEmail.trim()}
                    className="flex-1 px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    Suivre <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
              <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex shadow-2xl">
        {[
          { href: '/', icon: UtensilsCrossed, label: 'Accueil' },
          { href: '/reservation', icon: MapPin, label: 'Réservation' },
          { href: '/commande', icon: ShoppingBag, label: 'Commande' },
          { href: '/suivi-commande', icon: PackageSearch, label: 'Suivi' },
          { href: '/login', icon: LogIn, label: 'Admin' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="flex-1 flex flex-col items-center py-2 text-[10px] sm:text-xs font-medium text-gray-500 hover:text-[var(--primary)]">
            <item.icon size={16} />
            <span className="mt-0.5">{item.label}</span>
          </Link>
        ))}
      </nav>

      <footer className="bg-gray-900 text-white/60 text-center py-6 text-sm sm:pb-6 pb-20">
        &copy; {new Date().getFullYear()} {theme?.site_name || 'Mon Restaurant'} — Tous droits réservés
      </footer>
    </div>
  )
}

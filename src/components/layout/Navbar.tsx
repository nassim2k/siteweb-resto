'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { UtensilsCrossed, ShoppingBag, Menu, X, LogIn } from 'lucide-react'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { useTheme } from '@/components/ThemeProvider'

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/commande', label: 'Carte' },
  { href: '/reservation', label: 'Réservation' },
  { href: '/suivi-commande', label: 'Suivi' },
]

const linkVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
}

export default function Navbar() {
  const { isScrolled } = useScrollPosition()
  const pathname = usePathname()
  const [mobileMenu, setMobileMenu] = useState(false)
  const theme = useTheme()
  const siteName = theme?.site_name || 'Presty Food'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-black/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{ background: 'var(--primary)' }}
            >
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-xl font-bold font-serif transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              {siteName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => {
              const isActive = pathname === link.href
              return (
                <motion.div
                  key={link.href}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={linkVariants}
                >
                  <Link
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isScrolled
                        ? isActive
                          ? 'text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                        : isActive
                          ? 'text-white'
                          : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${
                        isActive ? 'w-4/5' : 'w-0'
                      }`}
                      style={{ background: 'var(--primary)' }}
                    />
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isScrolled
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Connexion
            </Link>
            <Link
              href="/commande"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
              style={{
                background: `linear-gradient(135deg, var(--primary), var(--primary-dark))`,
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              Commander
            </Link>
          </div>

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled
                ? 'hover:bg-gray-100 text-gray-900'
                : 'hover:bg-white/10 text-white'
            }`}
          >
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t overflow-hidden bg-white"
            style={{ borderColor: 'rgba(0,0,0,0.08)' }}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenu(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={isActive ? { background: 'var(--primary)' } : {}}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <hr className="my-3" style={{ borderColor: 'rgba(0,0,0,0.08)' }} />
              <Link
                href="/login"
                onClick={() => setMobileMenu(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <LogIn className="w-4 h-4" /> Se connecter
              </Link>
              <Link
                href="/commande"
                onClick={() => setMobileMenu(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: 'var(--primary)' }}
              >
                <ShoppingBag className="w-4 h-4" /> Commander
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

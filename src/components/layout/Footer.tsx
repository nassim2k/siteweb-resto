'use client'

import Link from 'next/link'
import { UtensilsCrossed, MapPin, Phone, Mail, Clock, Globe, MessageCircle, Share2 } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const socialLinks = [
  { icon: Globe, href: '#', label: 'Instagram' },
  { icon: MessageCircle, href: '#', label: 'Facebook' },
  { icon: Share2, href: '#', label: 'Twitter' },
]

export default function Footer() {
  const theme = useTheme()
  const siteName = theme?.site_name || 'Presty Food'

  return (
    <footer style={{ background: '#1a1a1a' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--primary)' }}
              >
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white font-serif">
                {siteName}
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Une cuisine authentique dans un cadre chaleureux. Découvrez nos plats préparés avec passion.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/commande', label: 'Carte' },
                { href: '/reservation', label: 'Réservation' },
                { href: '/suivi-commande', label: 'Suivi commande' },
                { href: '/login', label: 'Connexion' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Horaires</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/50">
                <Clock className="w-4 h-4 mt-0.5" style={{ color: 'var(--primary)' }} />
                <div>
                  <p>Lun - Dim : 12h - 14h30</p>
                  <p>19h - 22h30</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/50">
                <MapPin className="w-4 h-4 mt-0.5" style={{ color: 'var(--primary)' }} />
                <span>{theme?.address || '123 Rue Principale, Alger'}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${theme?.phone || '0123456789'}`}
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors duration-300"
                >
                  <Phone className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  {theme?.phone || '01 23 45 67 89'}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${theme?.contact_email || 'contact@prestyfood.fr'}`}
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors duration-300"
                >
                  <Mail className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  {theme?.contact_email || 'contact@prestyfood.fr'}
                </a>
              </li>
            </ul>

            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} {siteName} — Tous droits réservés
          </p>
          <p className="text-sm text-white/20">
            Propulsé par{' '}
            <a
              href="https://gostopos.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/50 transition-colors duration-300"
              style={{ color: 'var(--primary)' }}
            >
              GostoPOS
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

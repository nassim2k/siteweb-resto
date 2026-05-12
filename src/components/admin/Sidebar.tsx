'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, UtensilsCrossed, Table2, Package,
  ShoppingBag, Palette, LogOut, Menu, X, CalendarCheck,
  ListTodo, Users, Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/admin/salles', icon: UtensilsCrossed, label: 'Salles' },
  { href: '/admin/tables', icon: Table2, label: 'Tables' },
  { href: '/admin/reservations', icon: CalendarCheck, label: 'Réservations' },
  { href: '/admin/catalogue', icon: Package, label: 'Catalogue' },
  { href: '/admin/commandes', icon: ShoppingBag, label: 'Commandes' },
  { href: '/admin/attributs', icon: ListTodo, label: 'Attributs' },
  { href: '/admin/infos', icon: Info, label: 'Infos' },
  { href: '/admin/comptes', icon: Users, label: 'Comptes' },
  { href: '/admin/theme', icon: Palette, label: 'Thème' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const nav = (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white">Administration</h2>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            )}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 w-full transition-colors"
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--primary)] text-white rounded-lg"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-[var(--primary)] flex-shrink-0 min-h-screen">
        {nav}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-[var(--primary)] h-full">
            {nav}
          </aside>
        </div>
      )}
    </>
  )
}

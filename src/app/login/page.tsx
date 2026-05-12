'use client'

import { useState, FormEvent, useEffect } from 'react'
import { LogIn, Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  // Si déjà connecté, rediriger vers /admin
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'no-session') setError('Session non trouvée, reconnecte-toi')
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = '/admin'
    })
  }, [])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('Email ou mot de passe incorrect')
        setLoading(false)
        return
      }

      if (!data?.session) {
        setError('Erreur de session, réessaye')
        setLoading(false)
        return
      }

      setRedirecting(true)
      // Forcer l'écriture des cookies puis rediriger
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        window.location.href = '/admin'
      } else {
        // Fallback: attendre et réessayer
        setTimeout(async () => {
          const { data: { session: s } } = await supabase.auth.getSession()
          window.location.href = s ? '/admin' : '/login?error=session'
        }, 1000)
      }
    } catch (err) {
      setError('Erreur technique: ' + String(err))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-blue-900 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="text-gray-500 text-sm mt-1">Administration du restaurant</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@restaurant.fr"
            required
          />
          <div className="relative">
            <Input
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button type="submit" disabled={loading || redirecting} className="w-full">
            {redirecting ? (
              <><Loader2 size={18} className="animate-spin" /> Redirection...</>
            ) : loading ? (
              'Connexion...'
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Accès réservé à l'administration
        </p>
      </motion.div>
    </div>
  )
}

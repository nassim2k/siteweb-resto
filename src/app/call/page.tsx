'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bell, CheckCircle, AlertCircle, Smartphone } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const COOLDOWN = 90

function CallContent() {
  const searchParams = useSearchParams()
  const tableId = searchParams.get('t')
  const signature = searchParams.get('s')

  const [status, setStatus] = useState<'idle' | 'calling' | 'success' | 'error' | 'cooldown'>('idle')
  const [message, setMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [salleName, setSalleName] = useState('')

  // Restaurer l'état depuis sessionStorage
  useEffect(() => {
    if (!tableId) return
    const saved = sessionStorage.getItem(`call-${tableId}`)
    if (saved) {
      const data = JSON.parse(saved)
      const elapsed = Math.floor((Date.now() - data.time) / 1000)
      if (elapsed < COOLDOWN) {
        setStatus('cooldown')
        setCooldown(COOLDOWN - elapsed)
        setSalleName(data.salle || '')
      } else {
        sessionStorage.removeItem(`call-${tableId}`)
      }
    }
  }, [tableId])

  // Compte à rebours
  useEffect(() => {
    if (status !== 'cooldown' || cooldown <= 0) return
    const t = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          setStatus('idle')
          if (tableId) sessionStorage.removeItem(`call-${tableId}`)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [status, cooldown, tableId])

  if (!tableId || !signature) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">QR Code invalide</h1>
          <p className="text-slate-400 leading-relaxed">
            Veuillez scanner le QR code présent sur votre table pour appeler un serveur.
          </p>
        </div>
      </div>
    )
  }

  const handleCall = async () => {
    setStatus('calling')
    try {
      const res = await fetch(`${API_URL}/table/call-secure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, signature, salleName }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        sessionStorage.setItem(`call-${tableId}`, JSON.stringify({ time: Date.now(), salle: salleName }))
        setTimeout(() => {
          setStatus('cooldown')
          setCooldown(COOLDOWN)
        }, 2000)
      } else if (res.status === 429) {
        setStatus('cooldown')
        setCooldown(data.remaining || COOLDOWN)
        setMessage(data.message || '')
      } else {
        setStatus('error')
        setMessage(data.message || 'Erreur inconnue')
      }
    } catch {
      setStatus('error')
      setMessage('Impossible de contacter le serveur. Veuillez réessayer.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-sm text-center">

        {/* Icône */}
        <div className="w-20 h-20 bg-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Bell className="w-10 h-10 text-orange-400" />
        </div>

        {/* Statut IDLE */}
        {status === 'idle' && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Table {tableId}</h1>
            <p className="text-slate-400 mb-6">Appuyez pour appeler un serveur</p>
            <select value={salleName} onChange={e => setSalleName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl mb-4 text-sm bg-slate-800 border border-slate-600 text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">Salle par défaut</option>
              <option value="Salle principale">Salle principale</option>
              <option value="Terrasse">Terrasse</option>
              <option value="Bar">Bar</option>
              <option value="Salon prive">Salon privé</option>
            </select>
            <button onClick={handleCall}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all active:scale-95 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
              <Bell className="w-6 h-6 inline mr-2" />
              Appeler le serveur
            </button>
          </>
        )}

        {/* Statut SUCCESS */}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-emerald-400 mb-2">Serveur appelé !</h2>
            <p className="text-slate-400">Un serveur arrive dans quelques instants.</p>
          </>
        )}

        {/* Statut COOLDOWN */}
        {status === 'cooldown' && (
          <>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-orange-500/50"
              style={{ background: 'rgba(249,115,22,0.1)' }}>
              <span className="text-4xl font-black text-orange-400">{cooldown}</span>
            </div>
            <h2 className="text-lg font-bold text-orange-400 mb-2">Déjà appelé</h2>
            <p className="text-slate-400 text-sm">
              Veuillez patienter {cooldown} secondes avant de rappeler.
            </p>
          </>
        )}

        {/* Statut ERROR */}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Erreur</h2>
            <p className="text-slate-400 text-sm mb-4">{message}</p>
            <button onClick={() => setStatus('idle')}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700">
              Réessayer
            </button>
          </>
        )}

        {/* Numéro de table */}
        <p className="text-xs text-slate-600 mt-8">
          Table {tableId} • Signature sécurisée
        </p>
      </div>
    </div>
  )
}

export default function CallPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallContent />
    </Suspense>
  )
}

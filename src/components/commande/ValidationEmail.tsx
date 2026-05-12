'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Product, ProductFamily } from '@/types'
import Button from '@/components/ui/Button'
import { formatPrice, generateCode } from '@/lib/utils'
import Input from '@/components/ui/Input'

interface ValidationEmailProps {
  email: string
  orderId?: string
  orderData: {
    customer_name: string
    customer_email: string
    items: { product_name: string; quantity: number; unit_price: number }[]
    total: number
  }
  onConfirmed: () => void
}

export default function ValidationEmail({ email, orderId, orderData, onConfirmed }: ValidationEmailProps) {
  const [step, setStep] = useState<'send' | 'code'>('send')
  const [code, setCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async () => {
    setSending(true)
    setError('')
    const newCode = generateCode()
    setGeneratedCode(newCode)

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch('/api/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: newCode, type: 'commande' }),
        })
        if (res.ok) break
      } catch { /* retry */ }
    }

    setSending(false)
    setStep('code')
  }

  const handleConfirm = async () => {
    if (code !== generatedCode) {
      setError('Code incorrect')
      return
    }

    if (orderId) {
      try {
        await fetch('/api/confirm-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })
      } catch {
        console.warn('Erreur lors de la confirmation côté serveur')
      }
    }

    onConfirmed()
  }

  if (step === 'code') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">Code de confirmation</h3>
          <p className="text-gray-600 text-sm">Un email a été envoyé à {email}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Votre code de confirmation</p>
          <p className="text-3xl font-bold tracking-[8px] text-[var(--primary)]">{generatedCode}</p>
        </div>
        <Input
          label="Code de confirmation"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Entrez le code"
          maxLength={6}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button onClick={handleConfirm} disabled={code.length !== 6} className="w-full">
          Confirmer la commande
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <p className="text-gray-600 text-sm">
        Pour valider votre commande, un code de confirmation vous sera envoyé par email.
      </p>
      <Button onClick={handleSendCode} disabled={sending} className="w-full">
        {sending ? 'Envoi...' : "Envoyer le code de confirmation"}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </motion.div>
  )
}

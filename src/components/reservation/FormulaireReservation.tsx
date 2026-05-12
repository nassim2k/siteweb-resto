'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Table } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { generateCode } from '@/lib/utils'

interface FormulaireReservationProps {
  table: Table
  onSuccess: () => void
}

export default function FormulaireReservation({ table, onSuccess }: FormulaireReservationProps) {
  const [step, setStep] = useState<'form' | 'code'>('form')
  const [code, setCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: table.capacity,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name) errs.name = 'Nom requis'
    if (!form.email) errs.email = 'Email requis'
    if (!form.date) errs.date = 'Date requise'
    if (!form.time) errs.time = 'Heure requise'
    if (form.guests < 1) errs.guests = 'Au moins 1 personne'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const [emailFailed, setEmailFailed] = useState(false)

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSending(true)
    setEmailFailed(false)
    const newCode = generateCode()
    setGeneratedCode(newCode)

    let ok = false
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      try {
        const res = await fetch('/api/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            code: newCode,
            type: 'reservation',
          }),
        })
        if (res.ok) { ok = true; break }
      } catch {
        // retry
      }
    }

    if (!ok) setEmailFailed(true)
    setSending(false)
    setStep('code')
  }

  const handleConfirm = async () => {
    if (code !== generatedCode) {
      setErrors({ code: 'Code incorrect' })
      return
    }

    setConfirming(true)

    await fetch('/api/confirm-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: table.id,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        reservationDate: form.date,
        reservationTime: form.time,
        guestCount: form.guests,
        confirmationCode: code,
      }),
    })

    setConfirming(false)
    onSuccess()
  }

  if (step === 'code') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">Code de confirmation</h3>
          {emailFailed ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800">
              L'envoi par email a échoué. Utilisez le code ci-dessous pour confirmer votre réservation.
            </div>
          ) : (
            <p className="text-gray-600 text-sm">Un code a été envoyé à {form.email}</p>
          )}
        </div>
        {emailFailed && (
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Votre code de confirmation</p>
            <p className="text-3xl font-bold tracking-[8px] text-[var(--primary)]">{generatedCode}</p>
          </div>
        )}
        <Input
          label="Code de confirmation"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Entrez le code reçu"
          maxLength={6}
          error={errors.code}
        />
        <Button onClick={handleConfirm} disabled={confirming || code.length !== 6} className="w-full">
          {confirming ? 'Confirmation...' : 'Confirmer la réservation'}
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Table <strong>{table.name}</strong> — {table.capacity} personnes
        </p>
      </div>

      <form onSubmit={handleSendCode} className="space-y-4">
        <Input
          label="Nom complet"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          placeholder="Votre nom"
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          placeholder="votre@email.com"
        />
        <Input
          label="Téléphone"
          type="tel"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          placeholder="06 XX XX XX XX"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            error={errors.date}
          />
          <Input
            label="Heure"
            type="time"
            value={form.time}
            onChange={e => setForm({ ...form, time: e.target.value })}
            error={errors.time}
          />
        </div>
        <Input
          label="Nombre de personnes"
          type="number"
          min={1}
          max={table.capacity}
          value={form.guests}
          onChange={e => setForm({ ...form, guests: Number(e.target.value) })}
          error={errors.guests}
        />
        <Button type="submit" disabled={sending} className="w-full">
          {sending ? 'Envoi en cours...' : 'Envoyer le code de confirmation'}
        </Button>
      </form>
    </motion.div>
  )
}

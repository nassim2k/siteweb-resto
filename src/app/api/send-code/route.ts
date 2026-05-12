import { NextRequest, NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'

export async function POST(req: NextRequest) {
  const { email, code, type } = await req.json()

  if (!email || !code) {
    return NextResponse.json({ error: 'Email et code requis' }, { status: 400 })
  }

  const subject = type === 'reservation'
    ? 'Code de confirmation - Réservation'
    : 'Code de confirmation - Commande'

  const text = `Votre code de confirmation est : ${code}\n\nUtilisez ce code pour valider votre ${type === 'reservation' ? 'réservation' : 'commande'}.`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Code de confirmation</h2>
      <p>Voici votre code de confirmation pour votre ${type === 'reservation' ? 'réservation' : 'commande'} :</p>
      <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; border-radius: 8px; margin: 20px 0;">
        ${code}
      </div>
      <p>Ce code expire dans 15 minutes.</p>
      <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
    </div>
  `

  const sendPromise = fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SMTP_PASS}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.SMTP_FROM || 'Khobzi Restaurant <onboarding@resend.dev>',
      to: email,
      subject,
      text,
      html,
    }),
  }).catch(err => {
    console.error('Email send failed:', err)
  })

  if (sendPromise) waitUntil(sendPromise)

  return NextResponse.json({ success: true })
}

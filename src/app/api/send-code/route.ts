import { NextRequest, NextResponse } from 'next/server'
import { sendConfirmationCode } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, code, type } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email et code requis' }, { status: 400 })
    }

    await sendConfirmationCode(email, code, type || 'commande')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending code:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du code' }, { status: 500 })
  }
}

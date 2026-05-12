'use server'

import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  const fromEmail = process.env.SMTP_FROM || `"Khobzi Restaurant" <${process.env.SMTP_USER}>`

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject,
    text,
    html,
  })
}

export async function sendConfirmationCode(
  email: string,
  code: string,
  type: 'reservation' | 'commande'
) {
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

  await sendEmail({ to: email, subject, text, html })
}

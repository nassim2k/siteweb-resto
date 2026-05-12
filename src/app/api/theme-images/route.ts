import { NextRequest, NextResponse } from 'next/server'
import { readdirSync } from 'fs'
import { join } from 'path'

export async function GET(req: NextRequest) {
  const theme = req.nextUrl.searchParams.get('theme')

  if (!theme) return NextResponse.json({ error: 'theme requis' }, { status: 400 })

  try {
    const dir = join(process.cwd(), 'public', 'themes', theme)
    const files = readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    if (files.length === 0) return NextResponse.json({ urls: [], url: null })

    const shuffled = [...files].sort(() => Math.random() - 0.5)
    const urls = shuffled.map(f => `/themes/${theme}/${f}`)

    return NextResponse.json({ urls, url: urls[0] || null })
  } catch {
    return NextResponse.json({ urls: [], url: null })
  }
}

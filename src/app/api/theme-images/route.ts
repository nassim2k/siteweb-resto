import { NextRequest, NextResponse } from 'next/server'
import { readdirSync } from 'fs'
import { join } from 'path'

export async function GET(req: NextRequest) {
  const theme = req.nextUrl.searchParams.get('theme')
  const countParam = req.nextUrl.searchParams.get('count')
  const count = Math.min(Math.max(parseInt(countParam || '4') || 4, 1), 20)

  if (!theme) return NextResponse.json({ error: 'theme requis' }, { status: 400 })

  try {
    const dir = join(process.cwd(), 'public', 'themes', theme)
    const files = readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    if (files.length === 0) return NextResponse.json({ urls: [], url: null })

    // Shuffle and pick
    const shuffled = [...files].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, Math.min(count, files.length))
    const urls = picked.map(f => `/themes/${theme}/${f}`)

    return NextResponse.json({ urls, url: urls[0] || null })
  } catch {
    return NextResponse.json({ urls: [], url: null })
  }
}

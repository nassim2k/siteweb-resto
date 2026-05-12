import { NextRequest, NextResponse } from 'next/server'
import { readdirSync } from 'fs'
import { join } from 'path'

export async function GET(req: NextRequest) {
  const theme = req.nextUrl.searchParams.get('theme')
  if (!theme) return NextResponse.json({ error: 'theme requis' }, { status: 400 })

  try {
    const dir = join(process.cwd(), 'public', 'themes', theme)
    const files = readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    if (files.length === 0) return NextResponse.json({ url: null })

    const picked = files[Math.floor(Math.random() * files.length)]
    return NextResponse.json({ url: `/themes/${theme}/${picked}` })
  } catch {
    return NextResponse.json({ url: null })
  }
}

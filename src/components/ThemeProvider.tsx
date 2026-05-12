'use client'

import { useState, useEffect, useCallback } from 'react'
import { Theme } from '@/types'
import { createClient } from '@/lib/supabase/client'

export function useTheme() {
  const [theme, setTheme] = useState<Theme | null>(null)
  const supabase = createClient()

  const fetchTheme = useCallback(async () => {
    const { data } = await supabase.from('themes').select('*').single()
    if (data) {
      setTheme(data)
      applyTheme(data)
    }
  }, [])

  useEffect(() => {
    fetchTheme()
    const onFocus = () => fetchTheme()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchTheme])

  return theme
}

function applyTheme(theme: Theme) {
  document.documentElement.style.setProperty('--primary', theme.primary_color)
  document.documentElement.style.setProperty('--secondary', theme.secondary_color)
  document.documentElement.style.setProperty('--accent', theme.accent_color)
}

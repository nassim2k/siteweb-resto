'use client'

import { ReactNode } from 'react'
import { useTheme } from '@/components/ThemeProvider'

export default function ThemeWrapper({ children }: { children: ReactNode }) {
  useTheme()
  return <>{children}</>
}

'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export default function Card({ children, className, onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl shadow-lg overflow-hidden',
        hover && 'cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  )
}

'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants: Record<string, string> = {
      primary: 'bg-[var(--primary)] text-white hover:opacity-90',
      secondary: 'bg-[var(--secondary)] text-[var(--primary)] hover:opacity-90',
      outline: 'border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white',
      ghost: 'text-[var(--primary)] hover:bg-gray-100',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    }

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5',
      lg: 'px-8 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export default Button

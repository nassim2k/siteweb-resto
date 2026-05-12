export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function formatPrice(price: number): string {
  return `${price.toFixed(2).replace('.', ',')} €`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  })
}

export function formatTime(time: string): string {
  return time.substring(0, 5)
}

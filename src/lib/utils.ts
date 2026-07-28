import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: number, currency = 'UZS'): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${formatted} ${currency}`
}

/** Compact money for tight mobile stats: 12.7 млн UZS */
export function formatMoneyCompact(amount: number, currency = 'UZS'): string {
  const n = Math.round(amount)
  if (n >= 1_000_000) {
    const mln = n / 1_000_000
    const text = mln >= 100 ? Math.round(mln).toString() : mln.toFixed(1).replace(/\.0$/, '')
    return `${text} млн ${currency}`
  }
  if (n >= 1_000) {
    return `${Math.round(n / 1_000)} тыс ${currency}`
  }
  return formatMoney(n, currency)
}

export function formatDate(value: string | Date, locale = 'ru-RU'): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function calcArea(length: number, width: number): number {
  return Math.round(length * width * 100) / 100
}

export function calcPerimeter(length: number, width: number): number {
  return Math.round(2 * (length + width) * 100) / 100
}

/** Copy text to clipboard with textarea fallback for non-secure contexts. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

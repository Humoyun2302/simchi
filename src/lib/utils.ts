import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  formatNumber,
  formatUnit,
  formatMoney,
  formatMoneyCompact,
} from '@/lib/format'

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

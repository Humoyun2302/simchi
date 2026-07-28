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

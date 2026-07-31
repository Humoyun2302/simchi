import { getAppLanguage, getIntlLocale, type AppLanguage } from '@/lib/locale'

/** Full currency for detail pages: `2 500 000 UZS` / `2,500,000 UZS` */
export function formatCurrency(amount: number, lang: AppLanguage = getAppLanguage()): string {
  const locale = getIntlLocale(lang)
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
  if (lang === 'en') return `${formatted} UZS`
  return `${formatted} UZS`
}

/** Compact currency for cards/stats */
export function formatCompactCurrency(
  amount: number,
  lang: AppLanguage = getAppLanguage(),
): string {
  const n = Math.round(amount)
  if (lang === 'en') {
    if (n >= 1_000_000) {
      const m = n / 1_000_000
      const text = m >= 100 ? Math.round(m).toString() : m.toFixed(1).replace(/\.0$/, '')
      return `UZS ${text}M`
    }
    if (n >= 1_000) {
      return `UZS ${Math.round(n / 1_000)}K`
    }
    return formatCurrency(n, lang)
  }

  const mlnLabel = lang === 'uz' ? 'mln' : 'млн'
  const tysLabel = lang === 'uz' ? 'ming' : 'тыс'
  if (n >= 1_000_000) {
    const mln = n / 1_000_000
    const text = mln >= 100 ? Math.round(mln).toString() : mln.toFixed(1).replace('.', ',').replace(/,0$/, '')
    return `${text} ${mlnLabel} UZS`
  }
  if (n >= 1_000) {
    return `${Math.round(n / 1_000)} ${tysLabel} UZS`
  }
  return formatCurrency(n, lang)
}

export function formatDate(value: string | Date, lang: AppLanguage = getAppLanguage()): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat(getIntlLocale(lang), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatNumber(value: number, lang: AppLanguage = getAppLanguage()): string {
  return new Intl.NumberFormat(getIntlLocale(lang)).format(value)
}

export function formatUnit(unit: string, lang: AppLanguage = getAppLanguage()): string {
  const map: Record<string, Record<AppLanguage, string>> = {
    m: { ru: 'м', uz: 'm', en: 'm' },
    'м': { ru: 'м', uz: 'm', en: 'm' },
    m2: { ru: 'м²', uz: 'm²', en: 'm²' },
    'м²': { ru: 'м²', uz: 'm²', en: 'm²' },
    pcs: { ru: 'шт', uz: 'dona', en: 'pcs' },
    'шт': { ru: 'шт', uz: 'dona', en: 'pcs' },
    m3: { ru: 'м³', uz: 'm³', en: 'm³' },
    kg: { ru: 'кг', uz: 'kg', en: 'kg' },
    'кг': { ru: 'кг', uz: 'kg', en: 'kg' },
  }
  return map[unit]?.[lang] ?? unit
}

/** @deprecated Prefer formatCurrency — kept for gradual migration */
export const formatMoney = formatCurrency
/** @deprecated Prefer formatCompactCurrency */
export const formatMoneyCompact = formatCompactCurrency

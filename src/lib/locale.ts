import i18n from '@/i18n'

export type AppLanguage = 'ru' | 'uz' | 'en'

export function getAppLanguage(): AppLanguage {
  const lng = (i18n.language || 'ru').slice(0, 2)
  if (lng === 'uz' || lng === 'en') return lng
  return 'ru'
}

export function getIntlLocale(lang = getAppLanguage()): string {
  if (lang === 'uz') return 'uz-UZ'
  if (lang === 'en') return 'en-US'
  return 'ru-RU'
}

export function applyDocumentLang(lang: AppLanguage) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang
  }
}

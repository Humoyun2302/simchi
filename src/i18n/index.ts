import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { ru } from './locales/ru'
import { uz } from './locales/uz'
import { en } from './locales/en'
import { applyDocumentLang, type AppLanguage } from '@/lib/locale'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

const STORAGE_KEY = 'simchi_locale'

function detectBrowserLanguage(): AppLanguage | null {
  if (typeof navigator === 'undefined') return null
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const raw of langs) {
    const code = raw.slice(0, 2).toLowerCase()
    if (code === 'ru' || code === 'uz' || code === 'en') return code
  }
  return null
}

function resolveInitialLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ru' || saved === 'uz' || saved === 'en') return saved
  } catch {
    // ignore
  }
  return detectBrowserLanguage() ?? 'ru'
}

const initial = resolveInitialLanguage()

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    uz: { translation: uz },
    en: { translation: en },
  },
  lng: initial,
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
})

applyDocumentLang(initial)

i18n.on('languageChanged', (lng) => {
  const lang = (lng.slice(0, 2) as AppLanguage) || 'ru'
  applyDocumentLang(lang === 'uz' || lang === 'en' ? lang : 'ru')
})

export default i18n

export async function setLocale(locale: AppLanguage, userId?: string | null) {
  localStorage.setItem(STORAGE_KEY, locale)
  applyDocumentLang(locale)
  await i18n.changeLanguage(locale)

  if (userId && isSupabaseConfigured) {
    try {
      await supabase
        .from('profiles')
        .update({ locale, updated_at: new Date().toISOString() } as never)
        .eq('id', userId)
    } catch {
      // local preference still applied
    }
  }
}

/** Apply language from profile after auth, without wiping a newer local choice unless profile has one. */
export async function hydrateLocaleFromProfile(profileLocale: string | null | undefined) {
  const local = localStorage.getItem(STORAGE_KEY)
  const fromProfile =
    profileLocale === 'ru' || profileLocale === 'uz' || profileLocale === 'en' ? profileLocale : null

  // Priority: Supabase profile → localStorage → browser → ru
  const next = fromProfile ?? (local === 'ru' || local === 'uz' || local === 'en' ? local : null) ?? detectBrowserLanguage() ?? 'ru'

  if (fromProfile) {
    localStorage.setItem(STORAGE_KEY, fromProfile)
  }

  if (i18n.language !== next) {
    applyDocumentLang(next)
    await i18n.changeLanguage(next)
  } else {
    applyDocumentLang(next)
  }
}

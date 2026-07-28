import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { ru } from './locales/ru'
import { uz } from './locales/uz'
import { en } from './locales/en'

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('simchi_locale') : null

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    uz: { translation: uz },
    en: { translation: en },
  },
  lng: saved || 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
})

export default i18n

export function setLocale(locale: 'ru' | 'uz' | 'en') {
  localStorage.setItem('simchi_locale', locale)
  void i18n.changeLanguage(locale)
}

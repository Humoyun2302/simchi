import { useTranslation } from 'react-i18next'
import { Select } from '@/components/ui/select'
import { setLocale } from '@/i18n'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth-store'
import type { AppLanguage } from '@/lib/locale'

export function LanguageSelector({ className }: { className?: string }) {
  const { t } = useTranslation()
  const profile = useAuthStore((s) => s.profile)
  const updateProfileLocal = useAuthStore((s) => s.updateProfileLocal)
  const demoMode = useAuthStore((s) => s.demoMode)

  const value = (i18n.language?.slice(0, 2) || 'ru') as AppLanguage

  return (
    <Select
      className={className}
      label={t('settings.language')}
      aria-label={t('settings.languageAria')}
      value={value}
      onChange={(e) => {
        const locale = e.target.value as AppLanguage
        const userId = !demoMode ? profile?.id : null
        void setLocale(locale, userId)
        updateProfileLocal({ locale })
        // Keep focus on the select after language change
        requestAnimationFrame(() => {
          const el = document.activeElement
          if (el instanceof HTMLElement) el.focus()
        })
      }}
      options={[
        { value: 'ru', label: t('languages.ru') },
        { value: 'uz', label: t('languages.uz') },
        { value: 'en', label: t('languages.en') },
      ]}
    />
  )
}

import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/ui/logo'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { setLocale } from '@/i18n'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth-store'

export function SettingsPage() {
  const { t } = useTranslation()
  const setRoleLocal = useAuthStore((s) => s.setRoleLocal)
  const profile = useAuthStore((s) => s.profile)
  const demoMode = useAuthStore((s) => s.demoMode)

  return (
    <div className="space-y-5">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
      <Card className="space-y-4">
        <Select
          label={t('settings.language')}
          value={i18n.language}
          onChange={(e) => setLocale(e.target.value as 'ru' | 'uz' | 'en')}
          options={[
            { value: 'ru', label: 'Русский' },
            { value: 'uz', label: "O'zbekcha" },
            { value: 'en', label: 'English' },
          ]}
        />
        {demoMode ? (
          <Select
            label="Демо-роль"
            value={profile?.role ?? 'electrician'}
            onChange={(e) => setRoleLocal(e.target.value as 'electrician' | 'supplier' | 'admin')}
            options={[
              { value: 'electrician', label: 'electrician' },
              { value: 'supplier', label: 'supplier' },
              { value: 'admin', label: 'admin' },
            ]}
          />
        ) : null}
        <p className="text-sm text-muted">{t('settings.priceList')}: доступен в разделе работ проекта</p>
      </Card>
    </div>
  )
}

import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/ui/logo'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { LanguageSelector } from '@/components/ui/language-selector'
import { useAuthStore } from '@/stores/auth-store'
import { translateRole } from '@/lib/labels'

export function SettingsPage() {
  const { t } = useTranslation()
  const setRoleLocal = useAuthStore((s) => s.setRoleLocal)
  const profile = useAuthStore((s) => s.profile)
  const demoMode = useAuthStore((s) => s.demoMode)

  return (
    <div className="space-y-5">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
      <Card className="space-y-4">
        <LanguageSelector />
        {demoMode ? (
          <Select
            label={t('settings.demoRole')}
            value={profile?.role ?? 'electrician'}
            onChange={(e) => setRoleLocal(e.target.value as 'electrician' | 'supplier' | 'admin')}
            options={[
              { value: 'electrician', label: translateRole(t, 'electrician') },
              { value: 'supplier', label: translateRole(t, 'supplier') },
              { value: 'admin', label: translateRole(t, 'admin') },
            ]}
          />
        ) : null}
        <p className="text-sm text-muted">
          {t('settings.priceList')}: {t('settings.priceListHint')}
        </p>
      </Card>
    </div>
  )
}

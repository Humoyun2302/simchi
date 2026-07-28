import { useTranslation } from 'react-i18next'
import { LogIn, LogOut, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/logo'
import { Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

export function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const demoMode = useAuthStore((s) => s.demoMode)

  if (!profile) return null

  return (
    <div className="space-y-5">
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">{profile.full_name}</h2>
          <Badge tone="primary">{profile.role}</Badge>
        </div>
        <p className="text-muted">{profile.email}</p>
        <p>{profile.phone}</p>
        <p>{profile.city}</p>
        {profile.company_name ? <p className="font-semibold">{profile.company_name}</p> : null}
        {demoMode ? <Badge tone="warning">Гостевой режим</Badge> : <Badge tone="success">Аккаунт подключён</Badge>}
      </Card>

      {demoMode ? (
        <div className="grid gap-3">
          <Button className="w-full" onClick={() => navigate('/login')}>
            <LogIn size={18} />
            {t('auth.login')}
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => navigate('/register')}>
            <UserPlus size={18} />
            {t('auth.register')}
          </Button>
          <p className="text-center text-sm text-muted">Вход и регистрация необязательны</p>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            await signOut()
            navigate('/profile')
          }}
        >
          <LogOut size={18} />
          {t('nav.logout')}
        </Button>
      )}
    </div>
  )
}

import { useTranslation } from 'react-i18next'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/logo'
import { Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { isSupabaseConfigured } from '@/lib/supabase'

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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">{profile.full_name}</h2>
          <Badge tone="primary">{profile.role}</Badge>
        </div>
        <p className="text-muted">{profile.email}</p>
        <p>{profile.phone}</p>
        <p>{profile.city}</p>
        {profile.company_name ? <p className="font-semibold">{profile.company_name}</p> : null}
        {demoMode || !isSupabaseConfigured ? (
          <Badge tone="warning">Demo mode</Badge>
        ) : null}
      </Card>
      <Button
        variant="outline"
        className="w-full"
        onClick={async () => {
          await signOut()
          navigate('/login')
        }}
      >
        <LogOut size={18} />
        {t('nav.logout')}
      </Button>
    </div>
  )
}

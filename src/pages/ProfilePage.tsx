import { useTranslation } from 'react-i18next'
import { LogIn, LogOut, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { PageHeader } from '@/components/ui/logo'
import { Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth-store'
import { useToastStore } from '@/stores/toast-store'

export function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const demoMode = useAuthStore((s) => s.demoMode)
  const updateProfileLocal = useAuthStore((s) => s.updateProfileLocal)
  const push = useToastStore((s) => s.push)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    city: profile?.city ?? '',
    company_name: profile?.company_name ?? '',
  })

  if (!profile) return null

  return (
    <div className="space-y-5">
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />
      <Card className="space-y-3">
        {editing ? (
          <>
            <Input label={t('auth.fullName')} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <Input label={t('auth.phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label={t('auth.city')} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input label={t('auth.company')} value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
              <Button
                onClick={() => {
                  updateProfileLocal({
                    full_name: form.full_name.trim() || profile.full_name,
                    phone: form.phone || null,
                    city: form.city || null,
                    company_name: form.company_name || null,
                  })
                  push(t('common.success'), 'success')
                  setEditing(false)
                }}
              >
                {t('common.save')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-extrabold">{profile.full_name}</h2>
              <Badge tone="primary">{profile.role}</Badge>
            </div>
            <p className="text-muted">{profile.email}</p>
            <p>{profile.phone}</p>
            <p>{profile.city}</p>
            {profile.company_name ? <p className="font-semibold">{profile.company_name}</p> : null}
            {demoMode ? <Badge tone="warning">Гостевой режим</Badge> : <Badge tone="success">Аккаунт подключён</Badge>}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setForm({
                  full_name: profile.full_name,
                  phone: profile.phone ?? '',
                  city: profile.city ?? '',
                  company_name: profile.company_name ?? '',
                })
                setEditing(true)
              }}
            >
              {t('common.edit')}
            </Button>
          </>
        )}
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

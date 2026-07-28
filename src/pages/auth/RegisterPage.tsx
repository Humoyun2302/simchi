import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { UserPlus } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useToastStore } from '@/stores/toast-store'

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(9),
  city: z.string().min(2),
  company_name: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const signUp = useAuthStore((s) => s.signUp)
  const loading = useAuthStore((s) => s.loading)
  const push = useToastStore((s) => s.push)
  const [error, setError] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      phone: '',
      city: 'Ташкент',
      company_name: '',
    },
  })

  if (profile) return <Navigate to="/" replace />

  const onSubmit = form.handleSubmit(async (values) => {
    setError('')
    try {
      await signUp(values)
      push(t('common.success'), 'success')
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
    }
  })

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8">
      <Logo size="lg" className="mb-8 justify-center" />
      <Card>
        <h1 className="text-2xl font-extrabold">{t('auth.registerTitle')}</h1>
        <p className="mt-1 text-sm text-muted">{t('auth.electricianOnly')}</p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
          <Input label={t('auth.fullName')} error={form.formState.errors.full_name?.message} {...form.register('full_name')} />
          <Input label={t('auth.email')} type="email" error={form.formState.errors.email?.message} {...form.register('email')} />
          <Input label={t('auth.password')} type="password" error={form.formState.errors.password?.message} {...form.register('password')} />
          <Input label={t('auth.phone')} error={form.formState.errors.phone?.message} {...form.register('phone')} />
          <Input label={t('auth.city')} error={form.formState.errors.city?.message} {...form.register('city')} />
          <Input label={t('auth.company')} {...form.register('company_name')} />
          {error ? <p className="text-sm text-danger-text">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            <UserPlus size={18} />
            {t('auth.register')}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="font-semibold text-primary">
            {t('auth.login')}
          </Link>
        </p>
      </Card>
    </div>
  )
}

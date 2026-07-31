import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, LogIn } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LanguageSelector } from '@/components/ui/language-selector'
import { useAuthStore } from '@/stores/auth-store'
import { useToastStore } from '@/stores/toast-store'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const demoMode = useAuthStore((s) => s.demoMode)
  const signIn = useAuthStore((s) => s.signIn)
  const enterDemo = useAuthStore((s) => s.enterDemo)
  const loading = useAuthStore((s) => s.loading)
  const push = useToastStore((s) => s.push)
  const [error, setError] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setError('')
    try {
      await signIn(values.email, values.password)
      push(t('common.success'), 'success')
      const from = (location.state as { from?: string } | null)?.from || '/'
      navigate(from)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
    }
  })

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8">
      <Logo size="lg" className="mb-8 justify-center" />
      <Card>
        <LanguageSelector className="mb-4" />
        <h1 className="text-2xl font-extrabold">{t('auth.loginTitle')}</h1>
        <p className="mt-1 text-sm text-muted">{t('auth.loginSubtitle')}</p>
        <p className="mt-2 text-sm text-muted">{t('auth.loginOptional')}</p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
          <Input
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />
          <Input
            label={t('auth.password')}
            type="password"
            autoComplete="current-password"
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />
          {error ? <p className="text-sm text-danger-text">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            <LogIn size={18} />
            {t('auth.login')}
          </Button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <Link to="/reset-password" className="font-semibold text-primary">
            {t('auth.forgotPassword')}
          </Link>
          <p className="text-muted">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-semibold text-primary">
              {t('auth.register')}
            </Link>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-5 w-full"
          onClick={() => {
            enterDemo()
            navigate('/')
          }}
        >
          <ArrowLeft size={18} />
          {t('auth.continueWithoutLogin')}
        </Button>
        {!demoMode ? null : (
          <p className="mt-3 text-center text-xs text-muted">{t('auth.guestNow')}</p>
        )}
      </Card>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Mail } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useToastStore } from '@/stores/toast-store'

type FormValues = { email: string }

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const resetPassword = useAuthStore((s) => s.resetPassword)
  const push = useToastStore((s) => s.push)
  const [sent, setSent] = useState(false)

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('validation.email')),
      }),
    [t],
  )

  const form = useForm<FormValues>({
    resolver: (values, context, options) => zodResolver(schema)(values, context, options),
    defaultValues: { email: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await resetPassword(values.email)
      setSent(true)
      push(t('auth.resetSent'), 'success')
    } catch (e) {
      const message = e instanceof Error ? e.message : t('auth.resetUnavailable')
      push(message || t('auth.resetUnavailable'), 'error')
    }
  })

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8">
      <Logo size="lg" className="mb-8 justify-center" />
      <Card>
        <h1 className="text-2xl font-extrabold">{t('auth.forgotPassword')}</h1>
        {sent ? (
          <p className="mt-4 text-sm text-muted">{t('auth.resetSent')}</p>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
            <Input
              label={t('auth.email')}
              type="email"
              error={form.formState.errors.email?.message}
              {...form.register('email')}
            />
            <Button type="submit">
              <Mail size={18} />
              {t('auth.sendReset')}
            </Button>
          </form>
        )}
        <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-primary">
          {t('auth.login')}
        </Link>
        <div className="mt-3">
          <Link to="/" className="text-sm font-semibold text-muted">
            {t('auth.continueWithoutLogin')}
          </Link>
        </div>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UzbekPhoneInput } from '@/components/ui/uzbek-phone-input'
import { useAuthStore } from '@/stores/auth-store'
import { useToastStore } from '@/stores/toast-store'
import { isValidUzbekPhone, normalizeUzbekPhone } from '@/lib/phone'

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().refine(isValidUzbekPhone, 'Введите полный номер телефона'),
  city: z.string().min(2),
  company_name: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const signUp = useAuthStore((s) => s.signUp)
  const enterDemo = useAuthStore((s) => s.enterDemo)
  const loading = useAuthStore((s) => s.loading)
  const push = useToastStore((s) => s.push)
  const [error, setError] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      phone: '',
      city: 'Ташкент',
      company_name: '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setError('')
    try {
      const phone = normalizeUzbekPhone(values.phone) ?? values.phone
      await signUp({ ...values, phone })
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
        <p className="mt-2 text-sm text-muted">Регистрация по желанию — приложение доступно и без аккаунта.</p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
          <Input label={t('auth.fullName')} error={form.formState.errors.full_name?.message} {...form.register('full_name')} />
          <Input label={t('auth.email')} type="email" error={form.formState.errors.email?.message} {...form.register('email')} />
          <Input label={t('auth.password')} type="password" error={form.formState.errors.password?.message} {...form.register('password')} />
          <Controller
            name="phone"
            control={form.control}
            render={({ field }) => (
              <UzbekPhoneInput
                label={t('auth.phone')}
                value={field.value}
                error={form.formState.errors.phone?.message}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
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
          Продолжить без регистрации
        </Button>
      </Card>
    </div>
  )
}

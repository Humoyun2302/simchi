import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/logo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAppDataStore } from '@/stores/app-data-store'
import { useAuthStore } from '@/stores/auth-store'
import { useState } from 'react'
import { useToastStore } from '@/stores/toast-store'

export function ClientsPage() {
  const { t } = useTranslation()
  const clients = useAppDataStore((s) => s.clients)
  const upsertClient = useAppDataStore((s) => s.upsertClient)
  const profile = useAuthStore((s) => s.profile)
  const push = useToastStore((s) => s.push)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', telegram: '', comment: '', city: 'Ташкент' })

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('clients.title')}
        subtitle={t('clients.subtitle')}
        actions={
          <Button onClick={() => setOpen((v) => !v)}>
            <Plus size={18} />
            {t('clients.add')}
          </Button>
        }
      />
      {open ? (
        <Card className="space-y-3">
          <Input label={t('auth.fullName')} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label={t('auth.phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Telegram" value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} />
          <Input label={t('auth.city')} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Textarea label={t('project.wizard.comment')} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          <Button
            className="w-full"
            onClick={() => {
              if (!profile || !form.full_name || !form.phone) return
              upsertClient({
                id: crypto.randomUUID(),
                electrician_id: profile.id,
                full_name: form.full_name,
                phone: form.phone,
                telegram: form.telegram || null,
                comment: form.comment || null,
                city: form.city,
              })
              push(t('common.success'), 'success')
              setOpen(false)
              setForm({ full_name: '', phone: '', telegram: '', comment: '', city: 'Ташкент' })
            }}
          >
            {t('common.save')}
          </Button>
        </Card>
      ) : null}
      {clients.length === 0 ? (
        <EmptyState title={t('common.empty')} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {clients.map((c) => (
            <Link key={c.id} to={`/clients/${c.id}`} className="glass rounded-[28px] p-5 block">
              <p className="font-bold">{c.full_name}</p>
              <p className="text-sm text-muted">{c.phone}</p>
              <p className="text-sm text-muted">{c.city}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

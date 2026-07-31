import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAppDataStore } from '@/stores/app-data-store'
import { formatMoney } from '@/lib/utils'
import { formatUzbekPhone, isValidUzbekPhone, normalizeUzbekPhone } from '@/lib/phone'
import { useToastStore } from '@/stores/toast-store'
import { ConfirmDialog } from '@/components/ui/dialog'
import { UzbekPhoneInput } from '@/components/ui/uzbek-phone-input'

export function ClientDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const client = useAppDataStore((s) => s.clients.find((c) => c.id === id))
  const allProjects = useAppDataStore((s) => s.projects)
  const projects = useMemo(
    () => allProjects.filter((p) => p.client_id === id),
    [allProjects, id],
  )
  const upsertClient = useAppDataStore((s) => s.upsertClient)
  const deleteClient = useAppDataStore((s) => s.deleteClient)
  const push = useToastStore((s) => s.push)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({
    full_name: client?.full_name ?? '',
    phone: client?.phone ?? '',
    telegram: client?.telegram ?? '',
    comment: client?.comment ?? '',
    city: client?.city ?? '',
  })

  if (!client) return <Card>{t('common.empty')}</Card>

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        {editing ? (
          <>
            <Input label={t('auth.fullName')} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <UzbekPhoneInput
              label={t('auth.phone')}
              value={form.phone}
              onValueChange={(phone) => setForm({ ...form, phone })}
            />
            <Input label="Telegram" value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} />
            <Input label={t('auth.city')} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Textarea label={t('project.wizard.comment')} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
              <Button
                onClick={() => {
                  if (!form.full_name.trim()) {
                    push(t('common.required'), 'error')
                    return
                  }
                  if (!isValidUzbekPhone(form.phone)) {
                    push(t('validation.phoneComplete'), 'error')
                    return
                  }
                  upsertClient({
                    ...client,
                    full_name: form.full_name.trim(),
                    phone: normalizeUzbekPhone(form.phone)!,
                    telegram: form.telegram || null,
                    comment: form.comment || null,
                    city: form.city || null,
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
            <h1 className="text-3xl font-extrabold">{client.full_name}</h1>
            <p className="text-muted">{formatUzbekPhone(client.phone)}</p>
            {client.telegram ? <p className="text-muted">{client.telegram}</p> : null}
            {client.city ? <p className="text-muted">{client.city}</p> : null}
            {client.comment ? <p className="text-sm">{client.comment}</p> : null}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setForm({
                    full_name: client.full_name,
                    phone: client.phone,
                    telegram: client.telegram ?? '',
                    comment: client.comment ?? '',
                    city: client.city ?? '',
                  })
                  setEditing(true)
                }}
              >
                {t('common.edit')}
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(true)}>
                {t('common.delete')}
              </Button>
            </div>
          </>
        )}
      </Card>
      <h2 className="text-xl font-bold">{t('nav.projects')}</h2>
      {projects.length === 0 ? <Card><p className="text-muted">{t('common.empty')}</p></Card> : null}
      {projects.map((p) => (
        <Link key={p.id} to={`/projects/${p.id}`} className="glass block rounded-[28px] p-4">
          <p className="font-bold">{p.title}</p>
          <p className="text-primary font-extrabold">{formatMoney(p.grand_total)}</p>
        </Link>
      ))}
      <ConfirmDialog
        open={confirmDelete}
        title={t('common.delete')}
        description={t('clients.deleteDescription')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteClient(client.id)
          setConfirmDelete(false)
          navigate('/clients')
        }}
      />
    </div>
  )
}

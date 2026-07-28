import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { useAppDataStore } from '@/stores/app-data-store'
import { formatMoney } from '@/lib/utils'

export function ClientDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const client = useAppDataStore((s) => s.clients.find((c) => c.id === id))
  const projects = useAppDataStore((s) => s.projects.filter((p) => p.client_id === id))

  if (!client) return <Card>{t('common.empty')}</Card>

  return (
    <div className="space-y-5">
      <Card className="space-y-2">
        <h1 className="text-3xl font-extrabold">{client.full_name}</h1>
        <p className="text-muted">{client.phone}</p>
        {client.telegram ? <p className="text-muted">{client.telegram}</p> : null}
        {client.comment ? <p className="text-sm">{client.comment}</p> : null}
      </Card>
      <h2 className="text-xl font-bold">{t('nav.projects')}</h2>
      {projects.map((p) => (
        <Link key={p.id} to={`/projects/${p.id}`} className="glass block rounded-[28px] p-4">
          <p className="font-bold">{p.title}</p>
          <p className="text-primary font-extrabold">{formatMoney(p.grand_total)}</p>
        </Link>
      ))}
    </div>
  )
}

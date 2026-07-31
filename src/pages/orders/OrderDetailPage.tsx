import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppDataStore } from '@/stores/app-data-store'
import { formatMoney, formatDate } from '@/lib/utils'
import { useToastStore } from '@/stores/toast-store'
import type { OrderStatus } from '@/types/database'
import { EMPTY_LIST } from '@/lib/empty'

const ELECTRICIAN_ACTIONS: OrderStatus[] = ['cancelled', 'received', 'partially_returned', 'returned']

export function OrderDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const order = useAppDataStore((s) => s.orders.find((o) => o.id === id))
  const project = useAppDataStore((s) => s.projects.find((p) => p.id === order?.project_id))
  const materials = useAppDataStore((s) =>
    order?.project_id ? s.materials[order.project_id] ?? EMPTY_LIST : EMPTY_LIST,
  )
  const updateOrderStatus = useAppDataStore((s) => s.updateOrderStatus)
  const push = useToastStore((s) => s.push)

  if (!order) return <Card>{t('common.empty')}</Card>

  return (
    <div className="space-y-5">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={() => navigate('/orders')}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-3xl font-extrabold">{order.suppliers?.name}</h1>
        <Badge tone="primary">{t(`orders.statuses.${order.status}`)}</Badge>
      </div>
      <Card className="grid gap-3 sm:grid-cols-2">
        <Info label={t('orders.date')} value={formatDate(order.created_at)} />
        <Info label={t('orders.project')} value={project?.title ?? '—'} />
        <Info label={t('orders.subtotal')} value={formatMoney(order.subtotal)} />
        <Info label={t('suppliers.discount')} value={formatMoney(order.discount_total)} />
        <Info label={t('suppliers.delivery')} value={formatMoney(order.delivery_total)} />
        <Info label={t('suppliers.total')} value={formatMoney(order.grand_total)} />
      </Card>
      {order.notes ? (
        <Card>
          <p className="text-xs text-muted">{t('project.wizard.comment')}</p>
          <p className="font-semibold">{order.notes}</p>
        </Card>
      ) : null}
      <Card className="space-y-2">
        <h3 className="font-bold">{t('orders.materialItems')}</h3>
        {materials.length === 0 ? <p className="text-sm text-muted">—</p> : null}
        {materials.slice(0, 12).map((m) => (
          <div key={m.id} className="flex justify-between gap-3 text-sm">
            <span>{m.name}</span>
            <span>{formatMoney(m.total_price)}</span>
          </div>
        ))}
      </Card>
      <Card className="space-y-3">
        <p className="font-semibold">{t('orders.statusLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {ELECTRICIAN_ACTIONS.map((st) => (
            <Button
              key={st}
              size="sm"
              variant={order.status === st ? 'primary' : 'outline'}
              onClick={() => {
                updateOrderStatus(order.id, st)
                push(t('common.success'), 'success')
              }}
            >
              {t(`orders.statuses.${st}`)}
            </Button>
          ))}
        </div>
      </Card>
      <Card className="bg-primary-soft/50">
        <p className="text-sm text-muted">{t('orders.commissionNote')}</p>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}

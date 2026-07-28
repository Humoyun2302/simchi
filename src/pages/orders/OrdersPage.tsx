import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader, EmptyState } from '@/components/ui/logo'
import { Badge } from '@/components/ui/card'
import { useAppDataStore } from '@/stores/app-data-store'
import { formatMoney, formatDate } from '@/lib/utils'
import type { OrderStatus } from '@/types/database'

const tone: Record<OrderStatus, 'neutral' | 'success' | 'danger' | 'warning' | 'primary'> = {
  draft: 'neutral',
  sent: 'primary',
  confirmed_by_supplier: 'success',
  assembling: 'warning',
  ready_for_pickup: 'primary',
  in_delivery: 'primary',
  received: 'success',
  cancelled: 'danger',
  partially_returned: 'warning',
  returned: 'danger',
}

export function OrdersPage() {
  const { t } = useTranslation()
  const orders = useAppDataStore((s) => s.orders)

  return (
    <div className="space-y-5">
      <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')} />
      {orders.length === 0 ? (
        <EmptyState title={t('common.empty')} />
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="glass block rounded-[28px] p-5 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{o.suppliers?.name ?? o.supplier_id}</p>
                  <p className="text-sm text-muted">{formatDate(o.created_at)}</p>
                </div>
                <Badge tone={tone[o.status]}>{t(`orders.statuses.${o.status}`)}</Badge>
              </div>
              <p className="text-xl font-extrabold text-primary">{formatMoney(o.grand_total)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/ui/logo'
import { Badge } from '@/components/ui/card'
import { DEMO_SUPPLIERS } from '@/stores/app-data-store'
import { formatMoney } from '@/lib/utils'

export function SuppliersPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-5">
      <PageHeader title={t('suppliers.title')} subtitle={t('suppliers.subtitle')} />
      <div className="grid gap-4 md:grid-cols-2">
        {DEMO_SUPPLIERS.map((s) => (
          <Link key={s.id} to={`/suppliers/${s.id}`} className="glass block rounded-[28px] p-5 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold">{s.name}</h3>
              <Badge tone="success">★ {s.rating}</Badge>
            </div>
            <p className="text-sm text-muted">{s.city} · {s.address}</p>
            <p className="text-sm">{s.description}</p>
            <p className="text-sm text-muted">
              {t('suppliers.discount')}: {s.electrician_discount_percent}% · {t('suppliers.minOrder')} {formatMoney(s.min_order_amount)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

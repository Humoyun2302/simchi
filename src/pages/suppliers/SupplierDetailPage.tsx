import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, Badge } from '@/components/ui/card'
import { DEMO_SUPPLIERS } from '@/stores/app-data-store'
import { formatMoney } from '@/lib/utils'

export function SupplierDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const supplier = DEMO_SUPPLIERS.find((s) => s.id === id)
  if (!supplier) return <Card>{t('common.empty')}</Card>

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-extrabold">{supplier.name}</h1>
          <Badge tone="success">★ {supplier.rating}</Badge>
        </div>
        <p className="text-muted">{supplier.description}</p>
        <p>{supplier.city}, {supplier.address}</p>
        <p>{supplier.phone}</p>
        {supplier.telegram ? <p>{supplier.telegram}</p> : null}
        <p className="text-sm text-muted">{supplier.delivery_terms}</p>
        <p className="font-semibold">
          {t('suppliers.discount')}: {supplier.electrician_discount_percent}% · мин. заказ {formatMoney(supplier.min_order_amount)}
        </p>
      </Card>
    </div>
  )
}

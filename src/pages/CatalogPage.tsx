import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/ui/logo'
import { Card, Badge } from '@/components/ui/card'
import { formatMoney } from '@/lib/utils'
import { DEFAULT_RULES } from '@/features/calculation-engine'

const CATALOG = [
  { name: 'Кабель ВВГнг 3×2.5', category: 'cables', brand: 'CableTech', price: 18_500 },
  { name: 'Кабель ВВГнг 3×1.5', category: 'cables', brand: 'CableTech', price: 14_200 },
  { name: 'Розетка одинарная', category: 'sockets', brand: 'Schneider', price: 45_000 },
  { name: 'Розетка двойная', category: 'sockets', brand: 'Schneider', price: 62_000 },
  { name: 'Выключатель 1-кл', category: 'switches', brand: 'Legrand', price: 38_000 },
  { name: 'Подрозетник', category: 'mounting_boxes', brand: 'Hegel', price: 8_500 },
  { name: 'Гофра 20 мм', category: 'conduit', brand: 'DKS', price: 4_200 },
  { name: 'Кабель-канал 40×25', category: 'cable_channels', brand: 'IEK', price: 9_800 },
  { name: 'Щит 12 модулей', category: 'panels', brand: 'ABB', price: 280_000 },
  { name: 'Автомат 16A', category: 'modular_devices', brand: 'ABB', price: 65_000 },
  ...DEFAULT_RULES.slice(0, 10).map((r) => ({
    name: r.name,
    category: r.category,
    brand: 'SIMCHI Ref',
    price: r.unitPrice,
  })),
]

export function CatalogPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-5">
      <PageHeader title={t('catalog.title')} subtitle={t('catalog.subtitle')} />
      <div className="grid gap-3 md:grid-cols-2">
        {CATALOG.map((item, i) => (
          <Card key={`${item.name}-${i}`} className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold">{item.name}</p>
              <p className="text-sm text-muted">{item.brand}</p>
              <Badge tone="primary" className="mt-2">{item.category}</Badge>
            </div>
            <p className="font-extrabold text-primary">{formatMoney(item.price)}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

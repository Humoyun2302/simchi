import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/ui/logo'
import { Card, Badge } from '@/components/ui/card'
import { formatMoney } from '@/lib/utils'
import { translateCategory, translateMaterialName } from '@/lib/labels'
import { DEFAULT_RULES } from '@/features/calculation-engine'

const CATALOG = [
  { itemKey: 'cable_vvg_3x25', category: 'cables', brand: 'CableTech', price: 18_500 },
  { itemKey: 'cable_vvg_3x15', category: 'cables', brand: 'CableTech', price: 14_200 },
  { itemKey: 'socket_single', category: 'sockets', brand: 'Schneider', price: 45_000 },
  { itemKey: 'socket_double', category: 'sockets', brand: 'Schneider', price: 62_000 },
  { itemKey: 'switch_1k', category: 'switches', brand: 'Legrand', price: 38_000 },
  { itemKey: 'mounting_box', category: 'mounting_boxes', brand: 'Hegel', price: 8_500 },
  { itemKey: 'conduit_20', category: 'conduit', brand: 'DKS', price: 4_200 },
  { itemKey: 'cable_channel_40x25', category: 'cable_channels', brand: 'IEK', price: 9_800 },
  { itemKey: 'panel_12', category: 'panels', brand: 'ABB', price: 280_000 },
  { itemKey: 'breaker_16a', category: 'modular_devices', brand: 'ABB', price: 65_000 },
  ...DEFAULT_RULES.slice(0, 10).map((r) => ({
    itemKey: null as string | null,
    ruleId: r.id,
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
        {CATALOG.map((item, i) => {
          const displayName =
            'ruleId' in item && item.ruleId
              ? translateMaterialName(t, { name: item.name ?? '', ruleId: item.ruleId })
              : item.itemKey
                ? t(`catalog.items.${item.itemKey}`)
                : translateMaterialName(t, { name: (item as { name?: string }).name ?? '' })
          return (
            <Card key={`${item.itemKey ?? ('ruleId' in item ? item.ruleId : i)}-${i}`} className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{displayName}</p>
                <p className="text-sm text-muted">{item.brand}</p>
                <Badge tone="primary" className="mt-2">{translateCategory(t, item.category)}</Badge>
              </div>
              <p className="font-extrabold text-primary">{formatMoney(item.price)}</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

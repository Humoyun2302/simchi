import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DEMO_SUPPLIERS, useAppDataStore } from '@/stores/app-data-store'
import { useAuthStore } from '@/stores/auth-store'
import { formatMoney } from '@/lib/utils'
import { useToastStore } from '@/stores/toast-store'

export function ProjectSuppliersPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const project = useAppDataStore((s) => s.projects.find((p) => p.id === id))
  const createOrder = useAppDataStore((s) => s.createOrder)
  const updateProject = useAppDataStore((s) => s.updateProject)
  const profile = useAuthStore((s) => s.profile)
  const push = useToastStore((s) => s.push)
  const [sort, setSort] = useState<'total' | 'rating' | 'delivery'>('total')

  const offers = useMemo(() => {
    const base = project?.materials_total || 5_000_000
    return DEMO_SUPPLIERS.map((s, i) => {
      const missing = i === 2 ? 2 : i === 1 ? 1 : 0
      const delivery = s.city === 'Самарканд' ? 250_000 : 150_000 + i * 30_000
      const days = s.city === 'Самарканд' ? 3 : 1 + i
      const discount = Math.round(base * (s.electrician_discount_percent / 100))
      const goods = base - discount + missing * 120_000
      const total = goods + delivery
      return { supplier: s, missing, delivery, days, discount, goods, total }
    }).sort((a, b) => {
      if (sort === 'rating') return b.supplier.rating - a.supplier.rating
      if (sort === 'delivery') return a.days - b.days
      return a.total - b.total || a.missing - b.missing
    })
  }, [project, sort])

  return (
    <div className="space-y-5">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={() => navigate(`/projects/${id}`)}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>
      <h1 className="text-3xl font-extrabold">{t('suppliers.compare')}</h1>
      <div className="flex gap-2 overflow-x-auto">
        {[
          { v: 'total' as const, l: t('suppliers.total') },
          { v: 'rating' as const, l: t('suppliers.rating') },
          { v: 'delivery' as const, l: t('suppliers.delivery') },
        ].map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => setSort(o.v)}
            className={`min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-semibold ${sort === o.v ? 'bg-primary text-white' : 'bg-white/70 text-muted'}`}
          >
            {o.l}
          </button>
        ))}
      </div>
      {offers.map((o) => (
        <Card key={o.supplier.id} className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">{o.supplier.name}</h3>
              <p className="text-sm text-muted">{o.supplier.city} · ★ {o.supplier.rating}</p>
            </div>
            {o.missing > 0 ? <Badge tone="warning">{t('suppliers.missing')}: {o.missing}</Badge> : <Badge tone="success">{t('suppliers.inStock')}</Badge>}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>{t('suppliers.discount')}: {o.supplier.electrician_discount_percent}%</p>
            <p>{t('suppliers.delivery')}: {formatMoney(o.delivery)}</p>
            <p>{t('suppliers.deliveryTerm', { days: o.days })}</p>
            <p className="font-extrabold text-primary">{t('suppliers.total')}: {formatMoney(o.total)}</p>
          </div>
          <Button
            className="w-full"
            onClick={() => {
              if (!profile || !project) return
              const commission = Math.round((o.goods) * (o.supplier.platform_commission_percent / 100))
              createOrder({
                id: crypto.randomUUID(),
                electrician_id: profile.id,
                supplier_id: o.supplier.id,
                project_id: project.id,
                estimate_id: null,
                status: 'sent',
                subtotal: o.goods + o.discount,
                discount_total: o.discount,
                delivery_total: o.delivery,
                commission_total: commission,
                grand_total: o.total,
                notes: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                suppliers: o.supplier,
              })
              updateProject(project.id, { status: 'materials_ordered' })
              push(t('common.success'), 'success')
              navigate('/orders')
            }}
          >
            {t('suppliers.select')}
          </Button>
        </Card>
      ))}
    </div>
  )
}

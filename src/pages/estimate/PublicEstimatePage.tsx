import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/ui/logo'
import { Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAppDataStore } from '@/stores/app-data-store'
import { formatMoney } from '@/lib/utils'
import { exportEstimatePdf } from '@/features/estimates/export'
import { useToastStore } from '@/stores/toast-store'
import { EMPTY_LIST } from '@/lib/empty'

export function PublicEstimatePage() {
  const { token = '' } = useParams()
  const { t } = useTranslation()
  const estimate = useAppDataStore((s) => s.publicEstimates[token])
  const materials = useAppDataStore((s) =>
    estimate ? s.materials[estimate.projectId] ?? EMPTY_LIST : EMPTY_LIST,
  )
  const works = useAppDataStore((s) =>
    estimate ? s.works[estimate.projectId] ?? EMPTY_LIST : EMPTY_LIST,
  )
  const respond = useAppDataStore((s) => s.respondPublicEstimate)
  const push = useToastStore((s) => s.push)
  const [comment, setComment] = useState('')

  if (!estimate) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <Logo className="mb-6" />
        <Card>{t('common.empty')}</Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-8">
      <Logo />
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">{estimate.title}</h1>
            <p className="text-muted">{estimate.clientName}</p>
          </div>
          <Badge tone="primary">{t(`project.statuses.${estimate.status}`)}</Badge>
        </div>
        <p className="text-sm text-muted">{t('calc.materialsCost')}: {formatMoney(estimate.materialsTotal)}</p>
        <p className="text-sm text-muted">{t('calc.worksCost')}: {formatMoney(estimate.worksTotal)}</p>
        <p className="text-2xl font-extrabold text-primary">{formatMoney(estimate.grandTotal)}</p>
      </Card>
      <Card className="bg-warning/40">
        <p className="text-sm text-warning-text">{t('calc.disclaimer')}</p>
      </Card>
      <Card className="space-y-2">
        <h3 className="font-bold">{t('project.materials')}</h3>
        {materials.length === 0 ? <p className="text-sm text-muted">—</p> : null}
        {materials.map((m) => (
          <div key={m.id} className="flex justify-between text-sm">
            <span>{m.name}</span>
            <span>{formatMoney(m.total_price)}</span>
          </div>
        ))}
      </Card>
      <Card className="space-y-2">
        <h3 className="font-bold">{t('project.works')}</h3>
        {works.length === 0 ? <p className="text-sm text-muted">—</p> : null}
        {works.map((w) => (
          <div key={w.id} className="flex justify-between text-sm">
            <span>{w.name}</span>
            <span>{formatMoney(w.total_price)}</span>
          </div>
        ))}
      </Card>
      <Button
        variant="secondary"
        className="w-full"
        onClick={() =>
          exportEstimatePdf({
            title: estimate.title,
            clientName: estimate.clientName,
            address: '',
            status: estimate.status,
            materialsTotal: estimate.materialsTotal,
            worksTotal: estimate.worksTotal,
            deliveryTotal: 0,
            discountTotal: 0,
            grandTotal: estimate.grandTotal,
            createdAt: new Date().toISOString(),
            validUntil: new Date().toISOString(),
            rooms: [],
            materials: materials.map((m) => ({
              name: m.name,
              qty: m.manual_qty ?? m.calculated_qty,
              unit: m.unit,
              price: m.unit_price,
              total: m.total_price,
            })),
            works: works.map((w) => ({
              name: w.name,
              qty: w.quantity,
              price: w.unit_price,
              total: w.total_price,
            })),
            disclaimer: t('calc.disclaimer'),
          })
        }
      >
        {t('estimate.downloadPdf')}
      </Button>
      <Textarea label={t('estimate.leaveComment')} value={comment} onChange={(e) => setComment(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => {
            respond(token, 'rejected', comment)
            push(t('common.success'), 'success')
          }}
        >
          {t('estimate.reject')}
        </Button>
        <Button
          onClick={() => {
            respond(token, 'confirmed', comment)
            push(t('common.success'), 'success')
          }}
        >
          {t('estimate.confirm')}
        </Button>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppDataStore } from '@/stores/app-data-store'
import { formatMoney } from '@/lib/utils'
import { calculateProjectMaterials, explainLine } from '@/features/calculation-engine'
import { ConfirmDialog } from '@/components/ui/dialog'

export function ProjectMaterialsPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const project = useAppDataStore((s) => s.projects.find((p) => p.id === id))
  const rooms = useAppDataStore((s) => s.rooms[id] ?? [])
  const points = useAppDataStore((s) => s.points[id] ?? [])
  const materials = useAppDataStore((s) => s.materials[id])
  const setMaterials = useAppDataStore((s) => s.setMaterials)
  const updateProject = useAppDataStore((s) => s.updateProject)
  const [traceId, setTraceId] = useState<string | null>(null)

  const computed = useMemo(() => {
    if (materials?.length) return null
    return calculateProjectMaterials(
      rooms.map((r) => ({
        id: r.id,
        name: r.name,
        length_m: r.length_m,
        width_m: r.width_m,
        height_m: r.height_m,
        area_m2: r.area_m2,
        perimeter_m: r.perimeter_m,
      })),
      points.map((p) => ({
        id: p.id,
        roomId: p.room_id,
        deviceCode: 'socket_single',
        quantity: p.quantity,
        separateLine: p.separate_line,
      })),
      {
        distanceToPanel_m: project?.distance_to_panel_m ?? 10,
        panelsCount: project?.panels_count ?? 1,
        panelFloor: project?.panel_floor ?? 1,
        routingMethod: project?.routing_method ?? 'ceiling',
        sparePercent: project?.spare_percent ?? 10,
        complexityCoefficient: project?.complexity_coefficient ?? 1,
        worksBasePrice: project?.works_total ?? 0,
      },
    )
  }, [materials, rooms, points, project])

  const lines = materials ?? computed?.materials.map((m) => ({
    id: m.id,
    name: m.name,
    unit: m.unit,
    calculated_qty: m.quantity,
    manual_qty: null as number | null,
    unit_price: m.unitPrice,
    total_price: m.totalPrice,
    calculation_trace: m.trace as unknown as Record<string, unknown>,
  })) ?? []

  return (
    <div className="space-y-5">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={() => navigate(`/projects/${id}`)}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>
      <h1 className="text-3xl font-extrabold">{t('project.materials')}</h1>
      <Card className="bg-warning/40">
        <p className="text-sm text-warning-text">{t('calc.disclaimer')}</p>
      </Card>
      {lines.map((line) => (
        <Card key={line.id} className="space-y-2">
          <div className="flex justify-between gap-3">
            <div>
              <p className="font-bold">{line.name}</p>
              <p className="text-sm text-muted">
                {line.manual_qty ?? line.calculated_qty} {line.unit}
              </p>
            </div>
            <p className="font-extrabold text-primary">{formatMoney(line.total_price)}</p>
          </div>
          <Input
            label={t('calc.manualOverride')}
            type="number"
            value={line.manual_qty ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value)
              const next = lines.map((l) =>
                l.id === line.id
                  ? {
                      ...l,
                      manual_qty: val,
                      total_price: (val ?? l.calculated_qty) * l.unit_price,
                    }
                  : l,
              )
              setMaterials(
                id,
                next.map((n) => ({
                  id: n.id,
                  project_id: id,
                  name: n.name,
                  category: 'other',
                  brand: null,
                  model: null,
                  sku: null,
                  unit: n.unit,
                  calculated_qty: n.calculated_qty,
                  manual_qty: n.manual_qty,
                  spare_percent: 10,
                  unit_price: n.unit_price,
                  supplier_id: null,
                  total_price: n.total_price,
                  comment: null,
                  calculation_source: n.id,
                  calculation_trace: n.calculation_trace,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  deleted_at: null,
                })),
              )
              const total = next.reduce((s, n) => s + n.total_price, 0)
              if (project) updateProject(id, { materials_total: total, grand_total: total + project.works_total })
            }}
          />
          <Button variant="ghost" size="sm" onClick={() => setTraceId(line.id)}>
            {t('common.whyAdded')}
          </Button>
        </Card>
      ))}
      <ConfirmDialog
        open={Boolean(traceId)}
        title={t('common.whyAdded')}
        description={(() => {
          const line = computed?.materials.find((m) => m.id === traceId)
          if (!line) return ''
          const tr = explainLine(line)
          return `${t('calc.formula')}: ${tr.formula}\n${t('calc.beforeRound')}: ${tr.beforeRound}\n${t('calc.finalQty')}: ${tr.finalQty}`
        })()}
        confirmLabel="OK"
        cancelLabel={t('common.cancel')}
        onConfirm={() => setTraceId(null)}
        onCancel={() => setTraceId(null)}
      />
    </div>
  )
}

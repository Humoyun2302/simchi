import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppDataStore } from '@/stores/app-data-store'
import { formatMoney } from '@/lib/utils'
import { explainLine, type MaterialLine } from '@/features/calculation-engine'
import { calculateForProject } from '@/lib/project-recalc'
import { ConfirmDialog } from '@/components/ui/dialog'
import type { MaterialCategory, MaterialRequirement } from '@/types/database'
import { EMPTY_LIST } from '@/lib/empty'

type MaterialView = {
  id: string
  name: string
  unit: string
  calculated_qty: number
  manual_qty: number | null
  unit_price: number
  total_price: number
  calculation_trace: Record<string, unknown> | null
  calculation_source: string | null
  category: MaterialCategory
  spare_percent: number
}

export function ProjectMaterialsPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const project = useAppDataStore((s) => s.projects.find((p) => p.id === id))
  const rooms = useAppDataStore((s) => s.rooms[id] ?? EMPTY_LIST)
  const points = useAppDataStore((s) => s.points[id] ?? EMPTY_LIST)
  const materials = useAppDataStore((s) => s.materials[id])
  const setMaterials = useAppDataStore((s) => s.setMaterials)
  const updateProject = useAppDataStore((s) => s.updateProject)
  const recalculateProject = useAppDataStore((s) => s.recalculateProject)
  const [traceId, setTraceId] = useState<string | null>(null)

  const computed = useMemo(() => {
    if (!project) return null
    return calculateForProject(project, rooms, points)
  }, [project, rooms, points])

  const lines: MaterialView[] =
    materials && materials.length > 0
      ? materials.map((m) => ({
          id: m.id,
          name: m.name,
          unit: m.unit,
          calculated_qty: m.calculated_qty,
          manual_qty: m.manual_qty,
          unit_price: m.unit_price,
          total_price: m.total_price,
          calculation_trace: m.calculation_trace,
          calculation_source: m.calculation_source,
          category: m.category,
          spare_percent: m.spare_percent,
        }))
      : computed?.materials.map((m) => ({
          id: m.id,
          name: m.name,
          unit: m.unit,
          calculated_qty: m.quantity,
          manual_qty: null,
          unit_price: m.unitPrice,
          total_price: m.totalPrice,
          calculation_trace: m.trace as unknown as Record<string, unknown>,
          calculation_source: m.ruleId,
          category: m.category as MaterialCategory,
          spare_percent: m.sparePercent,
        })) ?? []

  const traceLine = useMemo((): MaterialLine | null => {
    if (!traceId || !computed) return null
    return computed.materials.find((m) => m.id === traceId || m.ruleId === traceId) ?? null
  }, [traceId, computed])

  const persistLines = (next: MaterialView[]) => {
    const items: MaterialRequirement[] = next.map((n) => ({
      id: n.id,
      project_id: id,
      name: n.name,
      category: n.category,
      brand: null,
      model: null,
      sku: null,
      unit: n.unit,
      calculated_qty: n.calculated_qty,
      manual_qty: n.manual_qty,
      spare_percent: n.spare_percent,
      unit_price: n.unit_price,
      supplier_id: null,
      total_price: n.total_price,
      comment: null,
      calculation_source: n.calculation_source,
      calculation_trace: n.calculation_trace,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    }))
    setMaterials(id, items)
    const total = next.reduce((s, n) => s + n.total_price, 0)
    if (project) updateProject(id, { materials_total: total, grand_total: total + project.works_total })
  }

  return (
    <div className="space-y-5">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={() => navigate(`/projects/${id}`)}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-3xl font-extrabold">{t('project.materials')}</h1>
        <Button variant="outline" size="sm" onClick={() => recalculateProject(id)}>
          <RefreshCw size={16} />
          Пересчитать
        </Button>
      </div>
      <Card className="bg-warning/40">
        <p className="text-sm text-warning-text">{t('calc.disclaimer')}</p>
      </Card>
      {lines.length === 0 ? <Card><p className="text-muted">{t('common.empty')}</p></Card> : null}
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
              persistLines(
                lines.map((l) =>
                  l.id === line.id
                    ? {
                        ...l,
                        manual_qty: val,
                        total_price: (val ?? l.calculated_qty) * l.unit_price,
                      }
                    : l,
                ),
              )
            }}
          />
          <Button variant="ghost" size="sm" onClick={() => setTraceId(line.calculation_source ?? line.id)}>
            {t('common.whyAdded')}
          </Button>
        </Card>
      ))}
      <ConfirmDialog
        open={Boolean(traceId)}
        title={t('common.whyAdded')}
        description={(() => {
          if (!traceLine) {
            const stored = lines.find((l) => l.id === traceId || l.calculation_source === traceId)
            const tr = stored?.calculation_trace as { formula?: string; beforeRound?: number; finalQty?: number } | null
            if (!tr) return 'Нет данных расчёта для этой позиции'
            return `${t('calc.formula')}: ${tr.formula ?? '—'}\n${t('calc.beforeRound')}: ${tr.beforeRound ?? '—'}\n${t('calc.finalQty')}: ${tr.finalQty ?? '—'}`
          }
          const tr = explainLine(traceLine)
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

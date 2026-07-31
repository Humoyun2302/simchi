import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IntegerInput } from '@/components/ui/numeric-input'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { useAppDataStore } from '@/stores/app-data-store'
import { formatMoney, formatUnit } from '@/lib/utils'
import { type MaterialLine } from '@/features/calculation-engine'
import { formatMaterialExplanation } from '@/features/calculation-engine/explain-human'
import { ExplanationContent } from '@/features/calculation-engine/ExplanationContent'
import { calculateForProject } from '@/lib/project-recalc'
import { translateMaterialName, translateWarning } from '@/lib/labels'
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
  warning?: string | null
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
  const [editingId, setEditingId] = useState<string | null>(null)

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
          warning: null,
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
          warning: m.warning ?? null,
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

  const explanation = formatMaterialExplanation(
    traceLine ??
      (() => {
        const stored = lines.find((l) => l.id === traceId || l.calculation_source === traceId)
        if (!stored?.calculation_trace) return null
        return {
          id: stored.id,
          name: stored.name,
          category: stored.category,
          unit: stored.unit,
          quantity: stored.manual_qty ?? stored.calculated_qty,
          quantityBeforeRound: stored.calculated_qty,
          unitPrice: stored.unit_price,
          totalPrice: stored.total_price,
          sparePercent: stored.spare_percent,
          coefficient: 1,
          formula: '',
          ruleId: stored.calculation_source ?? stored.id,
          trace: stored.calculation_trace as unknown as MaterialLine['trace'],
        } satisfies MaterialLine
      })(),
  )

  const materialsTotal = lines.reduce((s, l) => s + l.total_price, 0)

  return (
    <div className="space-y-4 pb-8">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={() => navigate(`/projects/${id}`)}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-3xl font-extrabold">{t('project.materials')}</h1>
        <Button variant="outline" size="sm" onClick={() => recalculateProject(id)}>
          <RefreshCw size={16} />
          {t('estimate.recalculate')}
        </Button>
      </div>
      <Card className="bg-warning/40">
        <p className="text-sm text-warning-text">{t('calc.disclaimer')}</p>
      </Card>

      <Card className="space-y-1">
        <p className="text-xs text-muted">{t('calc.materialsCost')}</p>
        <p className="text-2xl font-extrabold text-primary">{formatMoney(materialsTotal)}</p>
      </Card>

      {lines.length === 0 ? <Card><p className="text-muted">{t('common.empty')}</p></Card> : null}

      {lines.length > 0 ? (
        <Card className="overflow-hidden !p-0">
          <ul className="divide-y divide-black/5">
            {lines.map((line) => (
              <li key={line.id} className="px-4 py-3">
                <p className="break-words font-bold leading-snug text-text">
                  {translateMaterialName(t, {
                    name: line.name,
                    calculationSource: line.calculation_source,
                  })}
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <p className="text-sm text-muted">
                    {line.manual_qty ?? line.calculated_qty} {formatUnit(line.unit)}
                  </p>
                  <p className="shrink-0 text-sm font-semibold text-muted">{formatMoney(line.total_price)}</p>
                </div>
                {line.warning ? (
                  <p className="mt-1 text-xs text-warning-text">{translateWarning(t, line.warning)}</p>
                ) : null}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary"
                    onClick={() => setTraceId(line.calculation_source ?? line.id)}
                  >
                    {t('common.whyAdded')}
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-muted"
                    onClick={() => setEditingId(editingId === line.id ? null : line.id)}
                  >
                    {t('common.edit')}
                  </button>
                </div>
                {editingId === line.id ? (
                  <div className="mt-2">
                    <IntegerInput
                      label={t('calc.manualOverride')}
                      value={line.manual_qty}
                      onValueChange={(val) => {
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
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <BottomSheet open={Boolean(traceId)} title={explanation.title} onClose={() => setTraceId(null)}>
        <ExplanationContent explanation={explanation} />
      </BottomSheet>
    </div>
  )
}

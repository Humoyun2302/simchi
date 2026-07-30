import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IntegerInput } from '@/components/ui/numeric-input'
import { useAppDataStore } from '@/stores/app-data-store'
import { formatMoney } from '@/lib/utils'
import { useState } from 'react'
import type { ProjectWorkItem } from '@/types/database'
import { EMPTY_LIST } from '@/lib/empty'

const DEFAULT_WORKS = [
  { work_type: 'socket_install', name: 'Установка розетки', unit_price: 85_000 },
  { work_type: 'switch_install', name: 'Установка выключателя', unit_price: 75_000 },
  { work_type: 'light_install', name: 'Установка светильника', unit_price: 95_000 },
  { work_type: 'cable_laying', name: 'Прокладка кабеля', unit_price: 12_000 },
  { work_type: 'panel_assembly', name: 'Сборка щита', unit_price: 450_000 },
]

export function ProjectWorksPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const project = useAppDataStore((s) => s.projects.find((p) => p.id === id))
  const works = useAppDataStore((s) => s.works[id] ?? EMPTY_LIST)
  const setWorks = useAppDataStore((s) => s.setWorks)
  const updateProject = useAppDataStore((s) => s.updateProject)
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number | null>(100_000)

  const upsert = (items: ProjectWorkItem[]) => {
    setWorks(id, items)
    const total = items.reduce((s, w) => s + w.total_price, 0)
    if (project) updateProject(id, { works_total: total, grand_total: project.materials_total + total })
  }

  const seedDefaults = () => {
    const complexity = project?.complexity_coefficient ?? 1
    const items: ProjectWorkItem[] = DEFAULT_WORKS.map((w) => ({
      id: crypto.randomUUID(),
      project_id: id,
      work_price_item_id: null,
      name: w.name,
      work_type: w.work_type,
      quantity: 1,
      unit_price: w.unit_price,
      complexity_coefficient: complexity,
      discount_percent: 0,
      total_price: Math.round(w.unit_price * complexity),
      comment: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    }))
    upsert(items)
  }

  return (
    <div className="space-y-5">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={() => navigate(`/projects/${id}`)}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>
      <h1 className="text-3xl font-extrabold">{t('project.works')}</h1>
      {works.length === 0 ? (
        <Button variant="secondary" className="w-full" onClick={seedDefaults}>
          Заполнить типовыми работами
        </Button>
      ) : null}
      {works.map((work) => (
        <Card key={work.id} className="space-y-3">
          <div className="flex justify-between gap-2">
            <p className="font-bold">{work.name}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => upsert(works.filter((w) => w.id !== work.id))}
            >
              <Trash2 size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <IntegerInput
              label={t('project.wizard.quantity')}
              value={work.quantity}
              onValueChange={(quantity) => {
                const q = quantity ?? 0
                upsert(
                  works.map((w) =>
                    w.id === work.id
                      ? {
                          ...w,
                          quantity: q,
                          total_price: Math.round(
                            q * w.unit_price * w.complexity_coefficient * (1 - w.discount_percent / 100),
                          ),
                        }
                      : w,
                  ),
                )
              }}
            />
            <IntegerInput
              label="Цена"
              value={work.unit_price}
              onValueChange={(unit_price) => {
                const priceVal = unit_price ?? 0
                upsert(
                  works.map((w) =>
                    w.id === work.id
                      ? {
                          ...w,
                          unit_price: priceVal,
                          total_price: Math.round(
                            w.quantity * priceVal * w.complexity_coefficient * (1 - w.discount_percent / 100),
                          ),
                        }
                      : w,
                  ),
                )
              }}
            />
          </div>
          <p className="font-extrabold text-primary">{formatMoney(work.total_price)}</p>
        </Card>
      ))}
      <Card className="space-y-3">
        <Input label="Своя работа" value={name} onChange={(e) => setName(e.target.value)} />
        <IntegerInput label="Цена" value={price} onValueChange={setPrice} />
        <Button
          className="w-full"
          onClick={() => {
            const complexity = project?.complexity_coefficient ?? 1
            const unit = price ?? 0
            upsert([
              ...works,
              {
                id: crypto.randomUUID(),
                project_id: id,
                work_price_item_id: null,
                name: name || 'Другая работа',
                work_type: 'custom',
                quantity: 1,
                unit_price: unit,
                complexity_coefficient: complexity,
                discount_percent: 0,
                total_price: Math.round(unit * complexity),
                comment: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
              },
            ])
            setName('')
          }}
        >
          <Plus size={18} />
          {t('common.add')}
        </Button>
      </Card>
    </div>
  )
}

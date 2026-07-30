import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Loader2, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { IntegerInput, DecimalInput } from '@/components/ui/numeric-input'
import { UzbekPhoneInput } from '@/components/ui/uzbek-phone-input'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { ConfirmDialog } from '@/components/ui/dialog'
import { useAppDataStore, toCalcParams, type WizardDraft } from '@/stores/app-data-store'
import { useAuthStore } from '@/stores/auth-store'
import { useToastStore } from '@/stores/toast-store'
import { DEVICE_TYPES, calculateProjectMaterials } from '@/features/calculation-engine'
import {
  formatMaterialExplanation,
} from '@/features/calculation-engine/explain-human'
import { ExplanationContent } from '@/features/calculation-engine/ExplanationContent'
import { formatMoney, calcArea, calcPerimeter } from '@/lib/utils'
import { isValidUzbekPhone, normalizeUzbekPhone } from '@/lib/phone'
import type { ObjectType, RoomType, WiringType, WorkKind, RoutingMethod } from '@/types/database'

const STEPS = 6

const phoneError = 'Введите полный номер телефона'
const floorsRequired = 'Укажите количество этажей'
const floorsMin = 'Количество этажей должно быть не меньше 1'
const heightInvalid = 'Введите корректную высоту установки'

export function ProjectWizardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const wizard = useAppDataStore((s) => s.wizard)
  const setWizard = useAppDataStore((s) => s.setWizard)
  const clients = useAppDataStore((s) => s.clients)
  const saveWizardProject = useAppDataStore((s) => s.saveWizardProject)
  const restoreWizardDraft = useAppDataStore((s) => s.restoreWizardDraft)
  const profile = useAuthStore((s) => s.profile)
  const push = useToastStore((s) => s.push)
  const [traceId, setTraceId] = useState<string | null>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    void restoreWizardDraft()
  }, [restoreWizardDraft])

  const step = wizard.step
  const titles = [
    t('project.wizard.stepClient'),
    t('project.wizard.stepObject'),
    t('project.wizard.stepRooms'),
    t('project.wizard.stepPoints'),
    t('project.wizard.stepParams'),
    t('project.wizard.stepResult'),
  ]

  const calc = useMemoCalc(wizard)
  const explainedLine = calc.materials.find((m) => m.id === traceId)
  const explanation = formatMaterialExplanation(explainedLine)

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })

  const validateWizard = (w: WizardDraft, s: number): Record<string, string> => {
    const nextErrors: Record<string, string> = {}

    if (s === 0 && w.clientMode === 'new') {
      if (!w.client.full_name.trim()) nextErrors.full_name = t('common.required')
      if (!isValidUzbekPhone(w.client.phone)) nextErrors.phone = phoneError
    }
    if (s === 0 && w.clientMode === 'existing' && !w.clientId) {
      nextErrors.clientId = t('common.required')
    }

    if (s === 1) {
      if (!w.project.title.trim() && !w.project.address.trim()) {
        nextErrors.title = t('common.required')
      }
      if (w.project.floors_count == null) {
        nextErrors.floors_count = floorsRequired
      } else if (w.project.floors_count < 1) {
        nextErrors.floors_count = floorsMin
      } else if (w.project.floors_count > 100) {
        nextErrors.floors_count = 'Количество этажей должно быть не больше 100'
      }
    }

    if (s === 2 && w.rooms.length === 0) {
      nextErrors.rooms = t('common.required')
    }

    if (s === 3) {
      if (w.points.length === 0) nextErrors.points = t('common.required')
      w.points.forEach((p) => {
        if (p.install_height_m != null && (Number.isNaN(p.install_height_m) || p.install_height_m < 0)) {
          nextErrors[`height_${p.id}`] = heightInvalid
        }
        if (p.quantity == null || p.quantity < 1) {
          nextErrors[`qty_${p.id}`] = t('common.required')
        }
      })
    }

    return nextErrors
  }

  const afterCommit = (fn: () => void) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    // Allow IntegerInput/DecimalInput/phone onBlur commits to flush into the store
    window.setTimeout(fn, 0)
  }

  const next = () => {
    afterCommit(() => {
      const w = useAppDataStore.getState().wizard
      const nextErrors = validateWizard(w, step)
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        push('Заполните обязательные поля шага', 'error')
        return
      }
      if (step === 0 && w.clientMode === 'new') {
        const e164 = normalizeUzbekPhone(w.client.phone)
        if (e164) setWizard({ client: { ...w.client, phone: e164 } })
      }
      setWizard({ step: Math.min(STEPS - 1, step + 1) })
    })
  }

  const back = () => {
    if (step === 0) {
      setLeaveOpen(true)
      return
    }
    setErrors({})
    setWizard({ step: step - 1 })
  }

  const finish = async () => {
    if (!profile || saving) return
    afterCommit(() => {
      void (async () => {
        const w = useAppDataStore.getState().wizard
        const clientErrors = validateWizard(w, 0)
        if (Object.keys(clientErrors).length > 0) {
          setErrors(clientErrors)
          setWizard({ step: 0 })
          push('Укажите клиента', 'error')
          return
        }
        const objectErrors = validateWizard(w, 1)
        if (Object.keys(objectErrors).length > 0) {
          setErrors(objectErrors)
          setWizard({ step: 1 })
          return
        }
        if (w.rooms.length === 0) {
          push('Добавьте хотя бы одно помещение', 'error')
          setWizard({ step: 2 })
          return
        }
        setSaving(true)
        try {
          if (w.clientMode === 'new') {
            const e164 = normalizeUzbekPhone(w.client.phone)
            if (e164) setWizard({ client: { ...w.client, phone: e164 } })
          }
          const id = await saveWizardProject(profile.id)
          push(t('common.success'), 'success')
          navigate(`/projects/${id}`)
        } catch (e) {
          push(e instanceof Error ? e.message : t('common.error'), 'error')
        } finally {
          setSaving(false)
        }
      })()
    })
  }

  const canSave =
    !saving &&
    (wizard.clientMode === 'existing'
      ? Boolean(wizard.clientId)
      : Boolean(wizard.client.full_name.trim()) && isValidUzbekPhone(wizard.client.phone)) &&
    wizard.project.floors_count != null &&
    wizard.project.floors_count >= 1 &&
    wizard.project.floors_count <= 100

  return (
    <div className="flex min-h-0 flex-col">
      <div className="space-y-4 pb-28 sm:space-y-5">
        <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={back}>
          <ArrowLeft size={16} />
          {t('common.back')}
        </button>

        <div>
          <p className="text-sm font-semibold text-primary">
            {step + 1} / {STEPS}
          </p>
          <h1 className="text-[1.6rem] font-extrabold leading-tight sm:text-3xl">{titles[step]}</h1>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/70">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((step + 1) / STEPS) * 100}%` }} />
          </div>
        </div>

        {step === 0 && (
          <Card className="space-y-4">
            <div className="flex gap-2">
              <Button variant={wizard.clientMode === 'existing' ? 'primary' : 'outline'} className="h-12 flex-1" onClick={() => setWizard({ clientMode: 'existing' })}>
                {t('project.wizard.existingClient')}
              </Button>
              <Button variant={wizard.clientMode === 'new' ? 'primary' : 'outline'} className="h-12 flex-1" onClick={() => setWizard({ clientMode: 'new' })}>
                {t('project.wizard.newClient')}
              </Button>
            </div>
            {wizard.clientMode === 'existing' ? (
              <Select
                label={t('project.client')}
                value={wizard.clientId ?? ''}
                error={errors.clientId}
                onChange={(e) => {
                  clearError('clientId')
                  const c = clients.find((x) => x.id === e.target.value)
                  setWizard({
                    clientId: e.target.value,
                    client: c
                      ? { full_name: c.full_name, phone: c.phone, telegram: c.telegram ?? '', comment: c.comment ?? '' }
                      : wizard.client,
                  })
                }}
              >
                <option value="">—</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </Select>
            ) : (
              <>
                <Input
                  label={t('auth.fullName')}
                  value={wizard.client.full_name}
                  error={errors.full_name}
                  onChange={(e) => {
                    clearError('full_name')
                    setWizard({ client: { ...wizard.client, full_name: e.target.value } })
                  }}
                />
                <UzbekPhoneInput
                  label={t('auth.phone')}
                  value={wizard.client.phone}
                  error={errors.phone}
                  onValueChange={(phone) => {
                    clearError('phone')
                    setWizard({ client: { ...wizard.client, phone } })
                  }}
                />
                <Input label={t('project.wizard.telegram')} value={wizard.client.telegram} onChange={(e) => setWizard({ client: { ...wizard.client, telegram: e.target.value } })} />
                <Textarea label={t('project.wizard.comment')} value={wizard.client.comment} onChange={(e) => setWizard({ client: { ...wizard.client, comment: e.target.value } })} />
              </>
            )}
          </Card>
        )}

        {step === 1 && (
          <Card className="space-y-4">
            <Input label={t('project.wizard.projectName')} value={wizard.project.title} error={errors.title} onChange={(e) => { clearError('title'); setWizard({ project: { ...wizard.project, title: e.target.value } }) }} />
            <Input label={t('project.address')} value={wizard.project.address} onChange={(e) => setWizard({ project: { ...wizard.project, address: e.target.value } })} />
            <Input label={t('auth.city')} value={wizard.project.city} onChange={(e) => setWizard({ project: { ...wizard.project, city: e.target.value } })} />
            <Select label={t('project.objectType')} value={wizard.project.object_type} onChange={(e) => setWizard({ project: { ...wizard.project, object_type: e.target.value as ObjectType } })}>
              {(['apartment', 'private_house', 'office', 'shop', 'restaurant', 'other'] as const).map((k) => (
                <option key={k} value={k}>{t(`project.objectTypes.${k}`)}</option>
              ))}
            </Select>
            <Select label={t('project.wizard.workKind')} value={wizard.project.work_kind} onChange={(e) => setWizard({ project: { ...wizard.project, work_kind: e.target.value as WorkKind } })}>
              <option value="new">{t('project.workKinds.new')}</option>
              <option value="renovation">{t('project.workKinds.renovation')}</option>
            </Select>
            <IntegerInput
              label={t('project.wizard.floors')}
              value={wizard.project.floors_count}
              error={errors.floors_count}
              onValueChange={(floors_count) => {
                clearError('floors_count')
                setWizard({ project: { ...wizard.project, floors_count } })
              }}
            />
            <Select label={t('project.wizard.wiring')} value={wizard.project.wiring_type} onChange={(e) => setWizard({ project: { ...wizard.project, wiring_type: e.target.value as WiringType } })}>
              {(['hidden', 'open', 'combined'] as const).map((k) => (
                <option key={k} value={k}>{t(`project.wiringTypes.${k}`)}</option>
              ))}
            </Select>
            <Textarea label={t('project.wizard.note')} value={wizard.project.note} onChange={(e) => setWizard({ project: { ...wizard.project, note: e.target.value } })} />
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {wizard.rooms.map((room, idx) => (
              <Card key={room.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{room.name || `${t('project.rooms')} ${idx + 1}`}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setWizard({ rooms: wizard.rooms.filter((r) => r.id !== room.id) })}>
                    <Trash2 size={16} />
                  </Button>
                </div>
                <Input label={t('common.create')} value={room.name} onChange={(e) => updateRoom(setWizard, wizard, room.id, { name: e.target.value })} />
                <Select label={t('project.objectType')} value={room.room_type} onChange={(e) => updateRoom(setWizard, wizard, room.id, { room_type: e.target.value as RoomType })}>
                  {(['kitchen', 'bedroom', 'living_room', 'bathroom', 'hallway', 'office', 'technical', 'other'] as const).map((k) => (
                    <option key={k} value={k}>{t(`project.roomTypes.${k}`)}</option>
                  ))}
                </Select>
                <div className="grid grid-cols-3 gap-2">
                  <DecimalInput label={t('project.wizard.length')} value={room.length_m} onValueChange={(length_m) => updateRoom(setWizard, wizard, room.id, { length_m })} />
                  <DecimalInput label={t('project.wizard.width')} value={room.width_m} onValueChange={(width_m) => updateRoom(setWizard, wizard, room.id, { width_m })} />
                  <DecimalInput label={t('project.wizard.height')} value={room.height_m} onValueChange={(height_m) => updateRoom(setWizard, wizard, room.id, { height_m })} />
                </div>
                <p className="text-sm text-muted">
                  {t('project.wizard.area')}: {calcArea(room.length_m ?? 0, room.width_m ?? 0)} м² · {t('project.wizard.perimeter')}: {calcPerimeter(room.length_m ?? 0, room.width_m ?? 0)} м
                </p>
                <Input label={t('project.wizard.wallMaterial')} value={room.wall_material} onChange={(e) => updateRoom(setWizard, wizard, room.id, { wall_material: e.target.value })} />
                <Input label={t('project.wizard.ceilingMaterial')} value={room.ceiling_material} onChange={(e) => updateRoom(setWizard, wizard, room.id, { ceiling_material: e.target.value })} />
              </Card>
            ))}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() =>
                setWizard({
                  rooms: [
                    ...wizard.rooms,
                    {
                      id: crypto.randomUUID(),
                      name: t('project.roomTypes.other'),
                      room_type: 'other',
                      length_m: 3,
                      width_m: 3,
                      height_m: 2.7,
                      wall_material: '',
                      ceiling_material: '',
                      comment: '',
                    },
                  ],
                })
              }
            >
              <Plus size={18} />
              {t('project.wizard.addRoom')}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {wizard.rooms.length === 0 ? (
              <Card><p className="text-muted">{t('common.empty')}</p></Card>
            ) : (
              wizard.points.map((point) => (
                <Card key={point.id} className="space-y-3">
                  <div className="flex justify-between">
                    <h3 className="font-bold">{DEVICE_TYPES.find((d) => d.code === point.deviceCode)?.nameRu}</h3>
                    <Button variant="ghost" size="icon" onClick={() => setWizard({ points: wizard.points.filter((p) => p.id !== point.id) })}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <Select label={t('project.rooms')} value={point.roomId} onChange={(e) => updatePoint(setWizard, wizard, point.id, { roomId: e.target.value })}>
                    {wizard.rooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </Select>
                  <Select label={t('project.wizard.addPoint')} value={point.deviceCode} onChange={(e) => updatePoint(setWizard, wizard, point.id, { deviceCode: e.target.value })}>
                    {DEVICE_TYPES.map((d) => (
                      <option key={d.code} value={d.code}>{d.nameRu}</option>
                    ))}
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <IntegerInput
                      label={t('project.wizard.quantity')}
                      value={point.quantity}
                      error={errors[`qty_${point.id}`]}
                      onValueChange={(quantity) => {
                        clearError(`qty_${point.id}`)
                        updatePoint(setWizard, wizard, point.id, { quantity })
                      }}
                    />
                    <DecimalInput
                      label={t('project.wizard.installHeight')}
                      value={point.install_height_m}
                      error={errors[`height_${point.id}`]}
                      onValueChange={(install_height_m) => {
                        clearError(`height_${point.id}`)
                        updatePoint(setWizard, wizard, point.id, { install_height_m })
                      }}
                    />
                  </div>
                  <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={point.separate_line} onChange={(e) => updatePoint(setWizard, wizard, point.id, { separate_line: e.target.checked })} />
                    {t('project.wizard.separateLine')}
                  </label>
                </Card>
              ))
            )}
            <Button
              variant="secondary"
              className="w-full"
              disabled={!wizard.rooms[0]}
              onClick={() =>
                setWizard({
                  points: [
                    ...wizard.points,
                    {
                      id: crypto.randomUUID(),
                      roomId: wizard.rooms[0]?.id ?? '',
                      deviceCode: 'socket_single',
                      quantity: 1,
                      install_height_m: 0.3,
                      separate_line: false,
                      comment: '',
                      custom_power_w: null,
                    },
                  ],
                })
              }
            >
              <Plus size={18} />
              {t('project.wizard.addPoint')}
            </Button>
          </div>
        )}

        {step === 4 && (
          <Card className="space-y-4">
            <DecimalInput label={t('project.wizard.distanceToPanel')} value={wizard.params.distanceToPanel_m} onValueChange={(distanceToPanel_m) => setWizard({ params: { ...wizard.params, distanceToPanel_m } })} />
            <IntegerInput label={t('project.wizard.panelsCount')} value={wizard.params.panelsCount} onValueChange={(panelsCount) => setWizard({ params: { ...wizard.params, panelsCount } })} />
            <IntegerInput label={t('project.wizard.panelFloor')} value={wizard.params.panelFloor} onValueChange={(panelFloor) => setWizard({ params: { ...wizard.params, panelFloor } })} />
            <Select label={t('project.wizard.routing')} value={wizard.params.routingMethod} onChange={(e) => setWizard({ params: { ...wizard.params, routingMethod: e.target.value as RoutingMethod } })}>
              {(['ceiling', 'wall', 'floor', 'cable_channel'] as const).map((k) => (
                <option key={k} value={k}>{t(`project.routingMethods.${k}`)}</option>
              ))}
            </Select>
            <IntegerInput label={t('project.wizard.sparePercent')} value={wizard.params.sparePercent} onValueChange={(sparePercent) => setWizard({ params: { ...wizard.params, sparePercent } })} />
            <DecimalInput label={t('project.wizard.complexity')} value={wizard.params.complexityCoefficient} onValueChange={(complexityCoefficient) => setWizard({ params: { ...wizard.params, complexityCoefficient } })} />
            <IntegerInput label={t('project.wizard.worksPrice')} value={wizard.params.worksBasePrice} onValueChange={(worksBasePrice) => setWizard({ params: { ...wizard.params, worksBasePrice } })} />
          </Card>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <Card className="space-y-2 bg-warning/40">
              <p className="text-sm font-medium text-warning-text">{t('calc.disclaimer')}</p>
            </Card>

            <Card className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Stat label={t('calc.points')} value={String(calc.pointsCount)} />
                <Stat label={t('calc.materialsQty')} value={String(calc.materials.length)} />
                <Stat label={t('calc.materialsCost')} value={formatMoney(calc.materialsTotal)} />
                <Stat label={t('calc.worksCost')} value={formatMoney(calc.worksTotal)} />
              </div>
              <div className="border-t border-white/70 pt-3">
                <Stat label={t('calc.grandTotal')} value={formatMoney(calc.grandTotal)} />
              </div>
            </Card>

            <Card className="overflow-hidden !p-0">
              <div className="border-b border-black/5 px-4 py-3">
                <h3 className="font-bold">{t('calc.materialsPreview')}</h3>
              </div>
              <ul className="divide-y divide-black/5">
                {calc.materials.map((m) => (
                  <li key={m.id} className="px-4 py-3">
                    <p className="font-bold leading-snug text-text break-words">{m.name}</p>
                    <div className="mt-1 flex items-baseline justify-between gap-3">
                      <p className="text-sm text-muted">
                        {m.quantity} {m.unit}
                      </p>
                      <p className="shrink-0 text-sm font-semibold text-muted">{formatMoney(m.totalPrice)}</p>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <button
                        type="button"
                        className="text-xs font-semibold text-primary"
                        onClick={() => setTraceId(m.id)}
                      >
                        {t('common.whyAdded')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </div>

      <div className="sticky-actions flex gap-3">
        <Button variant="outline" className="min-h-14 flex-1" onClick={back} disabled={saving}>
          <ArrowLeft size={16} />
          {t('common.back')}
        </Button>
        {step < STEPS - 1 ? (
          <Button className="min-h-14 flex-[1.4]" onClick={next}>
            {t('common.next')}
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button className="min-h-14 flex-[1.4]" disabled={!canSave} onClick={() => void finish()}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : null}
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        )}
      </div>

      <BottomSheet open={Boolean(traceId)} title={explanation.title} onClose={() => setTraceId(null)}>
        <ExplanationContent explanation={explanation} />
      </BottomSheet>

      <ConfirmDialog
        open={leaveOpen}
        title="Выйти из мастера?"
        description="Черновик сохранён локально"
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => navigate('/')}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-lg font-extrabold break-words">{value}</p>
    </div>
  )
}

function updateRoom(
  setWizard: (p: Partial<WizardDraft> | ((w: WizardDraft) => WizardDraft)) => void,
  wizard: WizardDraft,
  id: string,
  patch: Partial<WizardDraft['rooms'][number]>,
) {
  setWizard({ rooms: wizard.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) })
}

function updatePoint(
  setWizard: (p: Partial<WizardDraft> | ((w: WizardDraft) => WizardDraft)) => void,
  wizard: WizardDraft,
  id: string,
  patch: Partial<WizardDraft['points'][number]>,
) {
  setWizard({ points: wizard.points.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
}

function useMemoCalc(wizard: WizardDraft) {
  return useMemo(
    () =>
      calculateProjectMaterials(
        wizard.rooms.map((r) => {
          const length_m = r.length_m ?? 0
          const width_m = r.width_m ?? 0
          const height_m = r.height_m ?? 0
          return {
            id: r.id,
            name: r.name,
            length_m,
            width_m,
            height_m,
            area_m2: calcArea(length_m, width_m),
            perimeter_m: calcPerimeter(length_m, width_m),
          }
        }),
        wizard.points.map((p) => ({
          id: p.id,
          roomId: p.roomId,
          deviceCode: p.deviceCode,
          quantity: p.quantity ?? 1,
          separateLine: p.separate_line,
          installHeight_m: p.install_height_m,
          customPower_w: p.custom_power_w,
        })),
        toCalcParams(wizard.params),
      ),
    [wizard.rooms, wizard.points, wizard.params],
  )
}

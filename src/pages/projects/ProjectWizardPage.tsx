import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAppDataStore, type WizardDraft } from '@/stores/app-data-store'
import { useAuthStore } from '@/stores/auth-store'
import { useToastStore } from '@/stores/toast-store'
import { DEVICE_TYPES, calculateProjectMaterials, explainLine } from '@/features/calculation-engine'
import { ConfirmDialog } from '@/components/ui/dialog'
import { formatMoney } from '@/lib/utils'
import { calcArea, calcPerimeter } from '@/lib/utils'
import type { ObjectType, RoomType, WiringType, WorkKind, RoutingMethod } from '@/types/database'

const STEPS = 6

export function ProjectWizardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const wizard = useAppDataStore((s) => s.wizard)
  const setWizard = useAppDataStore((s) => s.setWizard)
  const clients = useAppDataStore((s) => s.clients)
  const saveWizardProject = useAppDataStore((s) => s.saveWizardProject)
  const profile = useAuthStore((s) => s.profile)
  const push = useToastStore((s) => s.push)
  const [traceId, setTraceId] = useState<string | null>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const next = () => setWizard({ step: Math.min(STEPS - 1, step + 1) })
  const back = () => {
    if (step === 0) {
      setLeaveOpen(true)
      return
    }
    setWizard({ step: step - 1 })
  }

  const finish = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const id = await saveWizardProject(profile.id)
      push(t('common.success'), 'success')
      navigate(`/projects/${id}`)
    } catch (e) {
      push(e instanceof Error ? e.message : t('common.error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={back}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>

      <div>
        <p className="text-sm font-semibold text-primary">
          {step + 1} / {STEPS}
        </p>
        <h1 className="text-3xl font-extrabold">{titles[step]}</h1>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / STEPS) * 100}%` }} />
        </div>
      </div>

      {step === 0 && (
        <Card className="space-y-4">
          <div className="flex gap-2">
            <Button variant={wizard.clientMode === 'existing' ? 'primary' : 'outline'} className="flex-1 h-12" onClick={() => setWizard({ clientMode: 'existing' })}>
              {t('project.wizard.existingClient')}
            </Button>
            <Button variant={wizard.clientMode === 'new' ? 'primary' : 'outline'} className="flex-1 h-12" onClick={() => setWizard({ clientMode: 'new' })}>
              {t('project.wizard.newClient')}
            </Button>
          </div>
          {wizard.clientMode === 'existing' ? (
            <Select
              label={t('project.client')}
              value={wizard.clientId ?? ''}
              onChange={(e) => {
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
              <Input label={t('auth.fullName')} value={wizard.client.full_name} onChange={(e) => setWizard({ client: { ...wizard.client, full_name: e.target.value } })} />
              <Input label={t('auth.phone')} value={wizard.client.phone} onChange={(e) => setWizard({ client: { ...wizard.client, phone: e.target.value } })} />
              <Input label={t('project.wizard.telegram')} value={wizard.client.telegram} onChange={(e) => setWizard({ client: { ...wizard.client, telegram: e.target.value } })} />
              <Textarea label={t('project.wizard.comment')} value={wizard.client.comment} onChange={(e) => setWizard({ client: { ...wizard.client, comment: e.target.value } })} />
            </>
          )}
        </Card>
      )}

      {step === 1 && (
        <Card className="space-y-4">
          <Input label={t('project.wizard.projectName')} value={wizard.project.title} onChange={(e) => setWizard({ project: { ...wizard.project, title: e.target.value } })} />
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
          <Input label={t('project.wizard.floors')} type="number" min={1} value={wizard.project.floors_count} onChange={(e) => setWizard({ project: { ...wizard.project, floors_count: Number(e.target.value) || 1 } })} />
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
                <Input label={t('project.wizard.length')} type="number" step="0.1" value={room.length_m} onChange={(e) => updateRoom(setWizard, wizard, room.id, { length_m: Number(e.target.value) || 0 })} />
                <Input label={t('project.wizard.width')} type="number" step="0.1" value={room.width_m} onChange={(e) => updateRoom(setWizard, wizard, room.id, { width_m: Number(e.target.value) || 0 })} />
                <Input label={t('project.wizard.height')} type="number" step="0.1" value={room.height_m} onChange={(e) => updateRoom(setWizard, wizard, room.id, { height_m: Number(e.target.value) || 0 })} />
              </div>
              <p className="text-sm text-muted">
                {t('project.wizard.area')}: {calcArea(room.length_m, room.width_m)} м² · {t('project.wizard.perimeter')}: {calcPerimeter(room.length_m, room.width_m)} м
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
                  <Input label={t('project.wizard.quantity')} type="number" min={1} value={point.quantity} onChange={(e) => updatePoint(setWizard, wizard, point.id, { quantity: Number(e.target.value) || 1 })} />
                  <Input label={t('project.wizard.installHeight')} type="number" step="0.1" value={point.install_height_m} onChange={(e) => updatePoint(setWizard, wizard, point.id, { install_height_m: Number(e.target.value) || 0 })} />
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
          <Input label={t('project.wizard.distanceToPanel')} type="number" value={wizard.params.distanceToPanel_m} onChange={(e) => setWizard({ params: { ...wizard.params, distanceToPanel_m: Number(e.target.value) || 0 } })} />
          <Input label={t('project.wizard.panelsCount')} type="number" value={wizard.params.panelsCount} onChange={(e) => setWizard({ params: { ...wizard.params, panelsCount: Number(e.target.value) || 1 } })} />
          <Input label={t('project.wizard.panelFloor')} type="number" value={wizard.params.panelFloor} onChange={(e) => setWizard({ params: { ...wizard.params, panelFloor: Number(e.target.value) || 1 } })} />
          <Select label={t('project.wizard.routing')} value={wizard.params.routingMethod} onChange={(e) => setWizard({ params: { ...wizard.params, routingMethod: e.target.value as RoutingMethod } })}>
            {(['ceiling', 'wall', 'floor', 'cable_channel'] as const).map((k) => (
              <option key={k} value={k}>{t(`project.routingMethods.${k}`)}</option>
            ))}
          </Select>
          <Input label={t('project.wizard.sparePercent')} type="number" value={wizard.params.sparePercent} onChange={(e) => setWizard({ params: { ...wizard.params, sparePercent: Number(e.target.value) || 0 } })} />
          <Input label={t('project.wizard.complexity')} type="number" step="0.05" value={wizard.params.complexityCoefficient} onChange={(e) => setWizard({ params: { ...wizard.params, complexityCoefficient: Number(e.target.value) || 1 } })} />
          <Input label={t('project.wizard.worksPrice')} type="number" value={wizard.params.worksBasePrice} onChange={(e) => setWizard({ params: { ...wizard.params, worksBasePrice: Number(e.target.value) || 0 } })} />
        </Card>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <Card className="space-y-2 bg-warning/40">
            <p className="text-sm font-medium text-warning-text">{t('calc.disclaimer')}</p>
          </Card>
          <Card className="grid grid-cols-2 gap-3">
            <Stat label={t('calc.points')} value={String(calc.pointsCount)} />
            <Stat label={t('calc.materialsQty')} value={String(calc.materials.length)} />
            <Stat label={t('calc.materialsCost')} value={formatMoney(calc.materialsTotal)} />
            <Stat label={t('calc.worksCost')} value={formatMoney(calc.worksTotal)} />
            <div className="col-span-2">
              <Stat label={t('calc.grandTotal')} value={formatMoney(calc.grandTotal)} />
            </div>
          </Card>
          <Card className="space-y-3">
            <h3 className="font-bold">{t('calc.materialsPreview')}</h3>
            {calc.materials.map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-3 border-b border-white/60 pb-3 last:border-0">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-muted">
                    {m.quantity} {m.unit} · {formatMoney(m.totalPrice)}
                  </p>
                  <button type="button" className="mt-1 text-xs font-semibold text-primary" onClick={() => setTraceId(m.id)}>
                    {t('common.whyAdded')}
                  </button>
                </div>
              </div>
            ))}
          </Card>
          {traceId ? (
            <Card>
              {(() => {
                const line = calc.materials.find((m) => m.id === traceId)
                if (!line) return null
                const tr = explainLine(line)
                return (
                  <div className="space-y-2 text-sm">
                    <h4 className="font-bold">{line.name}</h4>
                    <p><b>{t('calc.inputs')}:</b> {JSON.stringify(tr.inputs)}</p>
                    <p><b>{t('calc.formula')}:</b> {tr.formula}</p>
                    <p><b>{t('calc.coefficient')}:</b> {tr.coefficient}</p>
                    <p><b>{t('calc.spare')}:</b> {tr.sparePercent}%</p>
                    <p><b>{t('calc.beforeRound')}:</b> {tr.beforeRound}</p>
                    <p><b>{t('calc.finalQty')}:</b> {tr.finalQty}</p>
                    <Button variant="outline" onClick={() => setTraceId(null)}>{t('common.cancel')}</Button>
                  </div>
                )
              })()}
            </Card>
          ) : null}
        </div>
      )}

      <div className="flex gap-3 pb-4">
        <Button variant="outline" className="flex-1" onClick={back}>
          <ArrowLeft size={16} />
          {t('common.back')}
        </Button>
        {step < STEPS - 1 ? (
          <Button className="flex-1" onClick={next}>
            {t('common.next')}
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button className="flex-1" disabled={saving} onClick={() => void finish()}>
            {t('common.save')}
          </Button>
        )}
      </div>

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
      <p className="text-lg font-extrabold">{value}</p>
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
  return calculateProjectMaterials(
    wizard.rooms.map((r) => ({
      id: r.id,
      name: r.name,
      length_m: r.length_m,
      width_m: r.width_m,
      height_m: r.height_m,
      area_m2: calcArea(r.length_m, r.width_m),
      perimeter_m: calcPerimeter(r.length_m, r.width_m),
    })),
    wizard.points.map((p) => ({
      id: p.id,
      roomId: p.roomId,
      deviceCode: p.deviceCode,
      quantity: p.quantity,
      separateLine: p.separate_line,
      installHeight_m: p.install_height_m,
      customPower_w: p.custom_power_w,
    })),
    wizard.params,
  )
}

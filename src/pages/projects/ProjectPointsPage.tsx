import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { IntegerInput } from '@/components/ui/numeric-input'
import { useAppDataStore } from '@/stores/app-data-store'
import { DEVICE_TYPES } from '@/features/calculation-engine'
import { resolveDeviceCode } from '@/lib/project-recalc'
import { translateDeviceName } from '@/lib/labels'
import { EMPTY_LIST } from '@/lib/empty'

export function ProjectPointsPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rooms = useAppDataStore((s) => s.rooms[id] ?? EMPTY_LIST)
  const points = useAppDataStore((s) => s.points[id] ?? EMPTY_LIST)
  const addPoint = useAppDataStore((s) => s.addPoint)
  const updatePoint = useAppDataStore((s) => s.updatePoint)
  const deletePoint = useAppDataStore((s) => s.deletePoint)
  const [deviceCode, setDeviceCode] = useState('socket_single')
  const [roomId, setRoomId] = useState('')
  const [qty, setQty] = useState<number | null>(1)
  const [separate, setSeparate] = useState(false)

  useEffect(() => {
    if (!roomId && rooms[0]?.id) setRoomId(rooms[0].id)
  }, [rooms, roomId])

  return (
    <div className="space-y-5">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={() => navigate(`/projects/${id}`)}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>
      <h1 className="text-3xl font-extrabold">{t('project.wizard.stepPoints')}</h1>
      {rooms.length === 0 ? (
        <Card>
          <p className="text-muted">{t('project.addRoomsFirst')}</p>
          <Button className="mt-3" variant="secondary" onClick={() => navigate(`/projects/${id}/rooms`)}>
            {t('project.rooms')}
          </Button>
        </Card>
      ) : null}
      {points.map((p) => (
        <Card key={p.id} className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold">{translateDeviceName(t, resolveDeviceCode(p), p.custom_name)}</p>
              <p className="text-sm text-muted">
                {t('project.wizard.quantity')}: {p.quantity}
                {p.separate_line ? ` · ${t('project.wizard.separateLine')}` : ''}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deletePoint(id, p.id)}>
              <Trash2 size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              label={t('project.rooms')}
              value={p.room_id}
              onChange={(e) => updatePoint(id, p.id, { room_id: e.target.value })}
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
            <Select
              label={t('project.wizard.addPoint')}
              value={resolveDeviceCode(p)}
              onChange={(e) => {
                const code = e.target.value
                updatePoint(id, p.id, {
                  device_code: code,
                  custom_name: code,
                })
              }}
            >
              {DEVICE_TYPES.map((d) => (
                <option key={d.code} value={d.code}>{translateDeviceName(t, d.code)}</option>
              ))}
            </Select>
          </div>
          <IntegerInput
            label={t('project.wizard.quantity')}
            value={p.quantity}
            onValueChange={(quantity) => updatePoint(id, p.id, { quantity: quantity ?? 1 })}
          />
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={p.separate_line}
              onChange={(e) => updatePoint(id, p.id, { separate_line: e.target.checked })}
            />
            {t('project.wizard.separateLine')}
          </label>
        </Card>
      ))}
      <Card className="space-y-3">
        <Select label={t('project.rooms')} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </Select>
        <Select label={t('project.wizard.addPoint')} value={deviceCode} onChange={(e) => setDeviceCode(e.target.value)}>
          {DEVICE_TYPES.map((d) => (
            <option key={d.code} value={d.code}>{translateDeviceName(t, d.code)}</option>
          ))}
        </Select>
        <IntegerInput label={t('project.wizard.quantity')} value={qty} onValueChange={setQty} />
        <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={separate} onChange={(e) => setSeparate(e.target.checked)} />
          {t('project.wizard.separateLine')}
        </label>
        <Button
          className="w-full"
          disabled={!roomId || qty == null || qty < 1}
          onClick={() => {
            addPoint(id, {
              id: crypto.randomUUID(),
              room_id: roomId,
              project_id: id,
              device_type_id: null,
              device_code: deviceCode,
              custom_name: deviceCode,
              quantity: qty ?? 1,
              install_height_m: 0.3,
              separate_line: separate,
              comment: null,
              custom_power_w: null,
              photo_url: null,
            })
            setQty(1)
            setSeparate(false)
          }}
        >
          <Plus size={18} />
          {t('project.wizard.addPoint')}
        </Button>
      </Card>
    </div>
  )
}

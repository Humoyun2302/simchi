import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useAppDataStore } from '@/stores/app-data-store'
import { DEVICE_TYPES } from '@/features/calculation-engine'
import { useState } from 'react'

export function ProjectPointsPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rooms = useAppDataStore((s) => s.rooms[id] ?? [])
  const points = useAppDataStore((s) => s.points[id] ?? [])
  const addPoint = useAppDataStore((s) => s.addPoint)
  const [deviceCode, setDeviceCode] = useState('socket_single')
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? '')
  const [qty, setQty] = useState(1)

  return (
    <div className="space-y-5">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={() => navigate(`/projects/${id}`)}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>
      <h1 className="text-3xl font-extrabold">{t('project.wizard.stepPoints')}</h1>
      {points.map((p) => (
        <Card key={p.id}>
          <p className="font-bold">{p.custom_name}</p>
          <p className="text-sm text-muted">
            {t('project.wizard.quantity')}: {p.quantity}
            {p.separate_line ? ` · ${t('project.wizard.separateLine')}` : ''}
          </p>
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
            <option key={d.code} value={d.code}>{d.nameRu}</option>
          ))}
        </Select>
        <Input label={t('project.wizard.quantity')} type="number" value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} />
        <Button
          className="w-full"
          disabled={!roomId}
          onClick={() =>
            addPoint(id, {
              id: crypto.randomUUID(),
              room_id: roomId,
              project_id: id,
              device_type_id: null,
              custom_name: DEVICE_TYPES.find((d) => d.code === deviceCode)?.nameRu ?? deviceCode,
              quantity: qty,
              install_height_m: 0.3,
              separate_line: false,
              comment: null,
              custom_power_w: null,
              photo_url: null,
            })
          }
        >
          <Plus size={18} />
          {t('project.wizard.addPoint')}
        </Button>
      </Card>
    </div>
  )
}

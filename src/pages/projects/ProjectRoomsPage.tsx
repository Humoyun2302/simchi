import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DecimalInput } from '@/components/ui/numeric-input'
import { useAppDataStore } from '@/stores/app-data-store'
import { formatUnit } from '@/lib/utils'
import { useState } from 'react'
import type { RoomType } from '@/types/database'
import { EMPTY_LIST } from '@/lib/empty'

export function ProjectRoomsPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rooms = useAppDataStore((s) => s.rooms[id] ?? EMPTY_LIST)
  const addRoom = useAppDataStore((s) => s.addRoom)
  const updateRoom = useAppDataStore((s) => s.updateRoom)
  const deleteRoom = useAppDataStore((s) => s.deleteRoom)
  const [name, setName] = useState('')
  const [roomType, setRoomType] = useState<RoomType>('other')

  return (
    <div className="space-y-5">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={() => navigate(`/projects/${id}`)}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>
      <h1 className="text-3xl font-extrabold">{t('project.rooms')}</h1>
      {rooms.map((room) => (
        <Card key={room.id} className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Input
              label={t('project.wizard.addRoom')}
              value={room.name}
              onChange={(e) => updateRoom(id, room.id, { name: e.target.value })}
            />
            <Button className="mt-6" variant="ghost" size="icon" onClick={() => deleteRoom(id, room.id)}>
              <Trash2 size={16} />
            </Button>
          </div>
          <Select
            label={t('project.objectType')}
            value={room.room_type}
            onChange={(e) => updateRoom(id, room.id, { room_type: e.target.value as RoomType })}
          >
            {(['kitchen', 'bedroom', 'living_room', 'bathroom', 'hallway', 'office', 'technical', 'other'] as const).map((k) => (
              <option key={k} value={k}>{t(`project.roomTypes.${k}`)}</option>
            ))}
          </Select>
          <div className="grid grid-cols-3 gap-2">
            <DecimalInput label={t('project.wizard.length')} value={room.length_m} onValueChange={(length_m) => updateRoom(id, room.id, { length_m: length_m ?? 0 })} />
            <DecimalInput label={t('project.wizard.width')} value={room.width_m} onValueChange={(width_m) => updateRoom(id, room.id, { width_m: width_m ?? 0 })} />
            <DecimalInput label={t('project.wizard.height')} value={room.height_m} onValueChange={(height_m) => updateRoom(id, room.id, { height_m: height_m ?? 0 })} />
          </div>
          <p className="text-sm text-muted">
            {room.area_m2} {formatUnit('m2')} · {room.perimeter_m} {formatUnit('m')}
          </p>
        </Card>
      ))}
      <Card className="space-y-3">
        <Input label={t('project.wizard.addRoom')} value={name} onChange={(e) => setName(e.target.value)} />
        <Select label={t('project.objectType')} value={roomType} onChange={(e) => setRoomType(e.target.value as RoomType)}>
          {(['kitchen', 'bedroom', 'living_room', 'bathroom', 'hallway', 'office', 'technical', 'other'] as const).map((k) => (
            <option key={k} value={k}>{t(`project.roomTypes.${k}`)}</option>
          ))}
        </Select>
        <Button
          className="w-full"
          onClick={() => {
            addRoom(id, {
              id: crypto.randomUUID(),
              project_id: id,
              name: name || t(`project.roomTypes.${roomType}`),
              room_type: roomType,
              length_m: 3,
              width_m: 3,
              height_m: 2.7,
              wall_material: null,
              ceiling_material: null,
              comment: null,
              sort_order: rooms.length,
            })
            setName('')
          }}
        >
          <Plus size={18} />
          {t('project.wizard.addRoom')}
        </Button>
      </Card>
    </div>
  )
}

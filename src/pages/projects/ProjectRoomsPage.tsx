import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppDataStore } from '@/stores/app-data-store'
import { useState } from 'react'
import type { RoomType } from '@/types/database'

export function ProjectRoomsPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rooms = useAppDataStore((s) => s.rooms[id] ?? [])
  const addRoom = useAppDataStore((s) => s.addRoom)
  const updateRoom = useAppDataStore((s) => s.updateRoom)
  const [name, setName] = useState('')

  return (
    <div className="space-y-5">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={() => navigate(`/projects/${id}`)}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>
      <h1 className="text-3xl font-extrabold">{t('project.rooms')}</h1>
      {rooms.map((room) => (
        <Card key={room.id} className="space-y-3">
          <p className="font-bold">{room.name}</p>
          <div className="grid grid-cols-3 gap-2">
            <Input label={t('project.wizard.length')} type="number" value={room.length_m} onChange={(e) => updateRoom(id, room.id, { length_m: Number(e.target.value) || 0 })} />
            <Input label={t('project.wizard.width')} type="number" value={room.width_m} onChange={(e) => updateRoom(id, room.id, { width_m: Number(e.target.value) || 0 })} />
            <Input label={t('project.wizard.height')} type="number" value={room.height_m} onChange={(e) => updateRoom(id, room.id, { height_m: Number(e.target.value) || 0 })} />
          </div>
          <p className="text-sm text-muted">
            {room.area_m2} м² · {room.perimeter_m} м
          </p>
        </Card>
      ))}
      <Card className="space-y-3">
        <Input label={t('project.wizard.addRoom')} value={name} onChange={(e) => setName(e.target.value)} />
        <Button
          className="w-full"
          onClick={() => {
            const roomType: RoomType = 'other'
            addRoom(id, {
              id: crypto.randomUUID(),
              project_id: id,
              name: name || t('project.roomTypes.other'),
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

import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Boxes,
  Cable,
  DoorOpen,
  FileText,
  Hammer,
  Truck,
} from 'lucide-react'
import { Badge, Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppDataStore } from '@/stores/app-data-store'
import { formatDate, formatMoney } from '@/lib/utils'

export function ProjectDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const project = useAppDataStore((s) => s.projects.find((p) => p.id === id))
  const createPublicLink = useAppDataStore((s) => s.createPublicLink)
  const [link, setLink] = useState('')

  const links = useMemo(
    () => [
      { to: `/projects/${id}/rooms`, icon: DoorOpen, label: t('project.rooms') },
      { to: `/projects/${id}/points`, icon: Cable, label: t('project.wizard.stepPoints') },
      { to: `/projects/${id}/materials`, icon: Boxes, label: t('project.materials') },
      { to: `/projects/${id}/works`, icon: Hammer, label: t('project.works') },
      { to: `/projects/${id}/suppliers`, icon: Truck, label: t('nav.suppliers') },
      { to: `/projects/${id}/estimate`, icon: FileText, label: t('estimate.title') },
    ],
    [id, t],
  )

  if (!project) {
    return (
      <Card>
        <p>{t('common.empty')}</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/projects')}>
          {t('common.back')}
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">{project.title}</h1>
          <p className="mt-1 text-muted">{project.clients?.full_name}</p>
        </div>
        <Badge tone="primary">{t(`project.statuses.${project.status}`)}</Badge>
      </div>

      <Card className="grid gap-3 sm:grid-cols-2">
        <Info label={t('project.address')} value={`${project.address ?? ''}, ${project.city ?? ''}`} />
        <Info label={t('project.objectType')} value={t(`project.objectTypes.${project.object_type}`)} />
        <Info label={t('project.rooms')} value={String(project.rooms_count)} />
        <Info label={t('project.updated')} value={formatDate(project.updated_at)} />
        <Info label={t('project.materialsCost')} value={formatMoney(project.materials_total)} />
        <Info label={t('project.worksCost')} value={formatMoney(project.works_total)} />
        <Info label={t('project.total')} value={formatMoney(project.grand_total)} />
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="glass flex min-h-14 items-center gap-3 rounded-[24px] px-4 font-semibold text-text"
          >
            <item.icon size={18} className="text-primary" />
            {item.label}
          </Link>
        ))}
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => {
          const token = createPublicLink(project.id)
          const url = `${window.location.origin}/estimate/public/${token}`
          setLink(url)
          void navigator.clipboard.writeText(url)
        }}
      >
        Публичная ссылка на смету
      </Button>
      {link ? <p className="break-all text-xs text-muted">{link}</p> : null}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}

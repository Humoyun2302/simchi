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
  Trash2,
  Truck,
} from 'lucide-react'
import { Badge, Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppDataStore } from '@/stores/app-data-store'
import { copyToClipboard, formatDate, formatMoney } from '@/lib/utils'
import { translateProjectTitle } from '@/lib/labels'
import { useToastStore } from '@/stores/toast-store'
import { ConfirmDialog } from '@/components/ui/dialog'

export function ProjectDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const project = useAppDataStore((s) => s.projects.find((p) => p.id === id))
  const createPublicLink = useAppDataStore((s) => s.createPublicLink)
  const deleteProject = useAppDataStore((s) => s.deleteProject)
  const push = useToastStore((s) => s.push)
  const [link, setLink] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

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
    <div className="space-y-4 sm:space-y-5">
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[1.6rem] font-extrabold leading-tight sm:text-3xl">
            {translateProjectTitle(t, project.id, project.title)}
          </h1>
          <p className="mt-1 text-sm text-muted sm:text-base">{project.clients?.full_name}</p>
        </div>
        <Badge tone="primary" className="shrink-0">
          {t(`project.statuses.${project.status}`)}
        </Badge>
      </div>

      <Card className="space-y-3 !p-4 sm:!p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted">{t('project.total')}</p>
            <p className="text-2xl font-extrabold text-primary">{formatMoney(project.grand_total)}</p>
          </div>
          <p className="text-right text-xs text-muted">
            {project.rooms_count} {t('project.rooms').toLowerCase()}
            <br />
            {formatDate(project.updated_at)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-white/70 pt-3 text-sm">
          <Info label={t('project.materialsCost')} value={formatMoney(project.materials_total)} />
          <Info label={t('project.worksCost')} value={formatMoney(project.works_total)} />
          <Info label={t('project.objectType')} value={t(`project.objectTypes.${project.object_type}`)} />
          <Info label={t('project.address')} value={`${project.address ?? ''}`} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="glass flex min-h-[4.25rem] flex-col items-start justify-center gap-1.5 rounded-[22px] px-3.5 py-3 font-semibold text-text active:scale-[0.98] sm:min-h-14 sm:flex-row sm:items-center sm:gap-3 sm:rounded-[24px] sm:px-4"
          >
            <item.icon size={18} className="text-primary" />
            <span className="text-sm leading-snug">{item.label}</span>
          </Link>
        ))}
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={async () => {
          const token = createPublicLink(project.id)
          const url = `${window.location.origin}/estimate/public/${token}`
          setLink(url)
          const ok = await copyToClipboard(url)
          push(ok ? t('estimate.linkCopied') : t('estimate.linkCreatedManual'), ok ? 'success' : 'info')
        }}
      >
        {t('estimate.publicLink')}
      </Button>
      {link ? <p className="break-all text-xs text-muted">{link}</p> : null}

      <Button variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
        <Trash2 size={16} />
        {t('common.delete')}
      </Button>

      <ConfirmDialog
        open={confirmDelete}
        title={t('common.delete')}
        description={t('project.deleteDescription')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteProject(project.id)
          setConfirmDelete(false)
          navigate('/projects')
        }}
      />
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

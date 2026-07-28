import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, ChevronRight } from 'lucide-react'
import { Badge, Card } from '@/components/ui/card'
import { formatDate, formatMoney } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types/database'

const statusTone: Record<ProjectStatus, 'neutral' | 'success' | 'danger' | 'warning' | 'primary'> = {
  draft: 'neutral',
  calculated: 'primary',
  sent: 'primary',
  pending_approval: 'warning',
  confirmed: 'success',
  rejected: 'danger',
  materials_ordered: 'primary',
  completed: 'success',
}

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useTranslation()

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-text">{project.title}</h3>
          <p className="mt-1 text-sm text-muted">{project.clients?.full_name ?? '—'}</p>
        </div>
        <Badge tone={statusTone[project.status]}>{t(`project.statuses.${project.status}`)}</Badge>
      </div>

      <div className="flex items-start gap-2 text-sm text-muted">
        <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
        <span>
          {project.address}
          {project.city ? `, ${project.city}` : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted">{t('project.objectType')}</p>
          <p className="font-semibold">{t(`project.objectTypes.${project.object_type}`)}</p>
        </div>
        <div>
          <p className="text-muted">{t('project.rooms')}</p>
          <p className="font-semibold">{project.rooms_count}</p>
        </div>
        <div>
          <p className="text-muted">{t('project.materialsCost')}</p>
          <p className="font-semibold">{formatMoney(project.materials_total)}</p>
        </div>
        <div>
          <p className="text-muted">{t('project.worksCost')}</p>
          <p className="font-semibold">{formatMoney(project.works_total)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/70 pt-3">
        <div>
          <p className="text-xs text-muted">{t('project.total')}</p>
          <p className="text-lg font-extrabold text-primary">{formatMoney(project.grand_total)}</p>
          <p className="text-xs text-muted">
            {t('project.updated')}: {formatDate(project.updated_at)}
          </p>
        </div>
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex min-h-11 items-center gap-1 rounded-2xl bg-primary-soft px-4 text-sm font-semibold text-primary"
        >
          {t('common.more')}
          <ChevronRight size={16} />
        </Link>
      </div>
    </Card>
  )
}

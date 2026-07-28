import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/card'
import { formatDate, formatMoney, formatMoneyCompact } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types/database'
import { cn } from '@/lib/utils'

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
    <Link
      to={`/projects/${project.id}`}
      className={cn(
        'glass block rounded-[26px] p-4 transition active:scale-[0.985] sm:p-5',
        'focus-visible:ring-2 focus-visible:ring-primary/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-text">{project.title}</h3>
          <p className="mt-1 truncate text-sm text-muted">{project.clients?.full_name ?? '—'}</p>
        </div>
        <Badge tone={statusTone[project.status]} className="shrink-0 max-w-[40%] truncate">
          {t(`project.statuses.${project.status}`)}
        </Badge>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-sm text-muted">
        <MapPin size={15} className="shrink-0 text-primary" />
        <span className="truncate">
          {project.address}
          {project.city ? `, ${project.city}` : ''}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 border-t border-white/70 pt-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">{t('project.total')}</p>
          <p className="truncate text-lg font-extrabold text-primary sm:hidden">
            {formatMoneyCompact(project.grand_total)}
          </p>
          <p className="hidden truncate text-lg font-extrabold text-primary sm:block">
            {formatMoney(project.grand_total)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            {project.rooms_count} {t('project.rooms').toLowerCase()} · {formatDate(project.updated_at)}
          </p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <ChevronRight size={18} />
        </span>
      </div>
    </Link>
  )
}

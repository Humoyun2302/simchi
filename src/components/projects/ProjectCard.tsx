import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/card'
import { formatDate, formatMoney, formatMoneyCompact } from '@/lib/utils'
import { projectStatusI18nKey, normalizeProjectStatus } from '@/lib/status'
import { translateProjectTitle } from '@/lib/labels'
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
  const status = normalizeProjectStatus(project.status)

  return (
    <Link
      to={`/projects/${project.id}`}
      className={cn(
        'glass block overflow-hidden rounded-[26px] p-4 transition active:scale-[0.985] sm:p-5',
        'focus-visible:ring-2 focus-visible:ring-primary/30',
      )}
    >
      <div className="flex min-w-0 flex-wrap items-start gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
          <h3 className="break-words text-[17px] font-bold leading-snug text-text">
            {translateProjectTitle(t, project.id, project.title)}
          </h3>
          <p className="mt-1 truncate text-sm text-muted">{project.clients?.full_name ?? '—'}</p>
        </div>
        <Badge
          tone={statusTone[status]}
          className={cn(
            'max-w-full shrink min-w-0 basis-auto',
            'whitespace-normal text-center leading-snug',
            'px-2.5 py-1.5',
          )}
        >
          <span className="block max-w-[14rem] break-words hyphens-auto sm:max-w-[16rem]">
            {t(projectStatusI18nKey(status))}
          </span>
        </Badge>
      </div>

      <div className="mt-3 flex min-w-0 items-center gap-1.5 text-sm text-muted">
        <MapPin size={15} className="shrink-0 text-primary" />
        <span className="min-w-0 break-words">
          {project.address}
          {project.city ? `, ${project.city}` : ''}
        </span>
      </div>

      <div className="mt-3 flex min-w-0 items-end justify-between gap-3 border-t border-white/70 pt-3">
        <div className="min-w-0 flex-1">
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

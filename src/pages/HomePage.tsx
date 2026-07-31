import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogIn, Plus, Search, Settings } from 'lucide-react'
import { Logo, FilterPills, EmptyState } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { useAuthStore } from '@/stores/auth-store'
import { useAppDataStore } from '@/stores/app-data-store'
import { useNewCalcFlow } from '@/stores/new-calc-flow'
import { filterProjects, getHomeStats } from '@/stores/demo-data'
import { cn, formatMoneyCompact } from '@/lib/utils'

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const demoMode = useAuthStore((s) => s.demoMode)
  const projects = useAppDataStore((s) => s.projects)
  const load = useAppDataStore((s) => s.load)
  const requestNewCalc = useNewCalcFlow((s) => s.requestNewCalc)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (profile) void load(profile.id, demoMode)
  }, [profile, demoMode, load])

  const stats = useMemo(() => getHomeStats(projects), [projects])
  const filtered = useMemo(() => filterProjects(projects, filter, query), [projects, filter, query])

  const filterOptions = [
    { value: 'all', label: t('home.filters.all') },
    { value: 'draft', label: t('home.filters.draft') },
    { value: 'pending_approval', label: t('home.filters.pending_approval') },
    { value: 'confirmed', label: t('home.filters.confirmed') },
    { value: 'materials_ordered', label: t('home.filters.materials_ordered') },
    { value: 'completed', label: t('home.filters.completed') },
  ]

  const statItems = [
    { label: t('home.stats.estimatesTotal'), value: formatMoneyCompact(stats.estimatesTotal) },
    { label: t('home.stats.materialsOrdered'), value: formatMoneyCompact(stats.materialsOrdered) },
    { label: t('home.stats.clientSavings'), value: formatMoneyCompact(stats.clientSavings) },
    { label: t('home.stats.activeProjects'), value: String(stats.activeProjects) },
  ]

  return (
    <div className="space-y-4 sm:space-y-5">
      <header className="flex items-center justify-between gap-2">
        <Logo size="sm" className="sm:text-2xl" />
        <div className="flex items-center gap-1.5">
          {demoMode ? (
            <Link
              to="/login"
              aria-label={t('auth.login')}
              className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-2xl bg-white/70 px-3 text-sm font-semibold text-primary"
            >
              <LogIn size={18} />
              <span className="hidden xs:inline sm:inline">{t('auth.login')}</span>
            </Link>
          ) : null}
          <Link
            to="/settings"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/50 text-muted"
            aria-label={t('common.settings')}
          >
            <Settings size={18} />
          </Link>
        </div>
      </header>

      <section>
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight sm:text-4xl">
          {t('home.title')}
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">{t('home.subtitle')}</p>
      </section>

      <Button className="w-full shadow-[0_12px_28px_rgb(63_127_241_/_0.28)]" onClick={() => requestNewCalc(navigate)}>
        <Plus size={22} strokeWidth={2.5} />
        {t('home.newCalc')}
      </Button>

      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('common.search')}
          enterKeyHint="search"
          className="w-full min-h-12 rounded-full border border-white/80 bg-white/70 pl-11 pr-4 text-text outline-none placeholder:text-muted/80 focus:ring-2 focus:ring-primary/25"
        />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
        {statItems.map((item) => (
          <div
            key={item.label}
            className={cn(
              'glass min-w-[42%] shrink-0 rounded-[22px] p-3.5 sm:min-w-0',
            )}
          >
            <p className="line-clamp-2 text-[11px] font-medium leading-tight text-muted sm:text-xs">{item.label}</p>
            <p className="mt-1.5 text-base font-extrabold leading-tight text-text sm:text-lg">{item.value}</p>
          </div>
        ))}
      </div>

      <FilterPills options={filterOptions} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          title={t('common.empty')}
          description={t('home.emptyDescription')}
          action={
            <Button onClick={() => requestNewCalc(navigate)}>
              <Plus size={18} />
              {t('home.newCalc')}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Filter, LogIn, Plus, Settings } from 'lucide-react'
import { Logo, FilterPills, SearchBar, StatCard } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { EmptyState } from '@/components/ui/logo'
import { useAuthStore } from '@/stores/auth-store'
import { useAppDataStore } from '@/stores/app-data-store'
import { filterProjects, getHomeStats } from '@/stores/demo-data'
import { formatMoney } from '@/lib/utils'

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const demoMode = useAuthStore((s) => s.demoMode)
  const projects = useAppDataStore((s) => s.projects)
  const load = useAppDataStore((s) => s.load)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(true)

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Logo />
        <div className="flex gap-2">
          {demoMode ? (
            <Link
              to="/login"
              className="inline-flex h-11 items-center gap-1.5 rounded-2xl bg-white/70 px-3 text-sm font-semibold text-primary hover:bg-white"
            >
              <LogIn size={16} />
              {t('auth.login')}
            </Link>
          ) : null}
          <Button variant="ghost" size="icon" aria-label={t('common.filters')} onClick={() => setShowFilters((v) => !v)}>
            <Filter size={18} />
          </Button>
          <Link to="/settings" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-muted hover:bg-white/50" aria-label={t('common.settings')}>
            <Settings size={18} />
          </Link>
        </div>
      </div>

      <Button className="w-full" onClick={() => navigate('/projects/new')}>
        <Plus size={20} />
        {t('home.newCalc')}
      </Button>

      <SearchBar value={query} onChange={setQuery} placeholder={t('common.search')} />

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('home.title')}</h1>
        <p className="mt-1 text-muted">{t('home.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('home.stats.estimatesTotal')} value={formatMoney(stats.estimatesTotal)} />
        <StatCard label={t('home.stats.materialsOrdered')} value={formatMoney(stats.materialsOrdered)} />
        <StatCard label={t('home.stats.clientSavings')} value={formatMoney(stats.clientSavings)} />
        <StatCard label={t('home.stats.activeProjects')} value={String(stats.activeProjects)} />
      </div>

      {showFilters ? <FilterPills options={filterOptions} value={filter} onChange={setFilter} /> : null}

      {filtered.length === 0 ? (
        <EmptyState title={t('common.empty')} description={t('home.subtitle')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}

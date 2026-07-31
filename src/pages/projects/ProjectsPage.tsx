import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { PageHeader, FilterPills, SearchBar, EmptyState } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { useAppDataStore } from '@/stores/app-data-store'
import { useNewCalcFlow } from '@/stores/new-calc-flow'
import { filterProjects } from '@/stores/demo-data'

export function ProjectsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const projects = useAppDataStore((s) => s.projects)
  const requestNewCalc = useNewCalcFlow((s) => s.requestNewCalc)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => filterProjects(projects, filter, query), [projects, filter, query])

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('nav.projects')}
        subtitle={t('home.subtitle')}
        actions={
          <Button className="w-full sm:w-auto" onClick={() => requestNewCalc(navigate)}>
            <Plus size={18} />
            {t('home.newCalc')}
          </Button>
        }
      />
      <SearchBar value={query} onChange={setQuery} placeholder={t('common.search')} />
      <FilterPills
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: t('home.filters.all') },
          { value: 'draft', label: t('home.filters.draft') },
          { value: 'pending_approval', label: t('home.filters.pending_approval') },
          { value: 'confirmed', label: t('home.filters.confirmed') },
          { value: 'materials_ordered', label: t('home.filters.materials_ordered') },
          { value: 'completed', label: t('home.filters.completed') },
        ]}
      />
      {filtered.length === 0 ? (
        <EmptyState title={t('common.empty')} />
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

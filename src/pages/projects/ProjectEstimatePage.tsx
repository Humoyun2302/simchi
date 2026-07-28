import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppDataStore } from '@/stores/app-data-store'
import { formatDate, formatMoney } from '@/lib/utils'
import { exportEstimateCsv, exportEstimatePdf, exportEstimateXlsx } from '@/features/estimates/export'
import { useToastStore } from '@/stores/toast-store'

export function ProjectEstimatePage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const project = useAppDataStore((s) => s.projects.find((p) => p.id === id))
  const materials = useAppDataStore((s) => s.materials[id] ?? [])
  const works = useAppDataStore((s) => s.works[id] ?? [])
  const rooms = useAppDataStore((s) => s.rooms[id] ?? [])
  const createPublicLink = useAppDataStore((s) => s.createPublicLink)
  const updateProject = useAppDataStore((s) => s.updateProject)
  const push = useToastStore((s) => s.push)

  const payload = useMemo(() => {
    if (!project) return null
    return {
      title: project.title,
      clientName: project.clients?.full_name ?? '',
      address: `${project.address ?? ''}, ${project.city ?? ''}`,
      status: project.status,
      materialsTotal: project.materials_total,
      worksTotal: project.works_total,
      deliveryTotal: 0,
      discountTotal: 0,
      grandTotal: project.grand_total,
      createdAt: project.created_at,
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
      rooms: rooms.map((r) => r.name),
      materials: materials.map((m) => ({
        name: m.name,
        qty: m.manual_qty ?? m.calculated_qty,
        unit: m.unit,
        price: m.unit_price,
        total: m.total_price,
      })),
      works: works.map((w) => ({
        name: w.name,
        qty: w.quantity,
        price: w.unit_price,
        total: w.total_price,
      })),
      disclaimer: t('calc.disclaimer'),
    }
  }, [project, materials, works, rooms, t])

  if (!project || !payload) {
    return <Card>{t('common.empty')}</Card>
  }

  return (
    <div className="space-y-5">
      <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted" onClick={() => navigate(`/projects/${id}`)}>
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>
      <h1 className="text-3xl font-extrabold">{t('estimate.title')}</h1>
      <Card className="space-y-2">
        <p className="font-bold">{project.title}</p>
        <p className="text-sm text-muted">{project.clients?.full_name}</p>
        <p className="text-sm text-muted">{payload.address}</p>
        <p className="text-sm">{t('estimate.validUntil')}: {formatDate(payload.validUntil)}</p>
        <p className="text-2xl font-extrabold text-primary">{formatMoney(project.grand_total)}</p>
      </Card>
      <Card className="bg-warning/40">
        <p className="text-sm text-warning-text">{t('calc.disclaimer')}</p>
      </Card>
      <div className="grid gap-3 sm:grid-cols-3">
        <Button variant="secondary" onClick={() => exportEstimatePdf(payload)}>
          <FileDown size={16} />
          {t('estimate.downloadPdf')}
        </Button>
        <Button variant="outline" onClick={() => exportEstimateCsv(payload)}>
          {t('estimate.exportCsv')}
        </Button>
        <Button variant="outline" onClick={() => exportEstimateXlsx(payload)}>
          {t('estimate.exportXlsx')}
        </Button>
      </div>
      <Button
        className="w-full"
        onClick={() => {
          const token = createPublicLink(project.id)
          const url = `${window.location.origin}/estimate/public/${token}`
          void navigator.clipboard.writeText(url)
          updateProject(project.id, { status: 'sent' })
          push('Ссылка скопирована', 'success')
        }}
      >
        Отправить клиенту
      </Button>
    </div>
  )
}

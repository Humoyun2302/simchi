import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import i18n from '@/i18n'
import { formatCurrency, formatDate, formatUnit } from '@/lib/format'
import { getAppLanguage, type AppLanguage } from '@/lib/locale'
import { projectStatusI18nKey } from '@/lib/status'

export interface EstimateExportPayload {
  title: string
  clientName: string
  address: string
  status: string
  materialsTotal: number
  worksTotal: number
  deliveryTotal: number
  discountTotal: number
  grandTotal: number
  createdAt: string
  validUntil: string
  rooms: string[]
  materials: Array<{ name: string; qty: number; unit: string; price: number; total: number }>
  works: Array<{ name: string; qty: number; price: number; total: number }>
  disclaimer: string
}

export interface EstimateExportLabels {
  pdfTitle: string
  client: string
  address: string
  status: string
  created: string
  validUntil: string
  rooms: string
  materials: string
  works: string
  name: string
  qty: string
  unit: string
  price: string
  total: string
  materialsTotal: string
  worksTotal: string
  delivery: string
  discount: string
  grandTotal: string
  empty: string
  section: string
  materialRow: string
  workRow: string
  untitled: string
  payTotal: string
}

const FONT = 'DejaVuSans'
let fontsReady: Promise<void> | null = null
let regularB64 = ''
let boldB64 = ''

function money(n: number, lang: AppLanguage) {
  return formatCurrency(n, lang)
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunk = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

async function ensureFonts() {
  if (!fontsReady) {
    fontsReady = (async () => {
      const [regular, bold] = await Promise.all([
        fetch(`${import.meta.env.BASE_URL}fonts/DejaVuSans.ttf`).then((r) => {
          if (!r.ok) throw new Error('Failed to load DejaVuSans font')
          return r.arrayBuffer()
        }),
        fetch(`${import.meta.env.BASE_URL}fonts/DejaVuSans-Bold.ttf`).then((r) => {
          if (!r.ok) throw new Error('Failed to load DejaVuSans-Bold font')
          return r.arrayBuffer()
        }),
      ])
      regularB64 = arrayBufferToBase64(regular)
      boldB64 = arrayBufferToBase64(bold)
    })()
  }
  await fontsReady
}

function registerFonts(doc: jsPDF) {
  doc.addFileToVFS('DejaVuSans.ttf', regularB64)
  doc.addFont('DejaVuSans.ttf', FONT, 'normal')
  doc.addFileToVFS('DejaVuSans-Bold.ttf', boldB64)
  doc.addFont('DejaVuSans-Bold.ttf', FONT, 'bold')
  doc.setFont(FONT, 'normal')
}

export function getEstimateExportLabels(lang: AppLanguage = getAppLanguage()): EstimateExportLabels {
  const t = i18n.getFixedT(lang)
  return {
    pdfTitle: t('estimate.pdfTitle'),
    client: t('estimate.pdfClient'),
    address: t('estimate.pdfAddress'),
    status: t('estimate.pdfStatus'),
    created: t('estimate.pdfCreated'),
    validUntil: t('estimate.pdfValidUntil'),
    rooms: t('estimate.pdfRooms'),
    materials: t('estimate.pdfMaterials'),
    works: t('estimate.pdfWorks'),
    name: t('estimate.pdfName'),
    qty: t('estimate.pdfQty'),
    unit: t('estimate.pdfUnit'),
    price: t('estimate.pdfPrice'),
    total: t('estimate.pdfTotal'),
    materialsTotal: t('estimate.pdfMaterialsTotal'),
    worksTotal: t('estimate.pdfWorksTotal'),
    delivery: t('estimate.pdfDelivery'),
    discount: t('estimate.pdfDiscount'),
    grandTotal: t('estimate.pdfGrandTotal'),
    empty: t('common.empty'),
    section: t('common.all'),
    materialRow: t('project.materials'),
    workRow: t('project.works'),
    untitled: '—',
    payTotal: t('estimate.pdfGrandTotal'),
  }
}

/**
 * jsPDF default fonts have no Cyrillic glyphs — embed DejaVu Sans.
 */
export async function exportEstimatePdf(
  data: EstimateExportPayload,
  labels: EstimateExportLabels = getEstimateExportLabels(),
  lang: AppLanguage = getAppLanguage(),
) {
  await ensureFonts()

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  registerFonts(doc)

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const marginX = 16
  const contentW = pageW - marginX * 2
  let y = 18

  const ensureSpace = (need = 12) => {
    if (y + need > pageH - 18) {
      doc.addPage()
      registerFonts(doc)
      y = 18
    }
  }

  const text = (
    value: string | string[],
    x: number,
    yy: number,
    opts?: { align?: 'left' | 'right' | 'center'; maxWidth?: number },
  ) => {
    doc.text(value, x, yy, opts)
  }

  doc.setFont(FONT, 'bold')
  doc.setFontSize(20)
  doc.setTextColor(63, 127, 241)
  text('SIMCHI', marginX, y)
  y += 8

  doc.setFont(FONT, 'bold')
  doc.setFontSize(14)
  doc.setTextColor(16, 24, 40)
  text(labels.pdfTitle, marginX, y)
  y += 8

  doc.setFont(FONT, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 90, 110)
  text(data.title || labels.untitled, marginX, y)
  y += 6
  if (data.clientName) {
    text(`${labels.client}: ${data.clientName}`, marginX, y)
    y += 5
  }
  if (data.address?.trim()) {
    text(`${labels.address}: ${data.address}`, marginX, y)
    y += 5
  }
  if (data.status) {
    const statusLabel = i18n.getFixedT(lang)(projectStatusI18nKey(data.status))
    text(`${labels.status}: ${statusLabel}`, marginX, y)
    y += 5
  }
  text(`${labels.created}: ${formatDate(data.createdAt, lang)}`, marginX, y)
  y += 5
  if (data.validUntil) {
    text(`${labels.validUntil}: ${formatDate(data.validUntil, lang)}`, marginX, y)
    y += 5
  }

  y += 3
  doc.setDrawColor(220, 228, 240)
  doc.setLineWidth(0.3)
  doc.line(marginX, y, pageW - marginX, y)
  y += 8

  ensureSpace(28)
  doc.setFillColor(245, 248, 255)
  doc.roundedRect(marginX, y, contentW, 24, 2, 2, 'F')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 90, 110)
  text(`${labels.materialsTotal}: ${money(data.materialsTotal, lang)}`, marginX + 4, y + 7)
  text(`${labels.worksTotal}: ${money(data.worksTotal, lang)}`, marginX + 4, y + 13)
  doc.setFont(FONT, 'bold')
  doc.setFontSize(12)
  doc.setTextColor(16, 24, 40)
  text(`${labels.grandTotal}: ${money(data.grandTotal, lang)}`, marginX + 4, y + 20)
  y += 32

  const drawSectionTitle = (title: string) => {
    ensureSpace(14)
    doc.setFont(FONT, 'bold')
    doc.setFontSize(12)
    doc.setTextColor(16, 24, 40)
    text(title, marginX, y)
    y += 6
    doc.setDrawColor(63, 127, 241)
    doc.setLineWidth(0.5)
    doc.line(marginX, y, marginX + 28, y)
    y += 5
  }

  const drawRow = (left: string, right: string, muted = false) => {
    ensureSpace(8)
    const rightW = 42
    const leftMax = contentW - rightW - 2
    doc.setFont(FONT, 'normal')
    doc.setFontSize(9.5)
    if (muted) doc.setTextColor(116, 128, 148)
    else doc.setTextColor(16, 24, 40)
    const lines = doc.splitTextToSize(left, leftMax) as string[]
    text(lines, marginX, y)
    doc.setTextColor(16, 24, 40)
    text(right, pageW - marginX, y, { align: 'right' })
    y += Math.max(lines.length, 1) * 4.6 + 2.2
  }

  drawSectionTitle(labels.materials)
  if (data.materials.length === 0) {
    drawRow(labels.empty, '—', true)
  } else {
    data.materials.forEach((m) => {
      drawRow(`${m.name} — ${m.qty} ${formatUnit(m.unit, lang)}`, money(m.total, lang))
    })
  }

  y += 4

  drawSectionTitle(labels.works)
  if (data.works.length === 0) {
    drawRow(labels.empty, '—', true)
  } else {
    data.works.forEach((w) => {
      drawRow(`${w.name} — ${w.qty} ${formatUnit('pcs', lang)}`, money(w.total, lang))
    })
  }

  y += 6
  ensureSpace(20)
  doc.setDrawColor(220, 228, 240)
  doc.setLineWidth(0.3)
  doc.line(marginX, y, pageW - marginX, y)
  y += 7

  doc.setFont(FONT, 'bold')
  doc.setFontSize(11)
  doc.setTextColor(16, 24, 40)
  text(labels.payTotal, marginX, y)
  text(money(data.grandTotal, lang), pageW - marginX, y, { align: 'right' })
  y += 10

  ensureSpace(24)
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(116, 128, 148)
  const disclaimerLines = doc.splitTextToSize(data.disclaimer, contentW) as string[]
  text(disclaimerLines, marginX, y)

  doc.save(`simchi-estimate-${Date.now()}.pdf`)
}

export function exportEstimateCsv(
  data: EstimateExportPayload,
  labels: EstimateExportLabels = getEstimateExportLabels(),
  lang: AppLanguage = getAppLanguage(),
) {
  const rows = [
    [labels.section, labels.name, labels.qty, labels.unit, labels.price, labels.total],
    ...data.materials.map((m) => [
      labels.materialRow,
      m.name,
      m.qty,
      formatUnit(m.unit, lang),
      m.price,
      m.total,
    ]),
    ...data.works.map((w) => [
      labels.workRow,
      w.name,
      w.qty,
      formatUnit('pcs', lang),
      w.price,
      w.total,
    ]),
    [labels.grandTotal, '', '', '', '', data.grandTotal],
  ]
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  downloadBlob(`\uFEFF${csv}`, `simchi-estimate-${Date.now()}.csv`, 'text/csv;charset=utf-8')
}

export function exportEstimateXlsx(
  data: EstimateExportPayload,
  labels: EstimateExportLabels = getEstimateExportLabels(),
  lang: AppLanguage = getAppLanguage(),
) {
  const wb = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet([
    ['SIMCHI', data.title],
    [labels.client, data.clientName],
    [labels.address, data.address],
    [labels.status, i18n.getFixedT(lang)(projectStatusI18nKey(data.status))],
    [],
    [labels.section, labels.name, labels.qty, labels.unit, labels.price, labels.total],
    ...data.materials.map((m) => [
      labels.materialRow,
      m.name,
      m.qty,
      formatUnit(m.unit, lang),
      m.price,
      m.total,
    ]),
    ...data.works.map((w) => [
      labels.workRow,
      w.name,
      w.qty,
      formatUnit('pcs', lang),
      w.price,
      w.total,
    ]),
    [],
    [labels.grandTotal, data.grandTotal],
    [data.disclaimer],
  ])
  XLSX.utils.book_append_sheet(wb, sheet, labels.pdfTitle.slice(0, 31))
  XLSX.writeFile(wb, `simchi-estimate-${Date.now()}.xlsx`)
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

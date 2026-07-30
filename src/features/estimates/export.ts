import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

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

const FONT = 'DejaVuSans'
let fontsReady: Promise<void> | null = null
let regularB64 = ''
let boldB64 = ''

function money(n: number) {
  return `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} UZS`
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
          if (!r.ok) throw new Error('Не удалось загрузить шрифт DejaVuSans')
          return r.arrayBuffer()
        }),
        fetch(`${import.meta.env.BASE_URL}fonts/DejaVuSans-Bold.ttf`).then((r) => {
          if (!r.ok) throw new Error('Не удалось загрузить шрифт DejaVuSans-Bold')
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

function formatShortDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * jsPDF default fonts have no Cyrillic glyphs — embed DejaVu Sans.
 */
export async function exportEstimatePdf(data: EstimateExportPayload) {
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

  // Header
  doc.setFont(FONT, 'bold')
  doc.setFontSize(20)
  doc.setTextColor(63, 127, 241)
  text('SIMCHI', marginX, y)
  y += 8

  doc.setFont(FONT, 'bold')
  doc.setFontSize(14)
  doc.setTextColor(16, 24, 40)
  text('Смета электромонтажных работ', marginX, y)
  y += 8

  doc.setFont(FONT, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 90, 110)
  text(data.title || 'Без названия', marginX, y)
  y += 6
  if (data.clientName) {
    text(`Клиент: ${data.clientName}`, marginX, y)
    y += 5
  }
  if (data.address?.trim()) {
    text(`Адрес: ${data.address}`, marginX, y)
    y += 5
  }
  text(`Дата: ${formatShortDate(data.createdAt)}`, marginX, y)
  y += 5
  if (data.validUntil) {
    text(`Действует до: ${formatShortDate(data.validUntil)}`, marginX, y)
    y += 5
  }

  y += 3
  doc.setDrawColor(220, 228, 240)
  doc.setLineWidth(0.3)
  doc.line(marginX, y, pageW - marginX, y)
  y += 8

  // Totals box
  ensureSpace(28)
  doc.setFillColor(245, 248, 255)
  doc.roundedRect(marginX, y, contentW, 24, 2, 2, 'F')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 90, 110)
  text(`Материалы: ${money(data.materialsTotal)}`, marginX + 4, y + 7)
  text(`Работы: ${money(data.worksTotal)}`, marginX + 4, y + 13)
  doc.setFont(FONT, 'bold')
  doc.setFontSize(12)
  doc.setTextColor(16, 24, 40)
  text(`Итого: ${money(data.grandTotal)}`, marginX + 4, y + 20)
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

  // Materials
  drawSectionTitle('Материалы')
  if (data.materials.length === 0) {
    drawRow('Нет позиций', '—', true)
  } else {
    data.materials.forEach((m) => {
      drawRow(
        `${m.name} — ${m.qty} ${m.unit}`,
        money(m.total),
      )
    })
  }

  y += 4

  // Works
  drawSectionTitle('Работы')
  if (data.works.length === 0) {
    drawRow('Нет позиций', '—', true)
  } else {
    data.works.forEach((w) => {
      drawRow(`${w.name} — ${w.qty} шт`, money(w.total))
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
  text('Итого к оплате', marginX, y)
  text(money(data.grandTotal), pageW - marginX, y, { align: 'right' })
  y += 10

  ensureSpace(24)
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(116, 128, 148)
  const disclaimerLines = doc.splitTextToSize(data.disclaimer, contentW) as string[]
  text(disclaimerLines, marginX, y)

  doc.save(`simchi-smeta-${Date.now()}.pdf`)
}

export function exportEstimateCsv(data: EstimateExportPayload) {
  const rows = [
    ['Раздел', 'Название', 'Кол-во', 'Ед.', 'Цена', 'Сумма'],
    ...data.materials.map((m) => ['материал', m.name, m.qty, m.unit, m.price, m.total]),
    ...data.works.map((w) => ['работа', w.name, w.qty, 'шт', w.price, w.total]),
    ['итого', 'Общая сумма', '', '', '', data.grandTotal],
  ]
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  downloadBlob(`\uFEFF${csv}`, `simchi-smeta-${Date.now()}.csv`, 'text/csv;charset=utf-8')
}

export function exportEstimateXlsx(data: EstimateExportPayload) {
  const wb = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet([
    ['SIMCHI — смета', data.title],
    ['Клиент', data.clientName],
    ['Адрес', data.address],
    [],
    ['Раздел', 'Название', 'Кол-во', 'Ед.', 'Цена', 'Сумма'],
    ...data.materials.map((m) => ['материал', m.name, m.qty, m.unit, m.price, m.total]),
    ...data.works.map((w) => ['работа', w.name, w.qty, 'шт', w.price, w.total]),
    [],
    ['Итого', data.grandTotal],
    [data.disclaimer],
  ])
  XLSX.utils.book_append_sheet(wb, sheet, 'Смета')
  XLSX.writeFile(wb, `simchi-smeta-${Date.now()}.xlsx`)
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

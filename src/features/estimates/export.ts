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

function money(n: number) {
  return `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} UZS`
}

export function exportEstimatePdf(data: EstimateExportPayload) {
  const doc = new jsPDF()
  let y = 16
  const line = (text: string, size = 11) => {
    doc.setFontSize(size)
    doc.text(text, 14, y)
    y += size * 0.55 + 4
    if (y > 280) {
      doc.addPage()
      y = 16
    }
  }
  line('SIMCHI', 18)
  line(data.title, 14)
  line(`Client: ${data.clientName}`)
  line(`Address: ${data.address}`)
  line(`Materials: ${money(data.materialsTotal)}`)
  line(`Works: ${money(data.worksTotal)}`)
  line(`Total: ${money(data.grandTotal)}`, 13)
  line('')
  line('Materials:')
  data.materials.forEach((m) => line(`- ${m.name}: ${m.qty} ${m.unit} / ${money(m.total)}`))
  line('Works:')
  data.works.forEach((w) => line(`- ${w.name}: ${w.qty} / ${money(w.total)}`))
  line('')
  line(data.disclaimer, 9)
  doc.save(`simchi-estimate-${Date.now()}.pdf`)
}

export function exportEstimateCsv(data: EstimateExportPayload) {
  const rows = [
    ['Section', 'Name', 'Qty', 'Unit', 'Price', 'Total'],
    ...data.materials.map((m) => ['material', m.name, m.qty, m.unit, m.price, m.total]),
    ...data.works.map((w) => ['work', w.name, w.qty, 'шт', w.price, w.total]),
    ['total', 'Grand total', '', '', '', data.grandTotal],
  ]
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  downloadBlob(csv, `simchi-estimate-${Date.now()}.csv`, 'text/csv;charset=utf-8')
}

export function exportEstimateXlsx(data: EstimateExportPayload) {
  const wb = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet([
    ['SIMCHI Estimate', data.title],
    ['Client', data.clientName],
    ['Address', data.address],
    [],
    ['Section', 'Name', 'Qty', 'Unit', 'Price', 'Total'],
    ...data.materials.map((m) => ['material', m.name, m.qty, m.unit, m.price, m.total]),
    ...data.works.map((w) => ['work', w.name, w.qty, 'шт', w.price, w.total]),
    [],
    ['Grand total', data.grandTotal],
    [data.disclaimer],
  ])
  XLSX.utils.book_append_sheet(wb, sheet, 'Estimate')
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

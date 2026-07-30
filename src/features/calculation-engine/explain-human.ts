import type { CalculationTrace, MaterialLine } from './index'

const INPUT_LABELS: Record<string, string> = {
  panels_count: 'Количество электрощитов',
  points_count: 'Количество электрических точек',
  rooms_count: 'Количество помещений',
  rooms: 'Количество помещений',
  route_length: 'Длина маршрута',
  totalRoute: 'Маршрут внутри помещения',
  distance_to_panel: 'Расстояние до щита',
  distanceToPanel_m: 'Расстояние до щита',
  vertical: 'Вертикальные участки',
  separateLines: 'Отдельные линии',
  coefficient: 'Коэффициент',
  reserve_percent: 'Запас',
  sparePercent: 'Запас',
  quantity: 'Количество',
  device_points: 'Количество электрических точек',
  devicePoints: 'Количество электрических точек',
  cable_meters: 'Длина кабеля',
  deviceCode: 'Тип точки',
}

const UNIT_FOR_KEY: Record<string, string> = {
  totalRoute: 'м',
  route_length: 'м',
  distance_to_panel: 'м',
  distanceToPanel_m: 'м',
  vertical: 'м',
  cable_meters: 'м',
  reserve_percent: '%',
  sparePercent: '%',
}

function humanizeKey(key: string): string {
  if (INPUT_LABELS[key]) return INPUT_LABELS[key]
  // Never show snake_case / camelCase to the user
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\bm\b/gi, '')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase())
}

function formatInputValue(key: string, value: number | string | boolean): string {
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет'
  if (typeof value === 'string') return value
  const unit = UNIT_FOR_KEY[key]
  if (unit === '%') return `${value}%`
  if (unit) return `${value} ${unit}`
  return String(value)
}

export interface ExplanationSection {
  title: string
  lines: string[]
}

export interface HumanExplanation {
  title: string
  sections: ExplanationSection[]
  unavailable?: boolean
}

function materialKindTitle(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('кабель')) return `Почему добавлен кабель?`
  if (lower.includes('щит')) return `Почему добавлен электрощит?`
  if (lower.includes('розетк')) return `Почему добавлена розетка?`
  if (lower.includes('выключател')) return `Почему добавлен выключатель?`
  if (lower.includes('гофра')) return `Почему добавлена гофра?`
  if (lower.includes('подрозетник')) return `Почему добавлен подрозетник?`
  if (lower.includes('коробк')) return `Почему добавлена коробка?`
  return `Почему добавлено: ${name}?`
}

function formatCalcLine(line: MaterialLine, trace: CalculationTrace): string {
  const inputs = trace.inputs
  if ('quantity' in inputs && typeof inputs.quantity === 'number') {
    return `${inputs.quantity} × коэффициент ${trace.coefficient}`
  }
  if ('device_points' in inputs && typeof inputs.device_points === 'number') {
    return `${inputs.device_points} точек × коэффициент ${trace.coefficient}`
  }
  if ('rooms_count' in inputs && typeof inputs.rooms_count === 'number') {
    return `${inputs.rooms_count} помещ. × коэффициент ${trace.coefficient}`
  }
  if ('rooms' in inputs && typeof inputs.rooms === 'number' && 'totalRoute' in inputs) {
    return `Базовая длина с учётом маршрута и щита × коэффициент ${trace.coefficient}`
  }
  if ('cable_meters' in inputs && typeof inputs.cable_meters === 'number') {
    return `${inputs.cable_meters} м кабеля × 1.05 × коэффициент ${trace.coefficient}`
  }
  if ('panels_count' in inputs || line.name.toLowerCase().includes('щит')) {
    const count =
      typeof inputs.panels_count === 'number'
        ? inputs.panels_count
        : typeof inputs.quantity === 'number'
          ? inputs.quantity
          : 1
    return `${count} щит × коэффициент ${trace.coefficient}`
  }
  return `Исходные данные × коэффициент ${trace.coefficient}`
}

/**
 * Transform calculation traces into clear Russian sections.
 * Never exposes raw JSON or snake_case keys.
 */
export function formatMaterialExplanation(line: MaterialLine | null | undefined): HumanExplanation {
  if (!line?.trace) {
    return {
      title: 'Почему добавлено?',
      sections: [],
      unavailable: true,
    }
  }

  const trace = line.trace
  const inputEntries = Object.entries(trace.inputs).filter(([key]) => key !== 'deviceCode')

  const basisLines =
    inputEntries.length > 0
      ? inputEntries.map(([key, value]) => `${humanizeKey(key)}: ${formatInputValue(key, value)}`)
      : ['Данные расчёта недоступны']

  const spareLines =
    trace.sparePercent > 0 ? [`${trace.sparePercent}%`] : ['Не применяется']

  const unit = line.unit || 'шт'

  // Cable-style: show base length before spare
  const isCableLike =
    'totalRoute' in trace.inputs || 'distanceToPanel_m' in trace.inputs || line.unit === 'м'

  const sections: ExplanationSection[] = [
    { title: 'Основание', lines: basisLines },
  ]

  if (isCableLike && 'totalRoute' in trace.inputs) {
    const base =
      (typeof trace.inputs.totalRoute === 'number' ? trace.inputs.totalRoute : 0) +
      (typeof trace.inputs.distanceToPanel_m === 'number' ? trace.inputs.distanceToPanel_m : 0) +
      (typeof trace.inputs.vertical === 'number' ? trace.inputs.vertical : 0)
    sections.push({
      title: 'Базовая длина',
      lines: [`${Math.round(base * 100) / 100} м`],
    })
    sections.push({ title: 'Запас', lines: spareLines })
  } else {
    sections.push({
      title: 'Расчёт',
      lines: [formatCalcLine(line, trace)],
    })
    sections.push({ title: 'Запас', lines: spareLines })
    sections.push({
      title: 'Количество до округления',
      lines: [`${trace.beforeRound} ${unit}.`],
    })
  }

  sections.push({
    title: 'Итоговое количество',
    lines: [`${trace.finalQty} ${unit}.`],
  })

  return {
    title: materialKindTitle(line.name),
    sections,
  }
}

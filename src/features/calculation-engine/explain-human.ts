import i18n from '@/i18n'
import type { CalculationTrace, MaterialLine } from './index'

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

function t(key: string, opts?: Record<string, unknown>) {
  return i18n.t(key, opts)
}

function humanizeKey(key: string): string {
  const labelKey = `calc.explain.inputLabels.${key}`
  const translated = t(labelKey)
  if (translated !== labelKey) return translated
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\bm\b/gi, '')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase())
}

function formatInputValue(key: string, value: number | string | boolean): string {
  if (typeof value === 'boolean') return value ? t('calc.explain.yes') : t('calc.explain.no')
  if (typeof value === 'string') {
    // Translate device codes in inputs
    if (key === 'deviceCode') {
      const deviceKey = `project.devices.${value}`
      const translated = t(deviceKey)
      if (translated !== deviceKey) return translated
    }
    return value
  }
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
  if (lower.includes('кабель') || lower.includes('cable') || lower.includes('kabel')) {
    return t('calc.explain.whyCable')
  }
  if (lower.includes('щит') || lower.includes('panel') || lower.includes('shield')) {
    return t('calc.explain.whyPanel')
  }
  if (lower.includes('розетк') || lower.includes('socket') || lower.includes('rozetka')) {
    return t('calc.explain.whySocket')
  }
  if (lower.includes('выключател') || lower.includes('switch') || lower.includes('oʻchirgich') || lower.includes("o'chirgich")) {
    return t('calc.explain.whySwitch')
  }
  if (lower.includes('гофра') || lower.includes('conduit') || lower.includes('gofra')) {
    return t('calc.explain.whyConduit')
  }
  if (lower.includes('подрозетник') || lower.includes('mounting') || lower.includes('podrozetnik')) {
    return t('calc.explain.whyBox')
  }
  if (lower.includes('коробк') || lower.includes('junction') || lower.includes('quti')) {
    return t('calc.explain.whyJunction')
  }
  return t('calc.explain.whyNamed', { name })
}

function formatCalcLine(line: MaterialLine, trace: CalculationTrace): string {
  const inputs = trace.inputs
  const coefLabel = t('calc.explain.coefLabel')
  if ('quantity' in inputs && typeof inputs.quantity === 'number') {
    return t('calc.explain.qtyTimesCoef', {
      qty: inputs.quantity,
      coefLabel,
      coef: trace.coefficient,
    })
  }
  if ('device_points' in inputs && typeof inputs.device_points === 'number') {
    return t('calc.explain.pointsTimesCoef', {
      qty: inputs.device_points,
      pointsLabel: t('calc.explain.pointsShort'),
      coefLabel,
      coef: trace.coefficient,
    })
  }
  if ('rooms_count' in inputs && typeof inputs.rooms_count === 'number') {
    return t('calc.explain.roomsTimesCoef', {
      qty: inputs.rooms_count,
      roomsShort: t('calc.explain.roomsShort'),
      coefLabel,
      coef: trace.coefficient,
    })
  }
  if ('rooms' in inputs && typeof inputs.rooms === 'number' && 'totalRoute' in inputs) {
    return t('calc.explain.cableBaseTimesCoef', {
      coefLabel,
      coef: trace.coefficient,
    })
  }
  if ('cable_meters' in inputs && typeof inputs.cable_meters === 'number') {
    return t('calc.explain.cableMetersTimesCoef', {
      meters: inputs.cable_meters,
      metersUnit: t('calc.explain.metersCable'),
      coefLabel,
      coef: trace.coefficient,
    })
  }
  if ('panels_count' in inputs || line.name.toLowerCase().includes('щит') || line.ruleId === 'r-panel') {
    const count =
      typeof inputs.panels_count === 'number'
        ? inputs.panels_count
        : typeof inputs.quantity === 'number'
          ? inputs.quantity
          : 1
    return t('calc.explain.panelsTimesCoef', {
      qty: count,
      panelShort: t('calc.explain.panelShort'),
      coefLabel,
      coef: trace.coefficient,
    })
  }
  return t('calc.explain.inputsTimesCoef', {
    coefLabel,
    coef: trace.coefficient,
  })
}

/**
 * Transform calculation traces into clear localized sections.
 * Never exposes raw JSON or snake_case keys.
 */
export function formatMaterialExplanation(line: MaterialLine | null | undefined): HumanExplanation {
  if (!line?.trace) {
    return {
      title: t('calc.explain.whyAdded'),
      sections: [],
      unavailable: true,
    }
  }

  const trace = line.trace
  const inputEntries = Object.entries(trace.inputs).filter(([key]) => key !== 'deviceCode')

  const basisLines =
    inputEntries.length > 0
      ? inputEntries.map(([key, value]) => `${humanizeKey(key)}: ${formatInputValue(key, value)}`)
      : [t('calc.explain.unavailableData')]

  const spareLines =
    trace.sparePercent > 0 ? [`${trace.sparePercent}%`] : [t('calc.explain.notApplied')]

  const unit = line.unit || 'шт'

  const isCableLike =
    'totalRoute' in trace.inputs || 'distanceToPanel_m' in trace.inputs || line.unit === 'м'

  const sections: ExplanationSection[] = [
    { title: t('calc.explain.basis'), lines: basisLines },
  ]

  if (isCableLike && 'totalRoute' in trace.inputs) {
    const base =
      (typeof trace.inputs.totalRoute === 'number' ? trace.inputs.totalRoute : 0) +
      (typeof trace.inputs.distanceToPanel_m === 'number' ? trace.inputs.distanceToPanel_m : 0) +
      (typeof trace.inputs.vertical === 'number' ? trace.inputs.vertical : 0)
    sections.push({
      title: t('calc.explain.baseLength'),
      lines: [`${Math.round(base * 100) / 100} м`],
    })
    sections.push({ title: t('calc.explain.spare'), lines: spareLines })
  } else {
    sections.push({
      title: t('calc.explain.calculation'),
      lines: [formatCalcLine(line, trace)],
    })
    sections.push({ title: t('calc.explain.spare'), lines: spareLines })
    sections.push({
      title: t('calc.explain.beforeRound'),
      lines: [`${trace.beforeRound} ${unit}.`],
    })
  }

  sections.push({
    title: t('calc.explain.finalQty'),
    lines: [`${trace.finalQty} ${unit}.`],
  })

  // Prefer translated material name for kind detection
  const materialKey = `calc.materials.${line.ruleId}`
  const localizedName = t(materialKey)
  const nameForTitle = localizedName !== materialKey ? localizedName : line.name

  return {
    title: materialKindTitle(nameForTitle),
    sections,
  }
}

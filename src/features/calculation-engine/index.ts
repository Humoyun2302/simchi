/** UI uses `t('calc.disclaimer')`; kept empty so engine warnings stay code-based. */
export const CALC_DISCLAIMER = ''

export interface CalcRule {
  id: string
  name: string
  pointType: string
  formula: string
  unit: string
  coefficient: number
  sparePercent: number
  minQty: number
  rounding: 'ceil' | 'round' | 'pack'
  packSize: number
  version: number
  isActive: boolean
  warning?: string
  unitPrice: number
  category: string
}

export interface RoomInput {
  id: string
  name: string
  length_m: number
  width_m: number
  height_m: number
  area_m2: number
  perimeter_m: number
}

export interface PointInput {
  id: string
  roomId: string
  deviceCode: string
  quantity: number
  separateLine: boolean
  installHeight_m?: number | null
  customPower_w?: number | null
}

export interface CalcParams {
  distanceToPanel_m: number
  panelsCount: number
  panelFloor: number
  routingMethod: 'ceiling' | 'wall' | 'floor' | 'cable_channel'
  sparePercent: number
  complexityCoefficient: number
  worksBasePrice: number
}

export interface MaterialLine {
  id: string
  name: string
  category: string
  unit: string
  quantity: number
  quantityBeforeRound: number
  unitPrice: number
  totalPrice: number
  sparePercent: number
  coefficient: number
  formula: string
  warning?: string
  trace: CalculationTrace
  ruleId: string
}

export interface CalculationTrace {
  inputs: Record<string, number | string | boolean>
  formula: string
  coefficient: number
  sparePercent: number
  beforeRound: number
  finalQty: number
  manualOverride: number | null
}

export interface CalculationResult {
  materials: MaterialLine[]
  materialsTotal: number
  worksTotal: number
  grandTotal: number
  warnings: string[]
  pointsCount: number
}

/** Default rules — in production loaded from calculation_rules table */
export const DEFAULT_RULES: CalcRule[] = [
  {
    id: 'r-cable-vvng',
    name: 'Кабель ВВГнг 3×2.5',
    pointType: 'general_circuit',
    formula: '(room_route + distance_to_panel + vertical*3 + separate_lines*room_route*0.35) * coefficient',
    unit: 'м',
    coefficient: 1,
    sparePercent: 10,
    minQty: 5,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    warning: 'cableSection',
    unitPrice: 18_500,
    category: 'cables',
  },
  {
    id: 'r-socket',
    name: 'Розетка одинарная',
    pointType: 'socket_single',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 5,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 45_000,
    category: 'sockets',
  },
  {
    id: 'r-socket-double',
    name: 'Розетка двойная',
    pointType: 'socket_double',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 5,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 62_000,
    category: 'sockets',
  },
  {
    id: 'r-switch',
    name: 'Выключатель',
    pointType: 'switch',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 5,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 38_000,
    category: 'switches',
  },
  {
    id: 'r-pass-switch',
    name: 'Проходной выключатель',
    pointType: 'pass_switch',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 5,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 55_000,
    category: 'switches',
  },
  {
    id: 'r-light',
    name: 'Светильник',
    pointType: 'light',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 5,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 120_000,
    category: 'other',
  },
  {
    id: 'r-chandelier',
    name: 'Люстра',
    pointType: 'chandelier',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 0,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 450_000,
    category: 'other',
  },
  {
    id: 'r-ac',
    name: 'Линия кондиционера',
    pointType: 'ac',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 0,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 85_000,
    category: 'other',
    warning: 'acSection',
  },
  {
    id: 'r-tv',
    name: 'ТВ-точка',
    pointType: 'tv',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 5,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 48_000,
    category: 'sockets',
  },
  {
    id: 'r-fridge',
    name: 'Розетка холодильника',
    pointType: 'fridge',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 0,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 45_000,
    category: 'sockets',
  },
  {
    id: 'r-oven',
    name: 'Линия духовки',
    pointType: 'oven',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 0,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 95_000,
    category: 'other',
  },
  {
    id: 'r-stove',
    name: 'Линия электроплиты',
    pointType: 'stove',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 0,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 110_000,
    category: 'other',
  },
  {
    id: 'r-boiler',
    name: 'Линия бойлера',
    pointType: 'boiler',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 0,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 75_000,
    category: 'other',
  },
  {
    id: 'r-washer',
    name: 'Розетка стиральной машины',
    pointType: 'washer',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 0,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 45_000,
    category: 'sockets',
  },
  {
    id: 'r-dishwasher',
    name: 'Розетка посудомоечной машины',
    pointType: 'dishwasher',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 0,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 45_000,
    category: 'sockets',
  },
  {
    id: 'r-socket-inet',
    name: 'Интернет-розетка',
    pointType: 'socket_inet',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 5,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 52_000,
    category: 'sockets',
  },
  {
    id: 'r-socket-tv',
    name: 'Телевизионная розетка',
    pointType: 'socket_tv',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 5,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 48_000,
    category: 'sockets',
  },
  {
    id: 'r-floor-heating',
    name: 'Тёплый пол (контур)',
    pointType: 'floor_heating',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 0,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 280_000,
    category: 'other',
  },
  {
    id: 'r-ventilation',
    name: 'Вентиляция',
    pointType: 'ventilation',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 0,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 95_000,
    category: 'other',
  },
  {
    id: 'r-custom',
    name: 'Собственная точка',
    pointType: 'custom',
    formula: 'quantity * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 5,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 50_000,
    category: 'other',
  },
  {
    id: 'r-panel',
    name: 'Электрощит',
    pointType: 'panel',
    formula: 'panels_count * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 0,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 850_000,
    category: 'panels',
  },
  {
    id: 'r-box',
    name: 'Подрозетник',
    pointType: 'mounting_box',
    formula: 'device_points * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 8,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 8_500,
    category: 'mounting_boxes',
  },
  {
    id: 'r-conduit',
    name: 'Гофра 20 мм',
    pointType: 'conduit',
    formula: 'cable_meters * 1.05 * coefficient',
    unit: 'м',
    coefficient: 1,
    sparePercent: 10,
    minQty: 10,
    rounding: 'pack',
    packSize: 10,
    version: 1,
    isActive: true,
    unitPrice: 4_200,
    category: 'conduit',
  },
  {
    id: 'r-junction',
    name: 'Распределительная коробка',
    pointType: 'junction_box',
    formula: 'rooms_count * coefficient',
    unit: 'шт',
    coefficient: 1,
    sparePercent: 0,
    minQty: 1,
    rounding: 'ceil',
    packSize: 1,
    version: 1,
    isActive: true,
    unitPrice: 22_000,
    category: 'junction_boxes',
  },
]

function roundQty(value: number, rule: CalcRule): number {
  const withMin = Math.max(value, rule.minQty)
  if (rule.rounding === 'pack') {
    return Math.ceil(withMin / rule.packSize) * rule.packSize
  }
  if (rule.rounding === 'round') return Math.max(rule.minQty, Math.round(withMin))
  return Math.ceil(withMin)
}

function applySpare(value: number, sparePercent: number): number {
  return value * (1 + sparePercent / 100)
}

function roomRouteMeters(room: RoomInput, routing: CalcParams['routingMethod']): number {
  const base = room.perimeter_m * 0.45 + room.area_m2 * 0.15
  const routingFactor = routing === 'floor' ? 1.1 : routing === 'cable_channel' ? 1.05 : 1
  return base * routingFactor
}

export function calculateProjectMaterials(
  rooms: RoomInput[],
  points: PointInput[],
  params: CalcParams,
  rules: CalcRule[] = DEFAULT_RULES,
  manualOverrides: Record<string, number> = {},
): CalculationResult {
  const activeRules = rules.filter((r) => r.isActive)
  const warnings: string[] = CALC_DISCLAIMER ? [CALC_DISCLAIMER] : []
  const materials: MaterialLine[] = []

  const separateLines = points.filter((p) => p.separateLine).reduce((s, p) => s + p.quantity, 0)
  const totalRoute = rooms.reduce((s, r) => s + roomRouteMeters(r, params.routingMethod), 0)
  const vertical = Math.abs((params.panelFloor || 1) - 1) * 3 + rooms.reduce((s, r) => s + r.height_m * 0.2, 0)

  const cableRule = activeRules.find((r) => r.pointType === 'general_circuit')
  if (cableRule) {
    const spare = params.sparePercent || cableRule.sparePercent
    const raw =
      (totalRoute + params.distanceToPanel_m + vertical + separateLines * (totalRoute / Math.max(rooms.length, 1)) * 0.35) *
      cableRule.coefficient
    const beforeRound = applySpare(raw, spare)
    const finalQty = manualOverrides[cableRule.id] ?? roundQty(beforeRound, cableRule)
    const trace: CalculationTrace = {
      inputs: {
        totalRoute: Math.round(totalRoute * 100) / 100,
        distanceToPanel_m: params.distanceToPanel_m,
        vertical: Math.round(vertical * 100) / 100,
        separateLines,
        rooms: rooms.length,
      },
      formula: cableRule.formula,
      coefficient: cableRule.coefficient,
      sparePercent: spare,
      beforeRound: Math.round(beforeRound * 100) / 100,
      finalQty,
      manualOverride: manualOverrides[cableRule.id] ?? null,
    }
    materials.push({
      id: cableRule.id,
      name: cableRule.name,
      category: cableRule.category,
      unit: cableRule.unit,
      quantity: finalQty,
      quantityBeforeRound: trace.beforeRound,
      unitPrice: cableRule.unitPrice,
      totalPrice: finalQty * cableRule.unitPrice,
      sparePercent: spare,
      coefficient: cableRule.coefficient,
      formula: cableRule.formula,
      warning: cableRule.warning,
      trace,
      ruleId: cableRule.id,
    })
    if (cableRule.warning) warnings.push(cableRule.warning)
  }

  const byType = new Map<string, number>()
  for (const p of points) {
    byType.set(p.deviceCode, (byType.get(p.deviceCode) ?? 0) + p.quantity)
  }

  const derivedTypes = new Set(['general_circuit', 'mounting_box', 'conduit', 'junction_box', 'panel'])
  for (const [code, qty] of byType) {
    if (derivedTypes.has(code)) continue
    const rule = activeRules.find((r) => r.pointType === code)
    if (!rule) continue
    const spare = rule.sparePercent
    const beforeRound = applySpare(qty * rule.coefficient, spare)
    const finalQty = manualOverrides[rule.id] ?? roundQty(beforeRound, rule)
    materials.push({
      id: rule.id,
      name: rule.name,
      category: rule.category,
      unit: rule.unit,
      quantity: finalQty,
      quantityBeforeRound: Math.round(beforeRound * 100) / 100,
      unitPrice: rule.unitPrice,
      totalPrice: finalQty * rule.unitPrice,
      sparePercent: spare,
      coefficient: rule.coefficient,
      formula: rule.formula,
      warning: rule.warning,
      ruleId: rule.id,
      trace: {
        inputs: { quantity: qty, deviceCode: code },
        formula: rule.formula,
        coefficient: rule.coefficient,
        sparePercent: spare,
        beforeRound: Math.round(beforeRound * 100) / 100,
        finalQty,
        manualOverride: manualOverrides[rule.id] ?? null,
      },
    })
  }

  const devicePoints = points.reduce((s, p) => s + p.quantity, 0)
  const boxRule = activeRules.find((r) => r.pointType === 'mounting_box')
  if (boxRule && devicePoints > 0) {
    const beforeRound = applySpare(devicePoints * boxRule.coefficient, boxRule.sparePercent)
    const finalQty = manualOverrides[boxRule.id] ?? roundQty(beforeRound, boxRule)
    materials.push({
      id: boxRule.id,
      name: boxRule.name,
      category: boxRule.category,
      unit: boxRule.unit,
      quantity: finalQty,
      quantityBeforeRound: Math.round(beforeRound * 100) / 100,
      unitPrice: boxRule.unitPrice,
      totalPrice: finalQty * boxRule.unitPrice,
      sparePercent: boxRule.sparePercent,
      coefficient: boxRule.coefficient,
      formula: boxRule.formula,
      ruleId: boxRule.id,
      trace: {
        inputs: { device_points: devicePoints },
        formula: boxRule.formula,
        coefficient: boxRule.coefficient,
        sparePercent: boxRule.sparePercent,
        beforeRound: Math.round(beforeRound * 100) / 100,
        finalQty,
        manualOverride: manualOverrides[boxRule.id] ?? null,
      },
    })
  }

  const cableMeters = materials.find((m) => m.ruleId === 'r-cable-vvng')?.quantity ?? 0
  const conduitRule = activeRules.find((r) => r.pointType === 'conduit')
  if (conduitRule && cableMeters > 0) {
    const beforeRound = applySpare(cableMeters * 1.05 * conduitRule.coefficient, conduitRule.sparePercent)
    const finalQty = manualOverrides[conduitRule.id] ?? roundQty(beforeRound, conduitRule)
    materials.push({
      id: conduitRule.id,
      name: conduitRule.name,
      category: conduitRule.category,
      unit: conduitRule.unit,
      quantity: finalQty,
      quantityBeforeRound: Math.round(beforeRound * 100) / 100,
      unitPrice: conduitRule.unitPrice,
      totalPrice: finalQty * conduitRule.unitPrice,
      sparePercent: conduitRule.sparePercent,
      coefficient: conduitRule.coefficient,
      formula: conduitRule.formula,
      ruleId: conduitRule.id,
      trace: {
        inputs: { cable_meters: cableMeters },
        formula: conduitRule.formula,
        coefficient: conduitRule.coefficient,
        sparePercent: conduitRule.sparePercent,
        beforeRound: Math.round(beforeRound * 100) / 100,
        finalQty,
        manualOverride: manualOverrides[conduitRule.id] ?? null,
      },
    })
  }

  const junctionRule = activeRules.find((r) => r.pointType === 'junction_box')
  if (junctionRule && rooms.length > 0) {
    const beforeRound = applySpare(rooms.length * junctionRule.coefficient, junctionRule.sparePercent)
    const finalQty = manualOverrides[junctionRule.id] ?? roundQty(beforeRound, junctionRule)
    materials.push({
      id: junctionRule.id,
      name: junctionRule.name,
      category: junctionRule.category,
      unit: junctionRule.unit,
      quantity: finalQty,
      quantityBeforeRound: Math.round(beforeRound * 100) / 100,
      unitPrice: junctionRule.unitPrice,
      totalPrice: finalQty * junctionRule.unitPrice,
      sparePercent: junctionRule.sparePercent,
      coefficient: junctionRule.coefficient,
      formula: junctionRule.formula,
      ruleId: junctionRule.id,
      trace: {
        inputs: { rooms_count: rooms.length },
        formula: junctionRule.formula,
        coefficient: junctionRule.coefficient,
        sparePercent: junctionRule.sparePercent,
        beforeRound: Math.round(beforeRound * 100) / 100,
        finalQty,
        manualOverride: manualOverrides[junctionRule.id] ?? null,
      },
    })
  }

  const panelsCount = Math.max(1, params.panelsCount || 1)
  const panelRule = activeRules.find((r) => r.pointType === 'panel')
  if (panelRule) {
    const beforeRound = applySpare(panelsCount * panelRule.coefficient, panelRule.sparePercent)
    const finalQty = manualOverrides[panelRule.id] ?? roundQty(beforeRound, panelRule)
    materials.push({
      id: panelRule.id,
      name: panelRule.name,
      category: panelRule.category,
      unit: panelRule.unit,
      quantity: finalQty,
      quantityBeforeRound: Math.round(beforeRound * 100) / 100,
      unitPrice: panelRule.unitPrice,
      totalPrice: finalQty * panelRule.unitPrice,
      sparePercent: panelRule.sparePercent,
      coefficient: panelRule.coefficient,
      formula: panelRule.formula,
      ruleId: panelRule.id,
      trace: {
        inputs: { panels_count: panelsCount },
        formula: panelRule.formula,
        coefficient: panelRule.coefficient,
        sparePercent: panelRule.sparePercent,
        beforeRound: Math.round(beforeRound * 100) / 100,
        finalQty,
        manualOverride: manualOverrides[panelRule.id] ?? null,
      },
    })
  }

  const materialsTotal = materials.reduce((s, m) => s + m.totalPrice, 0)
  const baseWorks =
    params.worksBasePrice ||
    devicePoints * 85_000 + cableMeters * 12_000 + panelsCount * 450_000
  const worksTotal = Math.round(baseWorks * params.complexityCoefficient)
  const grandTotal = materialsTotal + worksTotal

  return {
    materials,
    materialsTotal,
    worksTotal,
    grandTotal,
    warnings: [...new Set(warnings)],
    pointsCount: devicePoints,
  }
}

export function explainLine(line: MaterialLine): CalculationTrace {
  return line.trace
}

export const DEVICE_TYPES = [
  { code: 'socket_single', nameRu: 'Обычная розетка' },
  { code: 'socket_double', nameRu: 'Двойная розетка' },
  { code: 'switch', nameRu: 'Выключатель' },
  { code: 'pass_switch', nameRu: 'Проходной выключатель' },
  { code: 'light', nameRu: 'Светильник' },
  { code: 'chandelier', nameRu: 'Люстра' },
  { code: 'ac', nameRu: 'Кондиционер' },
  { code: 'tv', nameRu: 'Телевизор' },
  { code: 'fridge', nameRu: 'Холодильник' },
  { code: 'oven', nameRu: 'Духовка' },
  { code: 'stove', nameRu: 'Электроплита' },
  { code: 'boiler', nameRu: 'Бойлер' },
  { code: 'washer', nameRu: 'Стиральная машина' },
  { code: 'dishwasher', nameRu: 'Посудомоечная машина' },
  { code: 'socket_inet', nameRu: 'Интернет-розетка' },
  { code: 'socket_tv', nameRu: 'Телевизионная розетка' },
  { code: 'floor_heating', nameRu: 'Тёплый пол' },
  { code: 'ventilation', nameRu: 'Вентиляция' },
  { code: 'custom', nameRu: 'Собственная точка' },
] as const

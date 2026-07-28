import type {
  ElectricalPoint,
  MaterialRequirement,
  Project,
  ProjectWorkItem,
  Room,
} from '@/types/database'
import {
  calculateProjectMaterials,
  DEVICE_TYPES,
  type CalcParams,
  type CalculationResult,
} from '@/features/calculation-engine'

export function resolveDeviceCode(point: ElectricalPoint): string {
  if (point.device_code) return point.device_code
  if (point.device_types?.code) return point.device_types.code
  const byName = DEVICE_TYPES.find((d) => d.nameRu === point.custom_name)
  return byName?.code ?? 'socket_single'
}

export function projectCalcParams(project: Project): CalcParams {
  return {
    distanceToPanel_m: project.distance_to_panel_m ?? 10,
    panelsCount: project.panels_count ?? 1,
    panelFloor: project.panel_floor ?? 1,
    routingMethod: project.routing_method ?? 'ceiling',
    sparePercent: project.spare_percent ?? 10,
    complexityCoefficient: project.complexity_coefficient ?? 1,
    worksBasePrice: 0,
  }
}

export function calculateForProject(
  project: Project,
  rooms: Room[],
  points: ElectricalPoint[],
  manualOverrides: Record<string, number> = {},
): CalculationResult {
  return calculateProjectMaterials(
    rooms.map((r) => ({
      id: r.id,
      name: r.name,
      length_m: r.length_m,
      width_m: r.width_m,
      height_m: r.height_m,
      area_m2: r.area_m2,
      perimeter_m: r.perimeter_m,
    })),
    points.map((p) => ({
      id: p.id,
      roomId: p.room_id,
      deviceCode: resolveDeviceCode(p),
      quantity: p.quantity,
      separateLine: p.separate_line,
      installHeight_m: p.install_height_m,
      customPower_w: p.custom_power_w,
    })),
    projectCalcParams(project),
    undefined,
    manualOverrides,
  )
}

export function materialsFromCalc(
  projectId: string,
  calc: CalculationResult,
  existing?: MaterialRequirement[],
): MaterialRequirement[] {
  const ts = new Date().toISOString()
  return calc.materials.map((m) => {
    const prev = existing?.find((e) => e.calculation_source === m.ruleId || e.id === m.id)
    const qty = prev?.manual_qty ?? m.quantity
    return {
      id: prev?.id ?? crypto.randomUUID(),
      project_id: projectId,
      name: m.name,
      category: m.category as MaterialRequirement['category'],
      brand: null,
      model: null,
      sku: null,
      unit: m.unit,
      calculated_qty: m.quantity,
      manual_qty: prev?.manual_qty ?? null,
      spare_percent: m.sparePercent,
      unit_price: m.unitPrice,
      supplier_id: null,
      total_price: qty * m.unitPrice,
      comment: null,
      calculation_source: m.ruleId,
      calculation_trace: m.trace as unknown as Record<string, unknown>,
      created_at: prev?.created_at ?? ts,
      updated_at: ts,
      deleted_at: null,
    }
  })
}

export function worksFromCalc(
  projectId: string,
  calc: CalculationResult,
  complexity: number,
): ProjectWorkItem[] {
  const ts = new Date().toISOString()
  const cableMeters =
    calc.materials.find((m) => m.ruleId === 'r-cable-vvng')?.quantity ?? 0
  const socketQty = calc.materials
    .filter((m) => m.category === 'sockets')
    .reduce((s, m) => s + m.quantity, 0)
  const switchQty = calc.materials
    .filter((m) => m.category === 'switches')
    .reduce((s, m) => s + m.quantity, 0)
  const lightQty = calc.materials
    .filter((m) => ['r-light', 'r-chandelier'].includes(m.ruleId))
    .reduce((s, m) => s + m.quantity, 0)
  const panels =
    calc.materials.find((m) => m.ruleId === 'r-panel')?.quantity ?? 1

  const lines = [
    { work_type: 'socket_install', name: 'Установка розетки', quantity: Math.max(socketQty, 0), unit_price: 85_000 },
    { work_type: 'switch_install', name: 'Установка выключателя', quantity: Math.max(switchQty, 0), unit_price: 75_000 },
    { work_type: 'light_install', name: 'Установка светильника', quantity: Math.max(lightQty, 0), unit_price: 95_000 },
    { work_type: 'cable_laying', name: 'Прокладка кабеля', quantity: Math.max(Math.round(cableMeters), 1), unit_price: 12_000 },
    { work_type: 'panel_assembly', name: 'Сборка щита', quantity: panels, unit_price: 450_000 },
  ].filter((l) => l.quantity > 0)

  // If calculation produced a works total but line items don't match, keep a residual line
  const items: ProjectWorkItem[] = lines.map((w) => ({
    id: crypto.randomUUID(),
    project_id: projectId,
    work_price_item_id: null,
    name: w.name,
    work_type: w.work_type,
    quantity: w.quantity,
    unit_price: w.unit_price,
    complexity_coefficient: complexity,
    discount_percent: 0,
    total_price: Math.round(w.quantity * w.unit_price * complexity),
    comment: null,
    created_at: ts,
    updated_at: ts,
    deleted_at: null,
  }))

  const linesTotal = items.reduce((s, i) => s + i.total_price, 0)
  if (calc.worksTotal > 0 && Math.abs(linesTotal - calc.worksTotal) > 1000) {
    items.push({
      id: crypto.randomUUID(),
      project_id: projectId,
      work_price_item_id: null,
      name: 'Прочие электромонтажные работы',
      work_type: 'misc',
      quantity: 1,
      unit_price: Math.max(0, calc.worksTotal - linesTotal),
      complexity_coefficient: 1,
      discount_percent: 0,
      total_price: Math.max(0, calc.worksTotal - linesTotal),
      comment: null,
      created_at: ts,
      updated_at: ts,
      deleted_at: null,
    })
  }

  return items
}

export function stripPointForDb(point: ElectricalPoint) {
  const { device_code: _code, device_types: _types, ...row } = point
  void _code
  void _types
  return row
}

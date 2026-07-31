import type { TFunction } from 'i18next'
import { DEFAULT_RULES } from '@/features/calculation-engine'

/** Map legacy Russian material names → rule ids for old demo/DB rows */
const MATERIAL_NAME_ALIASES: Record<string, string> = Object.fromEntries(
  DEFAULT_RULES.map((r) => [r.name, r.id]),
)

const CATALOG_NAME_ALIASES: Record<string, string> = {
  'Кабель ВВГнг 3×2.5': 'cable_vvg_3x25',
  'Кабель ВВГнг 3×1.5': 'cable_vvg_3x15',
  'Розетка одинарная': 'socket_single',
  'Розетка двойная': 'socket_double',
  'Выключатель 1-кл': 'switch_1k',
  'Подрозетник': 'mounting_box',
  'Гофра 20 мм': 'conduit_20',
  'Кабель-канал 40×25': 'cable_channel_40x25',
  'Щит 12 модулей': 'panel_12',
  'Автомат 16A': 'breaker_16a',
}

export function translateMaterialName(
  t: TFunction,
  opts: { name: string; ruleId?: string | null; calculationSource?: string | null },
): string {
  const ruleId = opts.ruleId || opts.calculationSource || MATERIAL_NAME_ALIASES[opts.name]
  if (ruleId) {
    const key = `calc.materials.${ruleId}`
    const translated = t(key)
    if (translated !== key) return translated
  }
  const catalogKey = CATALOG_NAME_ALIASES[opts.name]
  if (catalogKey) {
    const key = `catalog.items.${catalogKey}`
    const translated = t(key)
    if (translated !== key) return translated
  }
  return opts.name
}

export function translateDeviceName(t: TFunction, code: string, fallback?: string | null): string {
  const key = `project.devices.${code}`
  const translated = t(key)
  if (translated !== key) return translated
  return fallback || code
}

export function translateWorkName(
  t: TFunction,
  workType: string | null | undefined,
  fallbackName?: string | null,
): string {
  if (workType) {
    const key = `project.workTypes.${workType}`
    const translated = t(key)
    if (translated !== key) return translated
  }
  return fallbackName || workType || ''
}

export function translateCategory(t: TFunction, category: string): string {
  const key = `project.materialCategories.${category}`
  const translated = t(key)
  if (translated !== key) return translated
  return category
}

export function translateWarning(t: TFunction, warning: string | null | undefined): string {
  if (!warning) return ''
  const codeKey = `calc.warnings.${warning}`
  const byCode = t(codeKey)
  if (byCode !== codeKey) return byCode
  if (warning.includes('кондиционер') || warning.toLowerCase().includes('air conditioner')) {
    return t('calc.warnings.acSection')
  }
  if (warning.includes('Сечение') || warning.toLowerCase().includes('cross-section')) {
    return t('calc.warnings.cableSection')
  }
  return warning
}

export function translateRole(t: TFunction, role: string): string {
  const key = `roles.${role}`
  const translated = t(key)
  if (translated !== key) return translated
  return role
}

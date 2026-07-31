import type { OrderStatus, ProjectStatus } from '@/types/database'

/**
 * Canonical project status codes stored in DB / used in UI keys.
 * Legacy Russian labels and alternate aliases map into these codes.
 */
const PROJECT_STATUS_ALIASES: Record<string, ProjectStatus> = {
  draft: 'draft',
  calculated: 'calculated',
  sent: 'sent',
  sent_to_client: 'sent',
  pending_approval: 'pending_approval',
  awaiting_approval: 'pending_approval',
  confirmed: 'confirmed',
  approved: 'confirmed',
  rejected: 'rejected',
  materials_ordered: 'materials_ordered',
  completed: 'completed',
  // Legacy Russian labels (if any old rows exist)
  Черновик: 'draft',
  Рассчитано: 'calculated',
  'Отправлено клиенту': 'sent',
  'На согласовании': 'pending_approval',
  Подтверждено: 'confirmed',
  'Материалы заказаны': 'materials_ordered',
  Завершено: 'completed',
  Отклонено: 'rejected',
}

export function normalizeProjectStatus(value: string | null | undefined): ProjectStatus {
  if (!value) return 'draft'
  return PROJECT_STATUS_ALIASES[value] ?? (value as ProjectStatus)
}

export function projectStatusI18nKey(value: string | null | undefined): string {
  return `project.statuses.${normalizeProjectStatus(value)}`
}

const ORDER_STATUS_ALIASES: Record<string, OrderStatus> = {
  draft: 'draft',
  sent: 'sent',
  confirmed_by_supplier: 'confirmed_by_supplier',
  assembling: 'assembling',
  ready_for_pickup: 'ready_for_pickup',
  in_delivery: 'in_delivery',
  received: 'received',
  cancelled: 'cancelled',
  partially_returned: 'partially_returned',
  returned: 'returned',
}

export function normalizeOrderStatus(value: string | null | undefined): OrderStatus {
  if (!value) return 'draft'
  return ORDER_STATUS_ALIASES[value] ?? (value as OrderStatus)
}

export function orderStatusI18nKey(value: string | null | undefined): string {
  return `orders.statuses.${normalizeOrderStatus(value)}`
}

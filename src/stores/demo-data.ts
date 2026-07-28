import type {
  Client,
  ElectricalPoint,
  MaterialRequirement,
  Order,
  Project,
  ProjectStatus,
  ProjectWorkItem,
  Room,
  Supplier,
  Profile,
} from '@/types/database'
import {
  calculateForProject,
  materialsFromCalc,
  worksFromCalc,
} from '@/lib/project-recalc'

export const DEMO_PROFILE: Profile = {
  id: 'demo-electrician',
  email: 'aziz@simchi.uz',
  full_name: 'Азиз Рахимов',
  phone: '+998 90 123 45 67',
  city: 'Ташкент',
  company_name: 'Simchi Electro',
  role: 'electrician',
  is_blocked: false,
  avatar_url: null,
  locale: 'ru',
  created_at: '2026-03-01T10:00:00Z',
  updated_at: '2026-03-20T10:00:00Z',
  deleted_at: null,
}

export const DEMO_CLIENTS: Client[] = [
  {
    id: 'c1',
    electrician_id: DEMO_PROFILE.id,
    full_name: 'Жахонгир Каримов',
    phone: '+998 91 700 11 22',
    telegram: '@jahongir_k',
    comment: 'Квартира в Яшнабаде',
    city: 'Ташкент',
    created_at: '2026-03-02T09:00:00Z',
    updated_at: '2026-03-02T09:00:00Z',
    deleted_at: null,
  },
  {
    id: 'c2',
    electrician_id: DEMO_PROFILE.id,
    full_name: 'Нилуфар Юсупова',
    phone: '+998 93 505 33 44',
    telegram: null,
    comment: 'Частный дом',
    city: 'Самарканд',
    created_at: '2026-03-05T09:00:00Z',
    updated_at: '2026-03-05T09:00:00Z',
    deleted_at: null,
  },
  {
    id: 'c3',
    electrician_id: DEMO_PROFILE.id,
    full_name: 'ООО Fresh Market',
    phone: '+998 71 200 55 66',
    telegram: '@fresh_market',
    comment: 'Магазин на Чиланзаре',
    city: 'Ташкент',
    created_at: '2026-03-08T09:00:00Z',
    updated_at: '2026-03-08T09:00:00Z',
    deleted_at: null,
  },
]

const ts = (iso: string) => iso

export const DEMO_ROOMS: Record<string, Room[]> = {
  p1: [
    {
      id: 'r1',
      project_id: 'p1',
      name: 'Кухня',
      room_type: 'kitchen',
      length_m: 4,
      width_m: 3.2,
      height_m: 2.7,
      area_m2: 12.8,
      perimeter_m: 14.4,
      wall_material: 'Гипсокартон',
      ceiling_material: 'Натяжной',
      comment: null,
      sort_order: 0,
      created_at: ts('2026-03-10T08:00:00Z'),
      updated_at: ts('2026-03-10T08:00:00Z'),
      deleted_at: null,
    },
    {
      id: 'r2',
      project_id: 'p1',
      name: 'Спальня',
      room_type: 'bedroom',
      length_m: 4.5,
      width_m: 3.5,
      height_m: 2.7,
      area_m2: 15.75,
      perimeter_m: 16,
      wall_material: 'Штукатурка',
      ceiling_material: 'Гипсокартон',
      comment: null,
      sort_order: 1,
      created_at: ts('2026-03-10T08:00:00Z'),
      updated_at: ts('2026-03-10T08:00:00Z'),
      deleted_at: null,
    },
    {
      id: 'r3',
      project_id: 'p1',
      name: 'Гостиная',
      room_type: 'living_room',
      length_m: 5.5,
      width_m: 4,
      height_m: 2.7,
      area_m2: 22,
      perimeter_m: 19,
      wall_material: 'Штукатурка',
      ceiling_material: 'Натяжной',
      comment: null,
      sort_order: 2,
      created_at: ts('2026-03-10T08:00:00Z'),
      updated_at: ts('2026-03-10T08:00:00Z'),
      deleted_at: null,
    },
    {
      id: 'r4',
      project_id: 'p1',
      name: 'Коридор',
      room_type: 'hallway',
      length_m: 3,
      width_m: 1.4,
      height_m: 2.7,
      area_m2: 4.2,
      perimeter_m: 8.8,
      wall_material: 'Обои',
      ceiling_material: 'Гипсокартон',
      comment: null,
      sort_order: 3,
      created_at: ts('2026-03-10T08:00:00Z'),
      updated_at: ts('2026-03-10T08:00:00Z'),
      deleted_at: null,
    },
  ],
  p2: [
    {
      id: 'r2-1',
      project_id: 'p2',
      name: 'Гостиная',
      room_type: 'living_room',
      length_m: 6,
      width_m: 5,
      height_m: 3,
      area_m2: 30,
      perimeter_m: 22,
      wall_material: 'Кирпич',
      ceiling_material: 'Гипсокартон',
      comment: null,
      sort_order: 0,
      created_at: ts('2026-03-12T08:00:00Z'),
      updated_at: ts('2026-03-12T08:00:00Z'),
      deleted_at: null,
    },
    {
      id: 'r2-2',
      project_id: 'p2',
      name: 'Кухня',
      room_type: 'kitchen',
      length_m: 4,
      width_m: 3.5,
      height_m: 3,
      area_m2: 14,
      perimeter_m: 15,
      wall_material: 'Кирпич',
      ceiling_material: 'Натяжной',
      comment: null,
      sort_order: 1,
      created_at: ts('2026-03-12T08:00:00Z'),
      updated_at: ts('2026-03-12T08:00:00Z'),
      deleted_at: null,
    },
  ],
  p3: [
    {
      id: 'r3-1',
      project_id: 'p3',
      name: 'Торговый зал',
      room_type: 'other',
      length_m: 12,
      width_m: 8,
      height_m: 3.2,
      area_m2: 96,
      perimeter_m: 40,
      wall_material: 'Бетон',
      ceiling_material: 'Armstrong',
      comment: null,
      sort_order: 0,
      created_at: ts('2026-03-14T08:00:00Z'),
      updated_at: ts('2026-03-14T08:00:00Z'),
      deleted_at: null,
    },
    {
      id: 'r3-2',
      project_id: 'p3',
      name: 'Склад',
      room_type: 'technical',
      length_m: 5,
      width_m: 4,
      height_m: 3.2,
      area_m2: 20,
      perimeter_m: 18,
      wall_material: 'Бетон',
      ceiling_material: 'Открытый',
      comment: null,
      sort_order: 1,
      created_at: ts('2026-03-14T08:00:00Z'),
      updated_at: ts('2026-03-14T08:00:00Z'),
      deleted_at: null,
    },
  ],
  p4: [
    {
      id: 'r4-1',
      project_id: 'p4',
      name: 'Open space',
      room_type: 'office',
      length_m: 8,
      width_m: 6,
      height_m: 2.8,
      area_m2: 48,
      perimeter_m: 28,
      wall_material: null,
      ceiling_material: null,
      comment: null,
      sort_order: 0,
      created_at: ts('2026-03-24T08:00:00Z'),
      updated_at: ts('2026-03-24T08:00:00Z'),
      deleted_at: null,
    },
    {
      id: 'r4-2',
      project_id: 'p4',
      name: 'Переговорная',
      room_type: 'office',
      length_m: 4,
      width_m: 3,
      height_m: 2.8,
      area_m2: 12,
      perimeter_m: 14,
      wall_material: null,
      ceiling_material: null,
      comment: null,
      sort_order: 1,
      created_at: ts('2026-03-24T08:00:00Z'),
      updated_at: ts('2026-03-24T08:00:00Z'),
      deleted_at: null,
    },
  ],
}

function point(
  id: string,
  projectId: string,
  roomId: string,
  code: string,
  name: string,
  quantity: number,
  separate = false,
): ElectricalPoint {
  return {
    id,
    room_id: roomId,
    project_id: projectId,
    device_type_id: null,
    device_code: code,
    custom_name: name,
    quantity,
    install_height_m: code.includes('switch') || code === 'light' || code === 'chandelier' ? 1.1 : 0.3,
    separate_line: separate,
    comment: null,
    custom_power_w: null,
    photo_url: null,
    created_at: ts('2026-03-10T08:00:00Z'),
    updated_at: ts('2026-03-10T08:00:00Z'),
    deleted_at: null,
  }
}

export const DEMO_POINTS: Record<string, ElectricalPoint[]> = {
  p1: [
    point('pt1', 'p1', 'r1', 'socket_single', 'Обычная розетка', 6),
    point('pt2', 'p1', 'r1', 'socket_double', 'Двойная розетка', 2),
    point('pt3', 'p1', 'r1', 'fridge', 'Холодильник', 1, true),
    point('pt4', 'p1', 'r1', 'switch', 'Выключатель', 2),
    point('pt5', 'p1', 'r1', 'light', 'Светильник', 3),
    point('pt6', 'p1', 'r2', 'socket_single', 'Обычная розетка', 5),
    point('pt7', 'p1', 'r2', 'switch', 'Выключатель', 2),
    point('pt8', 'p1', 'r2', 'chandelier', 'Люстра', 1),
    point('pt9', 'p1', 'r2', 'ac', 'Кондиционер', 1, true),
    point('pt10', 'p1', 'r3', 'socket_single', 'Обычная розетка', 8),
    point('pt11', 'p1', 'r3', 'socket_tv', 'Телевизионная розетка', 1),
    point('pt12', 'p1', 'r3', 'switch', 'Выключатель', 3),
    point('pt13', 'p1', 'r3', 'light', 'Светильник', 4),
    point('pt14', 'p1', 'r4', 'socket_single', 'Обычная розетка', 2),
    point('pt15', 'p1', 'r4', 'switch', 'Выключатель', 1),
    point('pt16', 'p1', 'r4', 'light', 'Светильник', 2),
  ],
  p2: [
    point('pt2-1', 'p2', 'r2-1', 'socket_single', 'Обычная розетка', 10),
    point('pt2-2', 'p2', 'r2-1', 'switch', 'Выключатель', 4),
    point('pt2-3', 'p2', 'r2-1', 'chandelier', 'Люстра', 2),
    point('pt2-4', 'p2', 'r2-1', 'ac', 'Кондиционер', 2, true),
    point('pt2-5', 'p2', 'r2-2', 'socket_single', 'Обычная розетка', 8),
    point('pt2-6', 'p2', 'r2-2', 'stove', 'Электроплита', 1, true),
    point('pt2-7', 'p2', 'r2-2', 'washer', 'Стиральная машина', 1, true),
    point('pt2-8', 'p2', 'r2-2', 'switch', 'Выключатель', 2),
    point('pt2-9', 'p2', 'r2-2', 'light', 'Светильник', 4),
  ],
  p3: [
    point('pt3-1', 'p3', 'r3-1', 'socket_single', 'Обычная розетка', 20),
    point('pt3-2', 'p3', 'r3-1', 'light', 'Светильник', 24),
    point('pt3-3', 'p3', 'r3-1', 'switch', 'Выключатель', 6),
    point('pt3-4', 'p3', 'r3-1', 'socket_inet', 'Интернет-розетка', 4),
    point('pt3-5', 'p3', 'r3-2', 'socket_single', 'Обычная розетка', 6),
    point('pt3-6', 'p3', 'r3-2', 'light', 'Светильник', 4),
    point('pt3-7', 'p3', 'r3-2', 'switch', 'Выключатель', 2),
  ],
  p4: [],
}

export const DEMO_SUPPLIERS: Supplier[] = [
  {
    id: 's1',
    owner_profile_id: null,
    name: 'ElectroMarket Tashkent',
    logo_url: null,
    description: 'Кабели, автоматы и розетки оптом',
    city: 'Ташкент',
    address: 'Сергели, склад 4',
    phone: '+998 71 150 20 20',
    telegram: '@electromarket',
    website: 'https://electromarket.uz',
    rating: 4.8,
    delivery_terms: 'Доставка по городу от 150 000 UZS',
    min_order_amount: 1_000_000,
    electrician_discount_percent: 3,
    platform_commission_percent: 3,
    verification_status: 'verified',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    deleted_at: null,
  },
  {
    id: 's2',
    owner_profile_id: null,
    name: 'Kabel Pro',
    logo_url: null,
    description: 'Специализация на кабельной продукции',
    city: 'Ташкент',
    address: 'Юнусабад-12',
    phone: '+998 71 230 44 55',
    telegram: '@kabelpro',
    website: null,
    rating: 4.6,
    delivery_terms: 'Самовывоз / доставка 1–2 дня',
    min_order_amount: 500_000,
    electrician_discount_percent: 2,
    platform_commission_percent: 3,
    verification_status: 'verified',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    deleted_at: null,
  },
  {
    id: 's3',
    owner_profile_id: null,
    name: 'SamElektro',
    logo_url: null,
    description: 'Поставщик для Самарканда и региона',
    city: 'Самарканд',
    address: 'ул. Регистанская, 8',
    phone: '+998 66 233 11 00',
    telegram: null,
    website: null,
    rating: 4.4,
    delivery_terms: 'По области 2–3 дня',
    min_order_amount: 800_000,
    electrician_discount_percent: 2.5,
    platform_commission_percent: 3,
    verification_status: 'verified',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    deleted_at: null,
  },
]

export const DEMO_ORDERS: Order[] = [
  {
    id: 'o1',
    electrician_id: DEMO_PROFILE.id,
    supplier_id: 's1',
    project_id: 'p3',
    estimate_id: null,
    status: 'assembling',
    subtotal: 15_600_000,
    discount_total: 468_000,
    delivery_total: 180_000,
    commission_total: 454_000,
    grand_total: 15_312_000,
    notes: 'Срочный заказ витринного освещения',
    created_at: '2026-03-20T10:00:00Z',
    updated_at: '2026-03-22T10:00:00Z',
    deleted_at: null,
    suppliers: DEMO_SUPPLIERS[0],
  },
  {
    id: 'o2',
    electrician_id: DEMO_PROFILE.id,
    supplier_id: 's2',
    project_id: 'p2',
    estimate_id: null,
    status: 'confirmed_by_supplier',
    subtotal: 18_200_000,
    discount_total: 364_000,
    delivery_total: 250_000,
    commission_total: 535_000,
    grand_total: 18_086_000,
    notes: null,
    created_at: '2026-03-18T10:00:00Z',
    updated_at: '2026-03-19T10:00:00Z',
    deleted_at: null,
    suppliers: DEMO_SUPPLIERS[1],
  },
]

function buildProjectBase(
  partial: Omit<Project, 'materials_total' | 'works_total' | 'grand_total' | 'rooms_count'> & {
    materials_total?: number
    works_total?: number
    grand_total?: number
    rooms_count?: number
  },
): Project {
  return {
    materials_total: 0,
    works_total: 0,
    grand_total: 0,
    rooms_count: DEMO_ROOMS[partial.id]?.length ?? 0,
    ...partial,
  }
}

const PROJECT_BASES: Project[] = [
  buildProjectBase({
    id: 'p1',
    electrician_id: DEMO_PROFILE.id,
    client_id: 'c1',
    title: 'Квартира 78 м² — Яшнабад',
    address: 'ул. Бабура, 45',
    city: 'Ташкент',
    object_type: 'apartment',
    work_kind: 'renovation',
    floors_count: 1,
    wiring_type: 'hidden',
    note: 'Замена проводки в 4 помещениях',
    status: 'pending_approval',
    distance_to_panel_m: 12,
    panels_count: 1,
    panel_floor: 1,
    routing_method: 'ceiling',
    spare_percent: 10,
    complexity_coefficient: 1.1,
    created_at: '2026-03-10T08:00:00Z',
    updated_at: '2026-03-22T14:00:00Z',
    deleted_at: null,
    clients: DEMO_CLIENTS[0],
  }),
  buildProjectBase({
    id: 'p2',
    electrician_id: DEMO_PROFILE.id,
    client_id: 'c2',
    title: 'Частный дом — Самарканд',
    address: 'массив Ургут, 12',
    city: 'Самарканд',
    object_type: 'private_house',
    work_kind: 'new',
    floors_count: 2,
    wiring_type: 'combined',
    note: null,
    status: 'confirmed',
    distance_to_panel_m: 18,
    panels_count: 2,
    panel_floor: 1,
    routing_method: 'wall',
    spare_percent: 12,
    complexity_coefficient: 1.25,
    created_at: '2026-03-12T08:00:00Z',
    updated_at: '2026-03-21T11:00:00Z',
    deleted_at: null,
    clients: DEMO_CLIENTS[1],
  }),
  buildProjectBase({
    id: 'p3',
    electrician_id: DEMO_PROFILE.id,
    client_id: 'c3',
    title: 'Магазин Fresh Market',
    address: 'Чиланзар-9, блок А',
    city: 'Ташкент',
    object_type: 'shop',
    work_kind: 'renovation',
    floors_count: 1,
    wiring_type: 'open',
    note: 'Витринное освещение',
    status: 'materials_ordered',
    distance_to_panel_m: 9,
    panels_count: 1,
    panel_floor: 1,
    routing_method: 'cable_channel',
    spare_percent: 8,
    complexity_coefficient: 1,
    created_at: '2026-03-14T08:00:00Z',
    updated_at: '2026-03-23T09:00:00Z',
    deleted_at: null,
    clients: DEMO_CLIENTS[2],
  }),
  buildProjectBase({
    id: 'p4',
    electrician_id: DEMO_PROFILE.id,
    client_id: 'c1',
    title: 'Офис коворкинга — черновик',
    address: 'Мирабад, 3 этаж',
    city: 'Ташкент',
    object_type: 'office',
    work_kind: 'new',
    floors_count: 1,
    wiring_type: 'hidden',
    note: 'Черновик замеров',
    status: 'draft',
    distance_to_panel_m: null,
    panels_count: 1,
    panel_floor: null,
    routing_method: null,
    spare_percent: 10,
    complexity_coefficient: 1,
    created_at: '2026-03-24T08:00:00Z',
    updated_at: '2026-03-24T16:00:00Z',
    deleted_at: null,
    clients: DEMO_CLIENTS[0],
  }),
]

function seedCalcData() {
  const materials: Record<string, MaterialRequirement[]> = {}
  const works: Record<string, ProjectWorkItem[]> = {}
  const projects = PROJECT_BASES.map((project) => {
    const rooms = DEMO_ROOMS[project.id] ?? []
    const points = DEMO_POINTS[project.id] ?? []
    if (project.status === 'draft' || points.length === 0) {
      materials[project.id] = []
      works[project.id] = []
      return project
    }
    const calc = calculateForProject(project, rooms, points)
    materials[project.id] = materialsFromCalc(project.id, calc)
    works[project.id] = worksFromCalc(project.id, calc, project.complexity_coefficient)
    const worksTotal = works[project.id].reduce((s, w) => s + w.total_price, 0)
    return {
      ...project,
      materials_total: calc.materialsTotal,
      works_total: worksTotal,
      grand_total: calc.materialsTotal + worksTotal,
      rooms_count: rooms.length,
    }
  })
  return { projects, materials, works }
}

const seeded = seedCalcData()
export const DEMO_PROJECTS: Project[] = seeded.projects
export const DEMO_MATERIALS: Record<string, MaterialRequirement[]> = seeded.materials
export const DEMO_WORKS: Record<string, ProjectWorkItem[]> = seeded.works

export function getHomeStats(projects: Project[]) {
  const estimatesTotal = projects.reduce((s, p) => s + p.grand_total, 0)
  const materialsOrdered = projects
    .filter((p) => p.status === 'materials_ordered' || p.status === 'completed')
    .reduce((s, p) => s + p.materials_total, 0)
  const clientSavings = Math.round(estimatesTotal * 0.028)
  const activeProjects = projects.filter(
    (p) => !['completed', 'rejected'].includes(p.status),
  ).length
  return { estimatesTotal, materialsOrdered, clientSavings, activeProjects }
}

export function filterProjects(
  projects: Project[],
  status: string,
  query: string,
): Project[] {
  return projects.filter((p) => {
    const statusOk = status === 'all' || p.status === (status as ProjectStatus)
    const q = query.trim().toLowerCase()
    const queryOk =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.address ?? '').toLowerCase().includes(q) ||
      (p.clients?.full_name ?? '').toLowerCase().includes(q)
    return statusOk && queryOk
  })
}

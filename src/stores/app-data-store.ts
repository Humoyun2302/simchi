import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Client,
  ElectricalPoint,
  MaterialRequirement,
  ObjectType,
  Order,
  Project,
  ProjectStatus,
  ProjectWorkItem,
  Room,
  RoutingMethod,
  WiringType,
  WorkKind,
} from '@/types/database'
import {
  DEMO_CLIENTS,
  DEMO_MATERIALS,
  DEMO_ORDERS,
  DEMO_POINTS,
  DEMO_PROJECTS,
  DEMO_ROOMS,
  DEMO_SUPPLIERS,
  DEMO_WORKS,
} from '@/stores/demo-data'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { calcArea, calcPerimeter } from '@/lib/utils'
import { normalizeUzbekPhone } from '@/lib/phone'
import {
  calculateProjectMaterials,
  DEVICE_TYPES,
  type CalcParams,
} from '@/features/calculation-engine'
import { saveOfflineDraft, loadOfflineDraft } from '@/features/offline/db'
import {
  calculateForProject,
  materialsFromCalc,
  stripPointForDb,
  worksFromCalc,
} from '@/lib/project-recalc'

export interface WizardParams {
  distanceToPanel_m: number | null
  panelsCount: number | null
  panelFloor: number | null
  routingMethod: CalcParams['routingMethod']
  sparePercent: number | null
  complexityCoefficient: number | null
  worksBasePrice: number | null
}

export interface WizardDraft {
  step: number
  clientMode: 'existing' | 'new'
  clientId: string | null
  client: { full_name: string; phone: string; telegram: string; comment: string }
  project: {
    title: string
    address: string
    city: string
    object_type: ObjectType
    work_kind: WorkKind
    floors_count: number | null
    wiring_type: WiringType
    note: string
  }
  rooms: Array<{
    id: string
    name: string
    room_type: Room['room_type']
    length_m: number | null
    width_m: number | null
    height_m: number | null
    wall_material: string
    ceiling_material: string
    comment: string
  }>
  points: Array<{
    id: string
    roomId: string
    deviceCode: string
    quantity: number | null
    install_height_m: number | null
    separate_line: boolean
    comment: string
    custom_power_w: number | null
  }>
  params: WizardParams
}

/** Coerce draft params to calculation engine params (null → safe defaults). */
export function toCalcParams(params: WizardParams): CalcParams {
  return {
    distanceToPanel_m: params.distanceToPanel_m ?? 0,
    panelsCount: params.panelsCount ?? 1,
    panelFloor: params.panelFloor ?? 1,
    routingMethod: params.routingMethod,
    sparePercent: params.sparePercent ?? 0,
    complexityCoefficient: params.complexityCoefficient ?? 1,
    worksBasePrice: params.worksBasePrice ?? 0,
  }
}

const emptyWizard = (): WizardDraft => ({
  step: 0,
  clientMode: 'new',
  clientId: null,
  client: { full_name: '', phone: '', telegram: '', comment: '' },
  project: {
    title: '',
    address: '',
    city: 'Ташкент',
    object_type: 'apartment',
    work_kind: 'renovation',
    floors_count: 1,
    wiring_type: 'hidden',
    note: '',
  },
  rooms: [],
  points: [],
  params: {
    distanceToPanel_m: 10,
    panelsCount: 1,
    panelFloor: 1,
    routingMethod: 'ceiling',
    sparePercent: 10,
    complexityCoefficient: 1,
    worksBasePrice: 0,
  },
})

interface AppDataState {
  clients: Client[]
  projects: Project[]
  rooms: Record<string, Room[]>
  points: Record<string, ElectricalPoint[]>
  materials: Record<string, MaterialRequirement[]>
  works: Record<string, ProjectWorkItem[]>
  orders: Order[]
  wizard: WizardDraft
  publicEstimates: Record<
    string,
    {
      token: string
      projectId: string
      status: ProjectStatus
      comment: string
      materialsTotal: number
      worksTotal: number
      grandTotal: number
      title: string
      clientName: string
    }
  >
  load: (electricianId: string, demoMode: boolean) => Promise<void>
  ensureDemoSeed: () => void
  setWizard: (patch: Partial<WizardDraft> | ((w: WizardDraft) => WizardDraft)) => void
  resetWizard: () => void
  restoreWizardDraft: () => Promise<void>
  saveWizardProject: (electricianId: string) => Promise<string>
  upsertClient: (client: Omit<Client, 'created_at' | 'updated_at' | 'deleted_at'> & Partial<Client>) => void
  deleteClient: (id: string) => void
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  addRoom: (projectId: string, room: Omit<Room, 'created_at' | 'updated_at' | 'deleted_at' | 'area_m2' | 'perimeter_m'> & { length_m: number; width_m: number }) => void
  updateRoom: (projectId: string, roomId: string, patch: Partial<Room>) => void
  deleteRoom: (projectId: string, roomId: string) => void
  addPoint: (projectId: string, point: Omit<ElectricalPoint, 'created_at' | 'updated_at' | 'deleted_at'>) => void
  updatePoint: (projectId: string, pointId: string, patch: Partial<ElectricalPoint>) => void
  deletePoint: (projectId: string, pointId: string) => void
  setMaterials: (projectId: string, items: MaterialRequirement[]) => void
  setWorks: (projectId: string, items: ProjectWorkItem[]) => void
  recalculateProject: (projectId: string) => void
  createPublicLink: (projectId: string) => string
  respondPublicEstimate: (token: string, status: 'confirmed' | 'rejected', comment: string) => void
  createOrder: (order: Order) => void
  updateOrderStatus: (id: string, status: Order['status']) => void
}

function now() {
  return new Date().toISOString()
}

function applyRecalc(
  state: AppDataState,
  projectId: string,
): Partial<AppDataState> {
  const project = state.projects.find((p) => p.id === projectId)
  if (!project) return {}
  const rooms = state.rooms[projectId] ?? []
  const points = state.points[projectId] ?? []
  const existing = state.materials[projectId]
  const overrides: Record<string, number> = {}
  for (const m of existing ?? []) {
    if (m.manual_qty != null && m.calculation_source) {
      overrides[m.calculation_source] = m.manual_qty
    }
  }
  const calc = calculateForProject(project, rooms, points, overrides)
  const materials = materialsFromCalc(projectId, calc, existing)
  const works = worksFromCalc(projectId, calc, project.complexity_coefficient)
  const worksTotal = works.reduce((s, w) => s + w.total_price, 0)
  const materialsTotal = materials.reduce((s, m) => s + m.total_price, 0)
  return {
    materials: { ...state.materials, [projectId]: materials },
    works: { ...state.works, [projectId]: works },
    projects: state.projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            materials_total: materialsTotal,
            works_total: worksTotal,
            grand_total: materialsTotal + worksTotal,
            rooms_count: rooms.length,
            status: p.status === 'draft' && (rooms.length > 0 || points.length > 0) ? 'calculated' : p.status,
            updated_at: now(),
          }
        : p,
    ),
  }
}

export const useAppDataStore = create<AppDataState>()(
  persist(
    (set, get) => ({
      clients: DEMO_CLIENTS,
      projects: DEMO_PROJECTS,
      rooms: { ...DEMO_ROOMS },
      points: { ...DEMO_POINTS },
      materials: { ...DEMO_MATERIALS },
      works: { ...DEMO_WORKS },
      orders: DEMO_ORDERS,
      wizard: emptyWizard(),
      publicEstimates: {},

      ensureDemoSeed: () => {
        const s = get()
        const needsSeed =
          !s.rooms.p1?.length ||
          !s.points.p1?.length ||
          !s.materials.p1?.length ||
          !s.works.p1?.length
        if (!needsSeed) return
        set({
          rooms: { ...DEMO_ROOMS, ...s.rooms, p1: s.rooms.p1?.length ? s.rooms.p1 : DEMO_ROOMS.p1 },
          points: { ...DEMO_POINTS, ...s.points, p1: s.points.p1?.length ? s.points.p1 : DEMO_POINTS.p1 },
          materials: {
            ...DEMO_MATERIALS,
            ...s.materials,
            p1: s.materials.p1?.length ? s.materials.p1 : DEMO_MATERIALS.p1,
          },
          works: { ...DEMO_WORKS, ...s.works, p1: s.works.p1?.length ? s.works.p1 : DEMO_WORKS.p1 },
          projects: s.projects.map((p) => {
            const seeded = DEMO_PROJECTS.find((d) => d.id === p.id)
            if (!seeded) return p
            if (p.materials_total > 0 && (s.materials[p.id]?.length ?? 0) > 0) return p
            return {
              ...p,
              materials_total: seeded.materials_total,
              works_total: seeded.works_total,
              grand_total: seeded.grand_total,
              rooms_count: seeded.rooms_count,
            }
          }),
        })
      },

      load: async (electricianId, demoMode) => {
        if (demoMode || !isSupabaseConfigured) {
          // Never wipe persisted local/demo data — only fill missing seed for demo projects.
          get().ensureDemoSeed()
          return
        }
        const [clientsRes, projectsRes, ordersRes] = await Promise.all([
          supabase.from('clients').select('*').eq('electrician_id', electricianId).is('deleted_at', null).order('created_at', { ascending: false }),
          supabase
            .from('projects')
            .select('*, clients(*)')
            .eq('electrician_id', electricianId)
            .is('deleted_at', null)
            .order('updated_at', { ascending: false }),
          supabase
            .from('orders')
            .select('*, suppliers(*)')
            .eq('electrician_id', electricianId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false }),
        ])
        const projects = (!projectsRes.error && projectsRes.data ? projectsRes.data : []) as Project[]
        const projectIds = projects.map((p) => p.id)

        const rooms: Record<string, Room[]> = {}
        const points: Record<string, ElectricalPoint[]> = {}
        const materials: Record<string, MaterialRequirement[]> = {}
        const works: Record<string, ProjectWorkItem[]> = {}

        if (projectIds.length) {
          const [roomsRes, pointsRes, materialsRes, worksRes] = await Promise.all([
            supabase.from('rooms').select('*').in('project_id', projectIds).is('deleted_at', null),
            supabase.from('electrical_points').select('*').in('project_id', projectIds).is('deleted_at', null),
            supabase.from('material_requirements').select('*').in('project_id', projectIds).is('deleted_at', null),
            supabase.from('project_work_items').select('*').in('project_id', projectIds).is('deleted_at', null),
          ])
          for (const r of (roomsRes.data ?? []) as Room[]) {
            rooms[r.project_id] = [...(rooms[r.project_id] ?? []), r]
          }
          for (const p of (pointsRes.data ?? []) as ElectricalPoint[]) {
            points[p.project_id] = [...(points[p.project_id] ?? []), p]
          }
          for (const m of (materialsRes.data ?? []) as MaterialRequirement[]) {
            materials[m.project_id] = [...(materials[m.project_id] ?? []), m]
          }
          for (const w of (worksRes.data ?? []) as ProjectWorkItem[]) {
            works[w.project_id] = [...(works[w.project_id] ?? []), w]
          }
        }

        if (!clientsRes.error && clientsRes.data) set({ clients: clientsRes.data as Client[] })
        if (!projectsRes.error && projectsRes.data) set({ projects, rooms, points, materials, works })
        if (!ordersRes.error && ordersRes.data) set({ orders: ordersRes.data as Order[] })
      },

      setWizard: (patch) =>
        set((s) => {
          const next = typeof patch === 'function' ? patch(s.wizard) : { ...s.wizard, ...patch }
          void saveOfflineDraft('wizard', next)
          return { wizard: next }
        }),

      resetWizard: () => {
        void saveOfflineDraft('wizard', emptyWizard())
        set({ wizard: emptyWizard() })
      },

      restoreWizardDraft: async () => {
        const draft = await loadOfflineDraft<WizardDraft>('wizard')
        if (draft && (draft.rooms.length > 0 || draft.client.full_name || draft.project.title)) {
          set({ wizard: draft })
        }
      },

      saveWizardProject: async (electricianId) => {
        const w = get().wizard
        let clientId = w.clientId
        const ts = now()

        if (w.clientMode === 'new' || !clientId) {
          clientId = crypto.randomUUID()
          const phone = normalizeUzbekPhone(w.client.phone) ?? w.client.phone.replace(/\s/g, '')
          const client: Client = {
            id: clientId,
            electrician_id: electricianId,
            full_name: w.client.full_name,
            phone,
            telegram: w.client.telegram || null,
            comment: w.client.comment || null,
            city: w.project.city,
            created_at: ts,
            updated_at: ts,
            deleted_at: null,
          }
          set((s) => ({ clients: [client, ...s.clients] }))
          if (isSupabaseConfigured) {
            await supabase.from('clients').insert(client as never)
          }
        }

        const roomInputs = w.rooms.map((r) => {
          const length_m = r.length_m ?? 0
          const width_m = r.width_m ?? 0
          const height_m = r.height_m ?? 0
          return {
            id: r.id,
            name: r.name,
            length_m,
            width_m,
            height_m,
            area_m2: calcArea(length_m, width_m),
            perimeter_m: calcPerimeter(length_m, width_m),
          }
        })
        const pointInputs = w.points.map((p) => ({
          id: p.id,
          roomId: p.roomId,
          deviceCode: p.deviceCode,
          quantity: p.quantity ?? 1,
          separateLine: p.separate_line,
          installHeight_m: p.install_height_m,
          customPower_w: p.custom_power_w,
        }))
        const calcParams = toCalcParams(w.params)
        const calc = calculateProjectMaterials(roomInputs, pointInputs, calcParams)

        const projectId = crypto.randomUUID()
        const client = get().clients.find((c) => c.id === clientId)
        const materials = materialsFromCalc(projectId, calc)
        const works = worksFromCalc(projectId, calc, w.params.complexityCoefficient ?? 1)
        const worksTotal = works.reduce((s, item) => s + item.total_price, 0)
        const materialsTotal = materials.reduce((s, m) => s + m.total_price, 0)

        const project: Project = {
          id: projectId,
          electrician_id: electricianId,
          client_id: clientId,
          title: w.project.title || `Проект — ${w.client.full_name || 'без имени'}`,
          address: w.project.address,
          city: w.project.city,
          object_type: w.project.object_type,
          work_kind: w.project.work_kind,
          floors_count: w.project.floors_count ?? 1,
          wiring_type: w.project.wiring_type,
          note: w.project.note || null,
          status: 'calculated',
          materials_total: materialsTotal,
          works_total: worksTotal,
          grand_total: materialsTotal + worksTotal,
          rooms_count: w.rooms.length,
          distance_to_panel_m: calcParams.distanceToPanel_m,
          panels_count: calcParams.panelsCount,
          panel_floor: calcParams.panelFloor,
          routing_method: calcParams.routingMethod as RoutingMethod,
          spare_percent: calcParams.sparePercent,
          complexity_coefficient: calcParams.complexityCoefficient,
          created_at: ts,
          updated_at: ts,
          deleted_at: null,
          clients: client,
        }

        const rooms: Room[] = w.rooms.map((r, i) => {
          const length_m = r.length_m ?? 0
          const width_m = r.width_m ?? 0
          const height_m = r.height_m ?? 0
          return {
            id: r.id,
            project_id: projectId,
            name: r.name,
            room_type: r.room_type,
            length_m,
            width_m,
            height_m,
            area_m2: calcArea(length_m, width_m),
            perimeter_m: calcPerimeter(length_m, width_m),
            wall_material: r.wall_material || null,
            ceiling_material: r.ceiling_material || null,
            comment: r.comment || null,
            sort_order: i,
            created_at: ts,
            updated_at: ts,
            deleted_at: null,
          }
        })

        const points: ElectricalPoint[] = w.points.map((p) => ({
          id: p.id,
          room_id: p.roomId,
          project_id: projectId,
          device_type_id: null,
          device_code: p.deviceCode,
          custom_name: DEVICE_TYPES.find((d) => d.code === p.deviceCode)?.nameRu ?? p.deviceCode,
          quantity: p.quantity ?? 1,
          install_height_m: p.install_height_m,
          separate_line: p.separate_line,
          comment: p.comment || null,
          custom_power_w: p.custom_power_w,
          photo_url: null,
          created_at: ts,
          updated_at: ts,
          deleted_at: null,
        }))

        set((s) => ({
          projects: [project, ...s.projects],
          rooms: { ...s.rooms, [projectId]: rooms },
          points: { ...s.points, [projectId]: points },
          materials: { ...s.materials, [projectId]: materials },
          works: { ...s.works, [projectId]: works },
          wizard: emptyWizard(),
        }))
        void saveOfflineDraft('wizard', emptyWizard())

        if (isSupabaseConfigured) {
          const { clients: _c, ...projectRow } = project
          void _c
          await supabase.from('projects').insert(projectRow as never)
          if (rooms.length) await supabase.from('rooms').insert(rooms as never)
          if (points.length) {
            await supabase.from('electrical_points').insert(points.map(stripPointForDb) as never)
          }
          if (materials.length) await supabase.from('material_requirements').insert(materials as never)
          if (works.length) await supabase.from('project_work_items').insert(works as never)
        }

        return projectId
      },

      upsertClient: (client) => {
        set((s) => {
          const exists = s.clients.some((c) => c.id === client.id)
          const next = exists
            ? s.clients.map((c) => (c.id === client.id ? { ...c, ...client, updated_at: now() } : c))
            : [
                {
                  ...client,
                  created_at: client.created_at ?? now(),
                  updated_at: now(),
                  deleted_at: client.deleted_at ?? null,
                } as Client,
                ...s.clients,
              ]
          return { clients: next }
        })
        if (isSupabaseConfigured) {
          const row = get().clients.find((c) => c.id === client.id)
          if (row) void supabase.from('clients').upsert(row as never)
        }
      },

      deleteClient: (id) => {
        set((s) => ({
          clients: s.clients.filter((c) => c.id !== id),
          projects: s.projects.map((p) =>
            p.client_id === id ? { ...p, client_id: null, clients: null, updated_at: now() } : p,
          ),
        }))
        if (isSupabaseConfigured) {
          void supabase.from('clients').update({ deleted_at: now() } as never).eq('id', id)
        }
      },

      updateProject: (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updated_at: now() } : p,
          ),
        }))
        if (isSupabaseConfigured) {
          const { clients: _c, ...rest } = patch as Partial<Project>
          void _c
          void supabase.from('projects').update({ ...rest, updated_at: now() } as never).eq('id', id)
        }
      },

      deleteProject: (id) => {
        set((s) => {
          const { [id]: _r, ...rooms } = s.rooms
          const { [id]: _p, ...points } = s.points
          const { [id]: _m, ...materials } = s.materials
          const { [id]: _w, ...works } = s.works
          void _r
          void _p
          void _m
          void _w
          return {
            projects: s.projects.filter((p) => p.id !== id),
            rooms,
            points,
            materials,
            works,
            orders: s.orders.map((o) =>
              o.project_id === id ? { ...o, project_id: null, updated_at: now() } : o,
            ),
          }
        })
        if (isSupabaseConfigured) {
          void supabase.from('projects').update({ deleted_at: now() } as never).eq('id', id)
        }
      },

      addRoom: (projectId, room) => {
        const full: Room = {
          ...room,
          area_m2: calcArea(room.length_m, room.width_m),
          perimeter_m: calcPerimeter(room.length_m, room.width_m),
          created_at: now(),
          updated_at: now(),
          deleted_at: null,
        }
        set((s) => {
          const list = [...(s.rooms[projectId] ?? []), full]
          const next: AppDataState = {
            ...s,
            rooms: { ...s.rooms, [projectId]: list },
            projects: s.projects.map((p) =>
              p.id === projectId ? { ...p, rooms_count: list.length, updated_at: now() } : p,
            ),
          }
          return { ...next, ...applyRecalc(next, projectId) }
        })
        void saveOfflineDraft(`rooms:${projectId}`, get().rooms[projectId])
        if (isSupabaseConfigured) void supabase.from('rooms').insert(full as never)
      },

      updateRoom: (projectId, roomId, patch) => {
        set((s) => {
          const list = (s.rooms[projectId] ?? []).map((r) => {
            if (r.id !== roomId) return r
            const next = { ...r, ...patch, updated_at: now() }
            next.area_m2 = calcArea(next.length_m, next.width_m)
            next.perimeter_m = calcPerimeter(next.length_m, next.width_m)
            return next
          })
          const next: AppDataState = { ...s, rooms: { ...s.rooms, [projectId]: list } }
          return { ...next, ...applyRecalc(next, projectId) }
        })
        if (isSupabaseConfigured) {
          void supabase.from('rooms').update({ ...patch, updated_at: now() } as never).eq('id', roomId)
        }
      },

      deleteRoom: (projectId, roomId) => {
        set((s) => {
          const list = (s.rooms[projectId] ?? []).filter((r) => r.id !== roomId)
          const pts = (s.points[projectId] ?? []).filter((p) => p.room_id !== roomId)
          const next: AppDataState = {
            ...s,
            rooms: { ...s.rooms, [projectId]: list },
            points: { ...s.points, [projectId]: pts },
            projects: s.projects.map((p) =>
              p.id === projectId ? { ...p, rooms_count: list.length, updated_at: now() } : p,
            ),
          }
          return { ...next, ...applyRecalc(next, projectId) }
        })
        if (isSupabaseConfigured) {
          void supabase.from('rooms').update({ deleted_at: now() } as never).eq('id', roomId)
        }
      },

      addPoint: (projectId, point) => {
        const full: ElectricalPoint = {
          ...point,
          created_at: now(),
          updated_at: now(),
          deleted_at: null,
        }
        set((s) => {
          const next: AppDataState = {
            ...s,
            points: {
              ...s.points,
              [projectId]: [...(s.points[projectId] ?? []), full],
            },
          }
          return { ...next, ...applyRecalc(next, projectId) }
        })
        void saveOfflineDraft(`points:${projectId}`, get().points[projectId])
        if (isSupabaseConfigured) {
          void supabase.from('electrical_points').insert(stripPointForDb(full) as never)
        }
      },

      updatePoint: (projectId, pointId, patch) => {
        set((s) => {
          const list = (s.points[projectId] ?? []).map((p) =>
            p.id === pointId ? { ...p, ...patch, updated_at: now() } : p,
          )
          const next: AppDataState = { ...s, points: { ...s.points, [projectId]: list } }
          return { ...next, ...applyRecalc(next, projectId) }
        })
        if (isSupabaseConfigured) {
          const { device_code: _c, ...rest } = patch
          void _c
          void supabase.from('electrical_points').update({ ...rest, updated_at: now() } as never).eq('id', pointId)
        }
      },

      deletePoint: (projectId, pointId) => {
        set((s) => {
          const list = (s.points[projectId] ?? []).filter((p) => p.id !== pointId)
          const next: AppDataState = { ...s, points: { ...s.points, [projectId]: list } }
          return { ...next, ...applyRecalc(next, projectId) }
        })
        if (isSupabaseConfigured) {
          void supabase.from('electrical_points').update({ deleted_at: now() } as never).eq('id', pointId)
        }
      },

      setMaterials: (projectId, items) =>
        set((s) => {
          const materialsTotal = items.reduce((sum, m) => sum + m.total_price, 0)
          return {
            materials: { ...s.materials, [projectId]: items },
            projects: s.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    materials_total: materialsTotal,
                    grand_total: materialsTotal + p.works_total,
                    updated_at: now(),
                  }
                : p,
            ),
          }
        }),

      setWorks: (projectId, items) =>
        set((s) => {
          const worksTotal = items.reduce((sum, w) => sum + w.total_price, 0)
          return {
            works: { ...s.works, [projectId]: items },
            projects: s.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    works_total: worksTotal,
                    grand_total: p.materials_total + worksTotal,
                    updated_at: now(),
                  }
                : p,
            ),
          }
        }),

      recalculateProject: (projectId) => {
        set((s) => ({ ...s, ...applyRecalc(s, projectId) }))
      },

      createPublicLink: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId)
        const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 16)
        if (!project) return token
        set((s) => ({
          publicEstimates: {
            ...s.publicEstimates,
            [token]: {
              token,
              projectId,
              status: project.status,
              comment: '',
              materialsTotal: project.materials_total,
              worksTotal: project.works_total,
              grandTotal: project.grand_total,
              title: project.title,
              clientName: project.clients?.full_name ?? '',
            },
          },
        }))
        return token
      },

      respondPublicEstimate: (token, status, comment) => {
        set((s) => {
          const est = s.publicEstimates[token]
          if (!est) return s
          return {
            publicEstimates: {
              ...s.publicEstimates,
              [token]: { ...est, status, comment },
            },
            projects: s.projects.map((p) =>
              p.id === est.projectId ? { ...p, status, updated_at: now() } : p,
            ),
          }
        })
      },

      createOrder: (order) => {
        set((s) => ({ orders: [order, ...s.orders] }))
        if (isSupabaseConfigured) {
          const { suppliers: _s, ...row } = order
          void _s
          void supabase.from('orders').insert(row as never)
        }
      },

      updateOrderStatus: (id, status) => {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status, updated_at: now() } : o)),
        }))
        if (isSupabaseConfigured) {
          void supabase.from('orders').update({ status, updated_at: now() } as never).eq('id', id)
        }
      },
    }),
    {
      name: 'simchi-app-data',
      version: 3,
      migrate: (persisted, fromVersion) => {
        const state = (persisted ?? {}) as Partial<{
          clients: typeof DEMO_CLIENTS
          projects: typeof DEMO_PROJECTS
          rooms: typeof DEMO_ROOMS
          points: typeof DEMO_POINTS
          materials: typeof DEMO_MATERIALS
          works: typeof DEMO_WORKS
          orders: typeof DEMO_ORDERS
          wizard: WizardDraft
          publicEstimates: AppDataState['publicEstimates']
        }>
        let wizard = state.wizard ?? emptyWizard()
        // v2→v3: client step moved from first (0) to last (5)
        if ((fromVersion ?? 0) < 3 && wizard) {
          const oldToNew = [5, 0, 1, 2, 3, 4] as const
          const oldStep = Math.min(Math.max(wizard.step ?? 0, 0), 5)
          wizard = { ...wizard, step: oldToNew[oldStep] }
        }
        return {
          clients: state.clients ?? DEMO_CLIENTS,
          projects: state.projects ?? DEMO_PROJECTS,
          rooms: { ...DEMO_ROOMS, ...(state.rooms ?? {}) },
          points: { ...DEMO_POINTS, ...(state.points ?? {}) },
          materials: { ...DEMO_MATERIALS, ...(state.materials ?? {}) },
          works: { ...DEMO_WORKS, ...(state.works ?? {}) },
          orders: state.orders ?? DEMO_ORDERS,
          wizard,
          publicEstimates: state.publicEstimates ?? {},
        }
      },
      partialize: (s) => ({
        clients: s.clients,
        projects: s.projects,
        rooms: s.rooms,
        points: s.points,
        materials: s.materials,
        works: s.works,
        orders: s.orders,
        wizard: s.wizard,
        publicEstimates: s.publicEstimates,
      }),
    },
  ),
)

export { DEMO_SUPPLIERS }

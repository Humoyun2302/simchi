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
  DEMO_ORDERS,
  DEMO_PROJECTS,
  DEMO_SUPPLIERS,
} from '@/stores/demo-data'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { calcArea, calcPerimeter } from '@/lib/utils'
import {
  calculateProjectMaterials,
  DEVICE_TYPES,
  type CalcParams,
} from '@/features/calculation-engine'
import { saveOfflineDraft } from '@/features/offline/db'

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
    floors_count: number
    wiring_type: WiringType
    note: string
  }
  rooms: Array<{
    id: string
    name: string
    room_type: Room['room_type']
    length_m: number
    width_m: number
    height_m: number
    wall_material: string
    ceiling_material: string
    comment: string
  }>
  points: Array<{
    id: string
    roomId: string
    deviceCode: string
    quantity: number
    install_height_m: number
    separate_line: boolean
    comment: string
    custom_power_w: number | null
  }>
  params: CalcParams
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
  setWizard: (patch: Partial<WizardDraft> | ((w: WizardDraft) => WizardDraft)) => void
  resetWizard: () => void
  saveWizardProject: (electricianId: string) => Promise<string>
  upsertClient: (client: Omit<Client, 'created_at' | 'updated_at' | 'deleted_at'> & Partial<Client>) => void
  updateProject: (id: string, patch: Partial<Project>) => void
  addRoom: (projectId: string, room: Omit<Room, 'created_at' | 'updated_at' | 'deleted_at' | 'area_m2' | 'perimeter_m'> & { length_m: number; width_m: number }) => void
  updateRoom: (projectId: string, roomId: string, patch: Partial<Room>) => void
  addPoint: (projectId: string, point: Omit<ElectricalPoint, 'created_at' | 'updated_at' | 'deleted_at'>) => void
  setMaterials: (projectId: string, items: MaterialRequirement[]) => void
  setWorks: (projectId: string, items: ProjectWorkItem[]) => void
  createPublicLink: (projectId: string) => string
  respondPublicEstimate: (token: string, status: 'confirmed' | 'rejected', comment: string) => void
  createOrder: (order: Order) => void
  updateOrderStatus: (id: string, status: Order['status']) => void
}

function now() {
  return new Date().toISOString()
}

export const useAppDataStore = create<AppDataState>()(
  persist(
    (set, get) => ({
      clients: DEMO_CLIENTS,
      projects: DEMO_PROJECTS,
      rooms: {
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
            created_at: now(),
            updated_at: now(),
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
            created_at: now(),
            updated_at: now(),
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
            created_at: now(),
            updated_at: now(),
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
            created_at: now(),
            updated_at: now(),
            deleted_at: null,
          },
        ],
      },
      points: {},
      materials: {},
      works: {},
      orders: DEMO_ORDERS,
      wizard: emptyWizard(),
      publicEstimates: {},

      load: async (electricianId, demoMode) => {
        if (demoMode || !isSupabaseConfigured) {
          set({
            clients: DEMO_CLIENTS,
            projects: DEMO_PROJECTS,
            orders: DEMO_ORDERS,
          })
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
        if (!clientsRes.error && clientsRes.data) set({ clients: clientsRes.data as Client[] })
        if (!projectsRes.error && projectsRes.data) set({ projects: projectsRes.data as Project[] })
        if (!ordersRes.error && ordersRes.data) set({ orders: ordersRes.data as Order[] })
      },

      setWizard: (patch) =>
        set((s) => {
          const next = typeof patch === 'function' ? patch(s.wizard) : { ...s.wizard, ...patch }
          void saveOfflineDraft('wizard', next)
          return { wizard: next }
        }),

      resetWizard: () => set({ wizard: emptyWizard() }),

      saveWizardProject: async (electricianId) => {
        const w = get().wizard
        let clientId = w.clientId
        const ts = now()

        if (w.clientMode === 'new' || !clientId) {
          clientId = crypto.randomUUID()
          const client: Client = {
            id: clientId,
            electrician_id: electricianId,
            full_name: w.client.full_name,
            phone: w.client.phone,
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

        const roomInputs = w.rooms.map((r) => ({
          id: r.id,
          name: r.name,
          length_m: r.length_m,
          width_m: r.width_m,
          height_m: r.height_m,
          area_m2: calcArea(r.length_m, r.width_m),
          perimeter_m: calcPerimeter(r.length_m, r.width_m),
        }))
        const pointInputs = w.points.map((p) => ({
          id: p.id,
          roomId: p.roomId,
          deviceCode: p.deviceCode,
          quantity: p.quantity,
          separateLine: p.separate_line,
          installHeight_m: p.install_height_m,
          customPower_w: p.custom_power_w,
        }))
        const calc = calculateProjectMaterials(roomInputs, pointInputs, w.params)

        const projectId = crypto.randomUUID()
        const client = get().clients.find((c) => c.id === clientId)
        const project: Project = {
          id: projectId,
          electrician_id: electricianId,
          client_id: clientId,
          title: w.project.title || `Проект — ${w.client.full_name}`,
          address: w.project.address,
          city: w.project.city,
          object_type: w.project.object_type,
          work_kind: w.project.work_kind,
          floors_count: w.project.floors_count,
          wiring_type: w.project.wiring_type,
          note: w.project.note || null,
          status: 'calculated',
          materials_total: calc.materialsTotal,
          works_total: calc.worksTotal,
          grand_total: calc.grandTotal,
          rooms_count: w.rooms.length,
          distance_to_panel_m: w.params.distanceToPanel_m,
          panels_count: w.params.panelsCount,
          panel_floor: w.params.panelFloor,
          routing_method: w.params.routingMethod as RoutingMethod,
          spare_percent: w.params.sparePercent,
          complexity_coefficient: w.params.complexityCoefficient,
          created_at: ts,
          updated_at: ts,
          deleted_at: null,
          clients: client,
        }

        const rooms: Room[] = w.rooms.map((r, i) => ({
          id: r.id,
          project_id: projectId,
          name: r.name,
          room_type: r.room_type,
          length_m: r.length_m,
          width_m: r.width_m,
          height_m: r.height_m,
          area_m2: calcArea(r.length_m, r.width_m),
          perimeter_m: calcPerimeter(r.length_m, r.width_m),
          wall_material: r.wall_material || null,
          ceiling_material: r.ceiling_material || null,
          comment: r.comment || null,
          sort_order: i,
          created_at: ts,
          updated_at: ts,
          deleted_at: null,
        }))

        const points: ElectricalPoint[] = w.points.map((p) => ({
          id: p.id,
          room_id: p.roomId,
          project_id: projectId,
          device_type_id: null,
          custom_name: DEVICE_TYPES.find((d) => d.code === p.deviceCode)?.nameRu ?? p.deviceCode,
          quantity: p.quantity,
          install_height_m: p.install_height_m,
          separate_line: p.separate_line,
          comment: p.comment || null,
          custom_power_w: p.custom_power_w,
          photo_url: null,
          created_at: ts,
          updated_at: ts,
          deleted_at: null,
        }))

        const materials: MaterialRequirement[] = calc.materials.map((m) => ({
          id: crypto.randomUUID(),
          project_id: projectId,
          name: m.name,
          category: m.category as MaterialRequirement['category'],
          brand: null,
          model: null,
          sku: null,
          unit: m.unit,
          calculated_qty: m.quantity,
          manual_qty: null,
          spare_percent: m.sparePercent,
          unit_price: m.unitPrice,
          supplier_id: null,
          total_price: m.totalPrice,
          comment: null,
          calculation_source: m.ruleId,
          calculation_trace: m.trace as unknown as Record<string, unknown>,
          created_at: ts,
          updated_at: ts,
          deleted_at: null,
        }))

        set((s) => ({
          projects: [project, ...s.projects],
          rooms: { ...s.rooms, [projectId]: rooms },
          points: { ...s.points, [projectId]: points },
          materials: { ...s.materials, [projectId]: materials },
          wizard: emptyWizard(),
        }))

        if (isSupabaseConfigured) {
          const { clients: _c, ...projectRow } = project
          void _c
          await supabase.from('projects').insert(projectRow as never)
          if (rooms.length) await supabase.from('rooms').insert(rooms as never)
          if (points.length) await supabase.from('electrical_points').insert(points as never)
          if (materials.length) await supabase.from('material_requirements').insert(materials as never)
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
      },

      updateProject: (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updated_at: now() } : p,
          ),
        }))
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
          return {
            rooms: { ...s.rooms, [projectId]: list },
            projects: s.projects.map((p) =>
              p.id === projectId ? { ...p, rooms_count: list.length, updated_at: now() } : p,
            ),
          }
        })
        void saveOfflineDraft(`rooms:${projectId}`, get().rooms[projectId])
      },

      updateRoom: (projectId, roomId, patch) => {
        set((s) => ({
          rooms: {
            ...s.rooms,
            [projectId]: (s.rooms[projectId] ?? []).map((r) => {
              if (r.id !== roomId) return r
              const next = { ...r, ...patch, updated_at: now() }
              next.area_m2 = calcArea(next.length_m, next.width_m)
              next.perimeter_m = calcPerimeter(next.length_m, next.width_m)
              return next
            }),
          },
        }))
      },

      addPoint: (projectId, point) => {
        set((s) => ({
          points: {
            ...s.points,
            [projectId]: [...(s.points[projectId] ?? []), { ...point, created_at: now(), updated_at: now(), deleted_at: null }],
          },
        }))
        void saveOfflineDraft(`points:${projectId}`, get().points[projectId])
      },

      setMaterials: (projectId, items) => set((s) => ({ materials: { ...s.materials, [projectId]: items } })),
      setWorks: (projectId, items) => set((s) => ({ works: { ...s.works, [projectId]: items } })),

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

      createOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),

      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status, updated_at: now() } : o)),
        })),
    }),
    {
      name: 'simchi-app-data',
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

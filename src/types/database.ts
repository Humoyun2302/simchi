export type UserRole = 'electrician' | 'supplier' | 'admin'

export type ProjectStatus =
  | 'draft'
  | 'calculated'
  | 'sent'
  | 'pending_approval'
  | 'confirmed'
  | 'rejected'
  | 'materials_ordered'
  | 'completed'

export type EstimateStatus = ProjectStatus

export type OrderStatus =
  | 'draft'
  | 'sent'
  | 'confirmed_by_supplier'
  | 'assembling'
  | 'ready_for_pickup'
  | 'in_delivery'
  | 'received'
  | 'cancelled'
  | 'partially_returned'
  | 'returned'

export type ObjectType =
  | 'apartment'
  | 'private_house'
  | 'office'
  | 'shop'
  | 'restaurant'
  | 'other'

export type WiringType = 'hidden' | 'open' | 'combined'
export type WorkKind = 'new' | 'renovation'
export type RoutingMethod = 'ceiling' | 'wall' | 'floor' | 'cable_channel'

export type RoomType =
  | 'kitchen'
  | 'bedroom'
  | 'living_room'
  | 'bathroom'
  | 'hallway'
  | 'office'
  | 'technical'
  | 'other'

export type MaterialCategory =
  | 'cables'
  | 'wires'
  | 'sockets'
  | 'switches'
  | 'frames'
  | 'mounting_boxes'
  | 'junction_boxes'
  | 'conduit'
  | 'pipes'
  | 'cable_channels'
  | 'fasteners'
  | 'terminals'
  | 'lugs'
  | 'panels'
  | 'modular_devices'
  | 'consumables'
  | 'other'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  city: string | null
  company_name: string | null
  role: UserRole
  is_blocked: boolean
  avatar_url: string | null
  locale: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Client {
  id: string
  electrician_id: string
  full_name: string
  phone: string
  telegram: string | null
  comment: string | null
  city: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Project {
  id: string
  electrician_id: string
  client_id: string | null
  title: string
  address: string | null
  city: string | null
  object_type: ObjectType
  work_kind: WorkKind
  floors_count: number
  wiring_type: WiringType
  note: string | null
  status: ProjectStatus
  materials_total: number
  works_total: number
  grand_total: number
  rooms_count: number
  distance_to_panel_m: number | null
  panels_count: number
  panel_floor: number | null
  routing_method: RoutingMethod | null
  spare_percent: number
  complexity_coefficient: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  clients?: Client | null
}

export interface Room {
  id: string
  project_id: string
  name: string
  room_type: RoomType
  length_m: number
  width_m: number
  height_m: number
  area_m2: number
  perimeter_m: number
  wall_material: string | null
  ceiling_material: string | null
  comment: string | null
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ElectricalPoint {
  id: string
  room_id: string
  project_id: string
  device_type_id: string | null
  /** Client-side device code used by the calculation engine (demo / local). */
  device_code?: string | null
  custom_name: string | null
  quantity: number
  install_height_m: number | null
  separate_line: boolean
  comment: string | null
  custom_power_w: number | null
  photo_url: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  device_types?: DeviceType | null
}

export interface DeviceType {
  id: string
  code: string
  name_ru: string
  name_uz: string
  name_en: string
  default_power_w: number | null
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MaterialRequirement {
  id: string
  project_id: string
  name: string
  category: MaterialCategory
  brand: string | null
  model: string | null
  sku: string | null
  unit: string
  calculated_qty: number
  manual_qty: number | null
  spare_percent: number
  unit_price: number
  supplier_id: string | null
  total_price: number
  comment: string | null
  calculation_source: string | null
  calculation_trace: Record<string, unknown> | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WorkPriceItem {
  id: string
  electrician_id: string
  work_type: string
  name: string
  unit: string
  unit_price: number
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ProjectWorkItem {
  id: string
  project_id: string
  work_price_item_id: string | null
  name: string
  work_type: string
  quantity: number
  unit_price: number
  complexity_coefficient: number
  discount_percent: number
  total_price: number
  comment: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Estimate {
  id: string
  project_id: string
  electrician_id: string
  status: EstimateStatus
  materials_total: number
  works_total: number
  delivery_total: number
  discount_total: number
  grand_total: number
  comments: string | null
  valid_until: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Supplier {
  id: string
  owner_profile_id: string | null
  name: string
  logo_url: string | null
  description: string | null
  city: string | null
  address: string | null
  phone: string | null
  telegram: string | null
  website: string | null
  rating: number
  delivery_terms: string | null
  min_order_amount: number
  electrician_discount_percent: number
  platform_commission_percent: number
  verification_status: 'pending' | 'verified' | 'rejected'
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Order {
  id: string
  electrician_id: string
  supplier_id: string
  project_id: string | null
  estimate_id: string | null
  status: OrderStatus
  subtotal: number
  discount_total: number
  delivery_total: number
  commission_total: number
  grand_total: number
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  suppliers?: Supplier | null
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string; full_name: string }; Update: Partial<Profile> }
      clients: { Row: Client; Insert: Partial<Client> & { electrician_id: string; full_name: string; phone: string }; Update: Partial<Client> }
      projects: { Row: Project; Insert: Partial<Project> & { electrician_id: string; title: string }; Update: Partial<Project> }
      rooms: { Row: Room; Insert: Partial<Room> & { project_id: string; name: string }; Update: Partial<Room> }
      electrical_points: { Row: ElectricalPoint; Insert: Partial<ElectricalPoint> & { room_id: string; project_id: string }; Update: Partial<ElectricalPoint> }
      device_types: { Row: DeviceType; Insert: Partial<DeviceType> & { code: string; name_ru: string }; Update: Partial<DeviceType> }
      material_requirements: { Row: MaterialRequirement; Insert: Partial<MaterialRequirement> & { project_id: string; name: string }; Update: Partial<MaterialRequirement> }
      work_price_items: { Row: WorkPriceItem; Insert: Partial<WorkPriceItem> & { electrician_id: string; name: string }; Update: Partial<WorkPriceItem> }
      project_work_items: { Row: ProjectWorkItem; Insert: Partial<ProjectWorkItem> & { project_id: string; name: string }; Update: Partial<ProjectWorkItem> }
      estimates: { Row: Estimate; Insert: Partial<Estimate> & { project_id: string; electrician_id: string }; Update: Partial<Estimate> }
      suppliers: { Row: Supplier; Insert: Partial<Supplier> & { name: string }; Update: Partial<Supplier> }
      orders: { Row: Order; Insert: Partial<Order> & { electrician_id: string; supplier_id: string }; Update: Partial<Order> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      project_status: ProjectStatus
      order_status: OrderStatus
    }
  }
}

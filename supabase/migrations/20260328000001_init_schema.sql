-- SIMCHI initial schema
create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  create type public.user_role as enum ('electrician', 'supplier', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.project_status as enum (
    'draft', 'calculated', 'sent', 'pending_approval', 'confirmed', 'rejected', 'materials_ordered', 'completed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum (
    'draft', 'sent', 'confirmed_by_supplier', 'assembling', 'ready_for_pickup',
    'in_delivery', 'received', 'cancelled', 'partially_returned', 'returned'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.object_type as enum ('apartment', 'private_house', 'office', 'shop', 'restaurant', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.wiring_type as enum ('hidden', 'open', 'combined');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.work_kind as enum ('new', 'renovation');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.routing_method as enum ('ceiling', 'wall', 'floor', 'cable_channel');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.room_type as enum ('kitchen', 'bedroom', 'living_room', 'bathroom', 'hallway', 'office', 'technical', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.material_category as enum (
    'cables', 'wires', 'sockets', 'switches', 'frames', 'mounting_boxes', 'junction_boxes',
    'conduit', 'pipes', 'cable_channels', 'fasteners', 'terminals', 'lugs', 'panels',
    'modular_devices', 'consumables', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.verification_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  city text,
  company_name text,
  role public.user_role not null default 'electrician',
  is_blocked boolean not null default false,
  avatar_url text,
  locale text not null default 'ru',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.electrician_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  license_note text,
  default_spare_percent numeric(5,2) not null default 10,
  default_complexity numeric(6,3) not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  electrician_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  telegram text,
  comment text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  electrician_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  address text,
  city text,
  object_type public.object_type not null default 'apartment',
  work_kind public.work_kind not null default 'renovation',
  floors_count integer not null default 1 check (floors_count > 0),
  wiring_type public.wiring_type not null default 'hidden',
  note text,
  status public.project_status not null default 'draft',
  materials_total numeric(14,2) not null default 0,
  works_total numeric(14,2) not null default 0,
  grand_total numeric(14,2) not null default 0,
  rooms_count integer not null default 0,
  distance_to_panel_m numeric(10,2),
  panels_count integer not null default 1,
  panel_floor integer,
  routing_method public.routing_method,
  spare_percent numeric(5,2) not null default 10,
  complexity_coefficient numeric(6,3) not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.floors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  floor_number integer not null,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(project_id, floor_number)
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  floor_id uuid references public.floors(id) on delete set null,
  name text not null,
  room_type public.room_type not null default 'other',
  length_m numeric(10,2) not null default 0,
  width_m numeric(10,2) not null default 0,
  height_m numeric(10,2) not null default 2.7,
  area_m2 numeric(12,2) not null default 0,
  perimeter_m numeric(12,2) not null default 0,
  wall_material text,
  ceiling_material text,
  comment text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.room_photos (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.device_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ru text not null,
  name_uz text not null default '',
  name_en text not null default '',
  default_power_w numeric(12,2),
  category text not null default 'general',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.electrical_points (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  device_type_id uuid references public.device_types(id) on delete set null,
  custom_name text,
  quantity integer not null default 1 check (quantity > 0),
  install_height_m numeric(8,2),
  separate_line boolean not null default false,
  comment text,
  custom_power_w numeric(12,2),
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.electrical_panels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null default 'Щит',
  floor_number integer,
  modules_count integer,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.calculation_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  point_type text not null,
  formula text not null,
  unit text not null,
  coefficient numeric(10,4) not null default 1,
  spare_percent numeric(5,2) not null default 0,
  min_qty numeric(12,3) not null default 0,
  rounding text not null default 'ceil' check (rounding in ('ceil', 'round', 'pack')),
  pack_size numeric(12,3) not null default 1,
  version integer not null default 1,
  is_active boolean not null default true,
  warning text,
  unit_price numeric(14,2) not null default 0,
  category public.material_category not null default 'other',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.project_calculations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  rules_version integer,
  result jsonb not null default '{}'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.material_requirements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  category public.material_category not null default 'other',
  brand text,
  model text,
  sku text,
  unit text not null default 'шт',
  calculated_qty numeric(14,3) not null default 0,
  manual_qty numeric(14,3),
  spare_percent numeric(5,2) not null default 0,
  unit_price numeric(14,2) not null default 0,
  supplier_id uuid,
  total_price numeric(14,2) not null default 0,
  comment text,
  calculation_source text,
  calculation_trace jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.work_price_items (
  id uuid primary key default gen_random_uuid(),
  electrician_id uuid not null references public.profiles(id) on delete cascade,
  work_type text not null,
  name text not null,
  unit text not null default 'шт',
  unit_price numeric(14,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.project_work_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  work_price_item_id uuid references public.work_price_items(id) on delete set null,
  name text not null,
  work_type text not null default 'custom',
  quantity numeric(14,3) not null default 1,
  unit_price numeric(14,2) not null default 0,
  complexity_coefficient numeric(6,3) not null default 1,
  discount_percent numeric(5,2) not null default 0,
  total_price numeric(14,2) not null default 0,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  electrician_id uuid not null references public.profiles(id) on delete cascade,
  status public.project_status not null default 'draft',
  materials_total numeric(14,2) not null default 0,
  works_total numeric(14,2) not null default 0,
  delivery_total numeric(14,2) not null default 0,
  discount_total numeric(14,2) not null default 0,
  grand_total numeric(14,2) not null default 0,
  comments text,
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.estimate_versions (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  version_number integer not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(estimate_id, version_number)
);

create table if not exists public.estimate_lines (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  line_type text not null check (line_type in ('material', 'work', 'delivery', 'discount', 'other')),
  name text not null,
  quantity numeric(14,3) not null default 1,
  unit text,
  unit_price numeric(14,2) not null default 0,
  total_price numeric(14,2) not null default 0,
  meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.estimate_public_links (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.estimate_approvals (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  public_link_id uuid references public.estimate_public_links(id) on delete set null,
  decision text not null check (decision in ('confirmed', 'rejected')),
  comment text,
  client_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  logo_url text,
  description text,
  city text,
  address text,
  phone text,
  telegram text,
  website text,
  rating numeric(3,2) not null default 0,
  delivery_terms text,
  min_order_amount numeric(14,2) not null default 0,
  electrician_discount_percent numeric(5,2) not null default 2,
  platform_commission_percent numeric(5,2) not null default 3,
  verification_status public.verification_status not null default 'pending',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.material_requirements
  drop constraint if exists material_requirements_supplier_id_fkey;
alter table public.material_requirements
  add constraint material_requirements_supplier_id_fkey
  foreign key (supplier_id) references public.suppliers(id) on delete set null;

create table if not exists public.supplier_branches (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  name text not null,
  city text,
  address text,
  phone text,
  is_main boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.canonical_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.material_category not null default 'other',
  brand text,
  model text,
  sku text,
  unit text not null default 'шт',
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  canonical_product_id uuid references public.canonical_products(id) on delete set null,
  name text not null,
  brand text,
  model text,
  sku text,
  category public.material_category not null default 'other',
  unit text not null default 'шт',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.supplier_offers (
  id uuid primary key default gen_random_uuid(),
  supplier_product_id uuid not null references public.supplier_products(id) on delete cascade,
  branch_id uuid references public.supplier_branches(id) on delete set null,
  price numeric(14,2) not null check (price >= 0),
  stock numeric(14,3) not null default 0,
  pack_size numeric(14,3) not null default 1,
  min_qty numeric(14,3) not null default 1,
  delivery_days integer not null default 1,
  updated_offer_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  electrician_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  supplier_offer_id uuid references public.supplier_offers(id) on delete set null,
  name text not null,
  quantity numeric(14,3) not null default 1,
  unit_price numeric(14,2) not null default 0,
  total_price numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  electrician_id uuid not null references public.profiles(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  estimate_id uuid references public.estimates(id) on delete set null,
  status public.order_status not null default 'draft',
  subtotal numeric(14,2) not null default 0,
  discount_total numeric(14,2) not null default 0,
  delivery_total numeric(14,2) not null default 0,
  commission_total numeric(14,2) not null default 0,
  grand_total numeric(14,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  supplier_offer_id uuid references public.supplier_offers(id) on delete set null,
  name text not null,
  quantity numeric(14,3) not null default 1,
  unit_price numeric(14,2) not null default 0,
  total_price numeric(14,2) not null default 0,
  returned_qty numeric(14,3) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commission_ledger (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  electrician_id uuid not null references public.profiles(id) on delete cascade,
  base_amount numeric(14,2) not null,
  commission_percent numeric(5,2) not null,
  commission_amount numeric(14,2) not null,
  status text not null default 'pending' check (status in ('pending', 'accrued', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- indexes
create index if not exists idx_clients_electrician on public.clients(electrician_id) where deleted_at is null;
create index if not exists idx_projects_electrician on public.projects(electrician_id) where deleted_at is null;
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_rooms_project on public.rooms(project_id);
create index if not exists idx_points_project on public.electrical_points(project_id);
create index if not exists idx_materials_project on public.material_requirements(project_id);
create index if not exists idx_orders_electrician on public.orders(electrician_id);
create index if not exists idx_orders_supplier on public.orders(supplier_id);
create index if not exists idx_estimate_links_token on public.estimate_public_links(token);
create index if not exists idx_supplier_products_supplier on public.supplier_products(supplier_id);
create index if not exists idx_offers_product on public.supplier_offers(supplier_product_id);

-- updated_at triggers
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','electrician_profiles','clients','projects','project_photos','floors','rooms','room_photos',
    'device_types','electrical_points','electrical_panels','calculation_rules','project_calculations',
    'material_requirements','work_price_items','project_work_items','estimates','estimate_versions',
    'estimate_lines','estimate_public_links','estimate_approvals','suppliers','supplier_branches',
    'canonical_products','supplier_products','supplier_offers','carts','cart_items','orders','order_items',
    'order_status_history','commission_ledger','notifications','audit_logs'
  ]
  loop
    execute format('drop trigger if exists trg_%s_updated_at on public.%I', t, t);
    execute format('create trigger trg_%s_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  begin
    v_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'electrician');
  exception when others then
    v_role := 'electrician';
  end;
  if v_role <> 'electrician' then
    v_role := 'electrician';
  end if;

  insert into public.profiles (id, email, full_name, phone, city, company_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'company_name',
    v_role
  )
  on conflict (id) do nothing;

  insert into public.electrician_profiles (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and deleted_at is null and is_blocked = false
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_blocked = false and deleted_at is null)
$$;

create or replace function public.is_electrician()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'electrician' and is_blocked = false and deleted_at is null)
$$;

create or replace function public.is_supplier()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'supplier' and is_blocked = false and deleted_at is null)
$$;

create or replace function public.owns_project(p_project_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.projects where id = p_project_id and electrician_id = auth.uid() and deleted_at is null)
$$;

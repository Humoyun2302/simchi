-- SIMCHI RLS policies

alter table public.profiles enable row level security;
alter table public.electrician_profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_photos enable row level security;
alter table public.floors enable row level security;
alter table public.rooms enable row level security;
alter table public.room_photos enable row level security;
alter table public.device_types enable row level security;
alter table public.electrical_points enable row level security;
alter table public.electrical_panels enable row level security;
alter table public.calculation_rules enable row level security;
alter table public.project_calculations enable row level security;
alter table public.material_requirements enable row level security;
alter table public.work_price_items enable row level security;
alter table public.project_work_items enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_versions enable row level security;
alter table public.estimate_lines enable row level security;
alter table public.estimate_public_links enable row level security;
alter table public.estimate_approvals enable row level security;
alter table public.suppliers enable row level security;
alter table public.supplier_branches enable row level security;
alter table public.canonical_products enable row level security;
alter table public.supplier_products enable row level security;
alter table public.supplier_offers enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.commission_ledger enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all using (public.is_admin());

-- electrician profiles
drop policy if exists electrician_profiles_own on public.electrician_profiles;
create policy electrician_profiles_own on public.electrician_profiles for all using (profile_id = auth.uid() or public.is_admin());

-- clients
drop policy if exists clients_own on public.clients;
create policy clients_own on public.clients for all using (electrician_id = auth.uid() or public.is_admin()) with check (electrician_id = auth.uid() or public.is_admin());

-- projects
drop policy if exists projects_own on public.projects;
create policy projects_own on public.projects for all using (electrician_id = auth.uid() or public.is_admin()) with check (electrician_id = auth.uid() or public.is_admin());

-- project children helpers via owns_project
drop policy if exists project_photos_own on public.project_photos;
create policy project_photos_own on public.project_photos for all using (public.owns_project(project_id) or public.is_admin()) with check (public.owns_project(project_id) or public.is_admin());

drop policy if exists floors_own on public.floors;
create policy floors_own on public.floors for all using (public.owns_project(project_id) or public.is_admin()) with check (public.owns_project(project_id) or public.is_admin());

drop policy if exists rooms_own on public.rooms;
create policy rooms_own on public.rooms for all using (public.owns_project(project_id) or public.is_admin()) with check (public.owns_project(project_id) or public.is_admin());

drop policy if exists room_photos_own on public.room_photos;
create policy room_photos_own on public.room_photos for all using (
  exists(select 1 from public.rooms r where r.id = room_id and public.owns_project(r.project_id)) or public.is_admin()
) with check (
  exists(select 1 from public.rooms r where r.id = room_id and public.owns_project(r.project_id)) or public.is_admin()
);

drop policy if exists device_types_read on public.device_types;
create policy device_types_read on public.device_types for select using (auth.role() = 'authenticated');
drop policy if exists device_types_admin on public.device_types;
create policy device_types_admin on public.device_types for all using (public.is_admin());

drop policy if exists points_own on public.electrical_points;
create policy points_own on public.electrical_points for all using (public.owns_project(project_id) or public.is_admin()) with check (public.owns_project(project_id) or public.is_admin());

drop policy if exists panels_own on public.electrical_panels;
create policy panels_own on public.electrical_panels for all using (public.owns_project(project_id) or public.is_admin()) with check (public.owns_project(project_id) or public.is_admin());

drop policy if exists rules_read on public.calculation_rules;
create policy rules_read on public.calculation_rules for select using (auth.role() = 'authenticated' and is_active = true);
drop policy if exists rules_admin on public.calculation_rules;
create policy rules_admin on public.calculation_rules for all using (public.is_admin());

drop policy if exists calc_own on public.project_calculations;
create policy calc_own on public.project_calculations for all using (public.owns_project(project_id) or public.is_admin()) with check (public.owns_project(project_id) or public.is_admin());

drop policy if exists materials_own on public.material_requirements;
create policy materials_own on public.material_requirements for all using (public.owns_project(project_id) or public.is_admin()) with check (public.owns_project(project_id) or public.is_admin());

drop policy if exists work_price_own on public.work_price_items;
create policy work_price_own on public.work_price_items for all using (electrician_id = auth.uid() or public.is_admin()) with check (electrician_id = auth.uid() or public.is_admin());

drop policy if exists project_works_own on public.project_work_items;
create policy project_works_own on public.project_work_items for all using (public.owns_project(project_id) or public.is_admin()) with check (public.owns_project(project_id) or public.is_admin());

drop policy if exists estimates_own on public.estimates;
create policy estimates_own on public.estimates for all using (electrician_id = auth.uid() or public.is_admin()) with check (electrician_id = auth.uid() or public.is_admin());

drop policy if exists estimate_versions_own on public.estimate_versions;
create policy estimate_versions_own on public.estimate_versions for all using (
  exists(select 1 from public.estimates e where e.id = estimate_id and (e.electrician_id = auth.uid() or public.is_admin()))
);

drop policy if exists estimate_lines_own on public.estimate_lines;
create policy estimate_lines_own on public.estimate_lines for all using (
  exists(select 1 from public.estimates e where e.id = estimate_id and (e.electrician_id = auth.uid() or public.is_admin()))
);

drop policy if exists estimate_links_own on public.estimate_public_links;
create policy estimate_links_own on public.estimate_public_links for all using (
  exists(select 1 from public.estimates e where e.id = estimate_id and (e.electrician_id = auth.uid() or public.is_admin()))
);

drop policy if exists estimate_approvals_own on public.estimate_approvals;
create policy estimate_approvals_own on public.estimate_approvals for select using (
  exists(select 1 from public.estimates e where e.id = estimate_id and (e.electrician_id = auth.uid() or public.is_admin()))
);
drop policy if exists estimate_approvals_insert_public on public.estimate_approvals;
create policy estimate_approvals_insert_public on public.estimate_approvals for insert with check (true);

-- suppliers readable by authenticated; writable by owner/admin
drop policy if exists suppliers_read on public.suppliers;
create policy suppliers_read on public.suppliers for select using (auth.role() = 'authenticated' and deleted_at is null);
drop policy if exists suppliers_write_owner on public.suppliers;
create policy suppliers_write_owner on public.suppliers for all using (owner_profile_id = auth.uid() or public.is_admin()) with check (owner_profile_id = auth.uid() or public.is_admin());

drop policy if exists branches_read on public.supplier_branches;
create policy branches_read on public.supplier_branches for select using (auth.role() = 'authenticated');
drop policy if exists branches_write on public.supplier_branches;
create policy branches_write on public.supplier_branches for all using (
  public.is_admin() or exists(select 1 from public.suppliers s where s.id = supplier_id and s.owner_profile_id = auth.uid())
);

drop policy if exists canonical_read on public.canonical_products;
create policy canonical_read on public.canonical_products for select using (auth.role() = 'authenticated');
drop policy if exists canonical_admin on public.canonical_products;
create policy canonical_admin on public.canonical_products for all using (public.is_admin());

drop policy if exists supplier_products_read on public.supplier_products;
create policy supplier_products_read on public.supplier_products for select using (auth.role() = 'authenticated');
drop policy if exists supplier_products_write on public.supplier_products;
create policy supplier_products_write on public.supplier_products for all using (
  public.is_admin() or exists(select 1 from public.suppliers s where s.id = supplier_id and s.owner_profile_id = auth.uid())
);

drop policy if exists offers_read on public.supplier_offers;
create policy offers_read on public.supplier_offers for select using (auth.role() = 'authenticated');
drop policy if exists offers_write on public.supplier_offers;
create policy offers_write on public.supplier_offers for all using (
  public.is_admin() or exists(
    select 1 from public.supplier_products sp
    join public.suppliers s on s.id = sp.supplier_id
    where sp.id = supplier_product_id and s.owner_profile_id = auth.uid()
  )
);

drop policy if exists carts_own on public.carts;
create policy carts_own on public.carts for all using (electrician_id = auth.uid() or public.is_admin()) with check (electrician_id = auth.uid() or public.is_admin());

drop policy if exists cart_items_own on public.cart_items;
create policy cart_items_own on public.cart_items for all using (
  exists(select 1 from public.carts c where c.id = cart_id and (c.electrician_id = auth.uid() or public.is_admin()))
);

drop policy if exists orders_electrician on public.orders;
create policy orders_electrician on public.orders for all using (electrician_id = auth.uid() or public.is_admin()) with check (electrician_id = auth.uid() or public.is_admin());
drop policy if exists orders_supplier on public.orders;
create policy orders_supplier on public.orders for select using (
  exists(select 1 from public.suppliers s where s.id = supplier_id and s.owner_profile_id = auth.uid())
);
drop policy if exists orders_supplier_update on public.orders;
create policy orders_supplier_update on public.orders for update using (
  exists(select 1 from public.suppliers s where s.id = supplier_id and s.owner_profile_id = auth.uid())
);

drop policy if exists order_items_access on public.order_items;
create policy order_items_access on public.order_items for all using (
  exists(
    select 1 from public.orders o
    left join public.suppliers s on s.id = o.supplier_id
    where o.id = order_id and (o.electrician_id = auth.uid() or s.owner_profile_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists order_history_access on public.order_status_history;
create policy order_history_access on public.order_status_history for all using (
  exists(
    select 1 from public.orders o
    left join public.suppliers s on s.id = o.supplier_id
    where o.id = order_id and (o.electrician_id = auth.uid() or s.owner_profile_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists commission_admin on public.commission_ledger;
create policy commission_admin on public.commission_ledger for all using (public.is_admin());
drop policy if exists commission_supplier on public.commission_ledger;
create policy commission_supplier on public.commission_ledger for select using (
  exists(select 1 from public.suppliers s where s.id = supplier_id and s.owner_profile_id = auth.uid())
);

drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications for all using (profile_id = auth.uid() or public.is_admin());

drop policy if exists audit_admin on public.audit_logs;
create policy audit_admin on public.audit_logs for select using (public.is_admin());
drop policy if exists audit_insert on public.audit_logs;
create policy audit_insert on public.audit_logs for insert with check (auth.role() = 'authenticated');

-- Public estimate by token (security definer)
create or replace function public.get_public_estimate(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'estimate', to_jsonb(e),
    'lines', coalesce((select jsonb_agg(to_jsonb(l)) from public.estimate_lines l where l.estimate_id = e.id and l.deleted_at is null), '[]'::jsonb),
    'project', to_jsonb(p),
    'link', to_jsonb(lnk)
  )
  into result
  from public.estimate_public_links lnk
  join public.estimates e on e.id = lnk.estimate_id
  join public.projects p on p.id = e.project_id
  where lnk.token = p_token
    and lnk.is_active = true
    and (lnk.expires_at is null or lnk.expires_at > now())
    and e.deleted_at is null;

  return result;
end;
$$;

grant execute on function public.get_public_estimate(text) to anon, authenticated;

create or replace function public.submit_public_estimate_decision(p_token text, p_decision text, p_comment text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estimate_id uuid;
  v_link_id uuid;
begin
  if p_decision not in ('confirmed', 'rejected') then
    raise exception 'invalid decision';
  end if;

  select lnk.id, lnk.estimate_id into v_link_id, v_estimate_id
  from public.estimate_public_links lnk
  where lnk.token = p_token and lnk.is_active = true
    and (lnk.expires_at is null or lnk.expires_at > now());

  if v_estimate_id is null then
    return false;
  end if;

  insert into public.estimate_approvals(estimate_id, public_link_id, decision, comment)
  values (v_estimate_id, v_link_id, p_decision, p_comment);

  update public.estimates
  set status = case when p_decision = 'confirmed' then 'confirmed'::public.project_status else 'rejected'::public.project_status end
  where id = v_estimate_id;

  return true;
end;
$$;

grant execute on function public.submit_public_estimate_decision(text, text, text) to anon, authenticated;

-- Storage buckets for SIMCHI
insert into storage.buckets (id, name, public)
values
  ('project-photos', 'project-photos', true),
  ('room-photos', 'room-photos', true),
  ('point-photos', 'point-photos', true),
  ('supplier-logos', 'supplier-logos', true)
on conflict (id) do nothing;

drop policy if exists project_photos_public_read on storage.objects;
create policy project_photos_public_read on storage.objects
  for select using (bucket_id in ('project-photos', 'room-photos', 'point-photos', 'supplier-logos'));

drop policy if exists project_photos_auth_write on storage.objects;
create policy project_photos_auth_write on storage.objects
  for insert to authenticated
  with check (bucket_id in ('project-photos', 'room-photos', 'point-photos', 'supplier-logos'));

drop policy if exists project_photos_auth_update on storage.objects;
create policy project_photos_auth_update on storage.objects
  for update to authenticated
  using (bucket_id in ('project-photos', 'room-photos', 'point-photos', 'supplier-logos'));

drop policy if exists project_photos_auth_delete on storage.objects;
create policy project_photos_auth_delete on storage.objects
  for delete to authenticated
  using (bucket_id in ('project-photos', 'room-photos', 'point-photos', 'supplier-logos'));

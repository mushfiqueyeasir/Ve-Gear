-- VE-gear :: 0004 storage buckets & policies
-- Public read; writes restricted to staff (admin/editor).

insert into storage.buckets (id, name, public)
values
  ('product-images',   'product-images',   true),
  ('category-images',  'category-images',  true),
  ('review-images',    'review-images',    true),
  ('promotion-images', 'promotion-images', true),
  ('branding',         'branding',         true)
on conflict (id) do nothing;

-- Public read for every VE-gear bucket
drop policy if exists "vegear public read" on storage.objects;
create policy "vegear public read" on storage.objects
  for select using (
    bucket_id in ('product-images','category-images','review-images','promotion-images','branding')
  );

-- Staff insert
drop policy if exists "vegear staff insert" on storage.objects;
create policy "vegear staff insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('product-images','category-images','review-images','promotion-images','branding')
    and public.is_staff()
  );

-- Staff update
drop policy if exists "vegear staff update" on storage.objects;
create policy "vegear staff update" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('product-images','category-images','review-images','promotion-images','branding')
    and public.is_staff()
  )
  with check (
    bucket_id in ('product-images','category-images','review-images','promotion-images','branding')
    and public.is_staff()
  );

-- Staff delete
drop policy if exists "vegear staff delete" on storage.objects;
create policy "vegear staff delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('product-images','category-images','review-images','promotion-images','branding')
    and public.is_staff()
  );

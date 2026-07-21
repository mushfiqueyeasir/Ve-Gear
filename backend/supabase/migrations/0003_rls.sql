-- VE-gear :: 0003 row level security
-- Model:
--   public (anon) : read published storefront data; insert contact submissions.
--   staff (admin/editor) : full CRUD on catalog/orders/content.
--   admin : users/roles + settings + blocked_ips.
--   orders/order_items are written only through place_order() (SECURITY DEFINER),
--     so no anon insert policy is needed there.

alter table public.profiles            enable row level security;
alter table public.categories          enable row level security;
alter table public.products            enable row level security;
alter table public.product_images      enable row level security;
alter table public.product_variants    enable row level security;
alter table public.product_categories  enable row level security;
alter table public.customers           enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.promotions          enable row level security;
alter table public.reviews             enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.site_settings       enable row level security;
alter table public.blocked_ips         enable row level security;

-- helper to (re)create a policy idempotently
-- (Postgres has no "create policy if not exists"; drop first.)

-- ---- profiles ----
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- ---- categories ----
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (true);
drop policy if exists categories_staff_write on public.categories;
create policy categories_staff_write on public.categories
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- products ----
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select using (status = 'active' or public.is_staff());
drop policy if exists products_staff_write on public.products;
create policy products_staff_write on public.products
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- product_images ----
drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images for select using (true);
drop policy if exists product_images_staff_write on public.product_images;
create policy product_images_staff_write on public.product_images
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- product_variants ----
drop policy if exists product_variants_public_read on public.product_variants;
create policy product_variants_public_read on public.product_variants for select using (true);
drop policy if exists product_variants_staff_write on public.product_variants;
create policy product_variants_staff_write on public.product_variants
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- product_categories ----
drop policy if exists product_categories_public_read on public.product_categories;
create policy product_categories_public_read on public.product_categories for select using (true);
drop policy if exists product_categories_staff_write on public.product_categories;
create policy product_categories_staff_write on public.product_categories
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- customers (staff only; storefront never reads these) ----
drop policy if exists customers_staff_read on public.customers;
create policy customers_staff_read on public.customers for select using (public.is_staff());
drop policy if exists customers_staff_write on public.customers;
create policy customers_staff_write on public.customers
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- orders (staff manage; storefront writes via place_order RPC) ----
drop policy if exists orders_staff_read on public.orders;
create policy orders_staff_read on public.orders for select using (public.is_staff());
drop policy if exists orders_staff_write on public.orders;
create policy orders_staff_write on public.orders
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- order_items ----
drop policy if exists order_items_staff_read on public.order_items;
create policy order_items_staff_read on public.order_items for select using (public.is_staff());
drop policy if exists order_items_staff_write on public.order_items;
create policy order_items_staff_write on public.order_items
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- promotions ----
drop policy if exists promotions_public_read on public.promotions;
create policy promotions_public_read on public.promotions
  for select using (active or public.is_staff());
drop policy if exists promotions_staff_write on public.promotions;
create policy promotions_staff_write on public.promotions
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- reviews ----
drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews
  for select using (is_published or public.is_staff());
drop policy if exists reviews_staff_write on public.reviews;
create policy reviews_staff_write on public.reviews
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- contact_submissions (anyone may submit; staff read/manage) ----
drop policy if exists contact_public_insert on public.contact_submissions;
create policy contact_public_insert on public.contact_submissions
  for insert with check (true);
drop policy if exists contact_staff_read on public.contact_submissions;
create policy contact_staff_read on public.contact_submissions
  for select using (public.is_staff());
drop policy if exists contact_staff_write on public.contact_submissions;
create policy contact_staff_write on public.contact_submissions
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- site_settings (public read for storefront branding/analytics; admin write) ----
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings for select using (true);
drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- blocked_ips (admin only) ----
drop policy if exists blocked_ips_admin_all on public.blocked_ips;
create policy blocked_ips_admin_all on public.blocked_ips
  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists blocked_ips_staff_read on public.blocked_ips;
create policy blocked_ips_staff_read on public.blocked_ips
  for select using (public.is_staff());

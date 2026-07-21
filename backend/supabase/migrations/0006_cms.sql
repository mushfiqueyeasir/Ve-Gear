-- VE-gear :: 0006 CMS layer (hero banners + homepage sections + announcement bar)
-- Makes the storefront homepage fully admin-managed. Sections/banners are
-- read publicly only when active; the storefront hides anything with no data.

-- =========================================================================
-- Tables
-- =========================================================================

-- Hero banners / slides shown at the top of the homepage.
create table if not exists public.banners (
  id                uuid primary key default gen_random_uuid(),
  title             text,
  subtitle          text,
  image_path        text not null,
  mobile_image_path text,
  cta_label         text,
  cta_url           text,
  sort              int not null default 0,
  active            boolean not null default true,
  starts_at         timestamptz,
  ends_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists banners_active_sort_idx on public.banners (active, sort);

-- Ordered, toggleable homepage sections. `type` maps to a storefront renderer;
-- `config` carries optional per-section settings (e.g. product limit).
create table if not exists public.homepage_sections (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (
                type in ('hero','categories','featured','reviews','promo','richtext')
             ),
  title      text,
  subtitle   text,
  body       text,
  sort       int not null default 0,
  active     boolean not null default true,
  config     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists homepage_sections_active_sort_idx
  on public.homepage_sections (active, sort);

-- Announcement bar fields on the singleton site_settings row.
alter table public.site_settings
  add column if not exists announcement_text   text,
  add column if not exists announcement_active boolean not null default false,
  add column if not exists announcement_url    text;

-- =========================================================================
-- updated_at triggers (touch_updated_at defined in 0002)
-- =========================================================================

drop trigger if exists trg_banners_touch on public.banners;
create trigger trg_banners_touch before update on public.banners
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_homepage_sections_touch on public.homepage_sections;
create trigger trg_homepage_sections_touch before update on public.homepage_sections
  for each row execute function public.touch_updated_at();

-- =========================================================================
-- Row level security
-- =========================================================================

alter table public.banners           enable row level security;
alter table public.homepage_sections enable row level security;

-- banners: public reads only active (and inside schedule window); staff full CRUD.
drop policy if exists banners_public_read on public.banners;
create policy banners_public_read on public.banners
  for select using (
    public.is_staff()
    or (
      active
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
    )
  );
drop policy if exists banners_staff_write on public.banners;
create policy banners_staff_write on public.banners
  for all using (public.is_staff()) with check (public.is_staff());

-- homepage_sections: public reads active; staff full CRUD.
drop policy if exists homepage_sections_public_read on public.homepage_sections;
create policy homepage_sections_public_read on public.homepage_sections
  for select using (active or public.is_staff());
drop policy if exists homepage_sections_staff_write on public.homepage_sections;
create policy homepage_sections_staff_write on public.homepage_sections
  for all using (public.is_staff()) with check (public.is_staff());

-- =========================================================================
-- Storage bucket for banner imagery
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('banner-images', 'banner-images', true)
on conflict (id) do nothing;

drop policy if exists "vegear banner public read" on storage.objects;
create policy "vegear banner public read" on storage.objects
  for select using (bucket_id = 'banner-images');

drop policy if exists "vegear banner staff insert" on storage.objects;
create policy "vegear banner staff insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'banner-images' and public.is_staff());

drop policy if exists "vegear banner staff update" on storage.objects;
create policy "vegear banner staff update" on storage.objects
  for update to authenticated
  using (bucket_id = 'banner-images' and public.is_staff())
  with check (bucket_id = 'banner-images' and public.is_staff());

drop policy if exists "vegear banner staff delete" on storage.objects;
create policy "vegear banner staff delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'banner-images' and public.is_staff());

-- =========================================================================
-- Seed default homepage section layout (only when table is empty)
-- =========================================================================

insert into public.homepage_sections (type, title, subtitle, sort, active)
select * from (values
  ('hero'::text,       null::text,               null::text,                                          10, true),
  ('categories'::text, 'Shop by Category'::text, 'Find your fit across every collection'::text,       20, true),
  ('featured'::text,   'Featured Gear'::text,    'Handpicked pieces from the latest drop'::text,      30, true),
  ('reviews'::text,    'What People Say'::text,  'Real photos from the VE Gear community'::text,      40, true)
) as seed(type, title, subtitle, sort, active)
where not exists (select 1 from public.homepage_sections);

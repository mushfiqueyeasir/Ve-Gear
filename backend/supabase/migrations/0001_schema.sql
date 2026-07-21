-- VE-gear :: 0001 schema
-- Core tables for storefront + merchant panel.
-- Postgres / Supabase. Run in order 0001..0005.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'editor', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Profiles (mirrors auth.users, holds role)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        user_role not null default 'viewer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_path  text,
  sort        int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique,
  original_price numeric(12,2) not null default 0,
  current_price  numeric(12,2) not null default 0,
  description    jsonb,                       -- { "html": "<p>..</p>" }
  status         text not null default 'active', -- active | draft | archived
  product_type   text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists products_status_idx on public.products (status);

create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  path       text not null,
  alt        text,
  is_main    boolean not null default false,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images (product_id);

create table if not exists public.product_variants (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references public.products (id) on delete cascade,
  size                text,
  color               text,
  sku                 text,
  price_override      numeric(12,2),
  stock_quantity      int not null default 0,
  low_stock_threshold int not null default 5,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (product_id, size, color)
);
create index if not exists product_variants_product_idx on public.product_variants (product_id);

create table if not exists public.product_categories (
  product_id  uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (product_id, category_id)
);

-- ---------------------------------------------------------------------------
-- Customers + orders
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  phone        text unique,
  email        text,
  address      jsonb,
  orders_count int not null default 0,
  total_spent  numeric(12,2) not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create sequence if not exists order_number_seq start 1001;

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text not null unique default ('VE-' || nextval('order_number_seq')::text),
  status         order_status not null default 'pending',
  customer_id    uuid references public.customers (id) on delete set null,
  delivery       jsonb not null,   -- { country, firstName, lastName, address, city, postalCode, phone }
  totals         jsonb not null,   -- { subtotal, shipping, total }
  payment_method text not null default 'cod',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_customer_idx on public.orders (customer_id);
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  title      text,          -- snapshot of product title at purchase time
  size       text,
  color      text,
  quantity   int not null default 1,
  unit_price numeric(12,2) not null default 0
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------
create table if not exists public.promotions (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text,
  image_path       text,
  discount_percent numeric(5,2),
  active           boolean not null default true,
  starts_at        timestamptz,
  ends_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  customer_name text,
  image_path    text,
  rating        int check (rating between 1 and 5),
  body          text,
  product_id    uuid references public.products (id) on delete set null,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.contact_submissions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  phone        text,
  message      text not null,
  is_read      boolean not null default false,
  submitted_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Settings + operations
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                     int primary key default 1 check (id = 1),
  store_name             text not null default 'VE-gear',
  logo_path              text,
  contact_email          text,
  contact_phone          text,
  address                text,
  currency               text not null default 'USD',
  currency_symbol        text not null default '$',
  shipping_flat          numeric(12,2) not null default 0,
  free_shipping_threshold numeric(12,2),
  socials                jsonb not null default '{}'::jsonb,
  google_analytics_id    text,
  meta_pixel_id          text,
  gtm_id                 text,
  analytics_enabled      boolean not null default false,
  security_enabled       boolean not null default false,
  updated_at             timestamptz not null default now()
);

create table if not exists public.blocked_ips (
  id         uuid primary key default gen_random_uuid(),
  ip         text not null unique,
  reason     text,
  created_at timestamptz not null default now()
);

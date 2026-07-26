-- VE-gear :: 0014 promo codes (checkout flat % off, excl. delivery)

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  percent numeric(5, 2) not null
    check (percent > 0 and percent <= 100),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promo_codes_dates_check check (ends_at > starts_at)
);

create unique index if not exists promo_codes_code_upper_uidx
  on public.promo_codes (upper(code));

create index if not exists promo_codes_active_window_idx
  on public.promo_codes (active, starts_at, ends_at);

alter table public.promo_codes enable row level security;

-- Staff manage codes in admin; storefront validation uses service role.
drop policy if exists promo_codes_staff_read on public.promo_codes;
create policy promo_codes_staff_read on public.promo_codes
  for select using (public.is_staff());

drop policy if exists promo_codes_staff_write on public.promo_codes;
create policy promo_codes_staff_write on public.promo_codes
  for all using (public.is_staff()) with check (public.is_staff());

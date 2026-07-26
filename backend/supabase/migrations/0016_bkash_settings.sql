-- Private bKash PGW settings (admin-only; not on public site_settings).
create table if not exists public.bkash_settings (
  id          int primary key default 1 check (id = 1),
  enabled     boolean not null default false,
  sandbox     boolean not null default true,
  username    text,
  password    text,
  app_key     text,
  app_secret  text,
  updated_at  timestamptz not null default now()
);

insert into public.bkash_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.bkash_settings enable row level security;

drop policy if exists bkash_settings_admin_all on public.bkash_settings;
create policy bkash_settings_admin_all on public.bkash_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Order payment tracking for COD + bKash
alter table public.orders
  add column if not exists payment_status text not null default 'unpaid';

alter table public.orders
  add column if not exists bkash_payment_id text;

alter table public.orders
  add column if not exists bkash_trx_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_payment_status_check'
  ) then
    alter table public.orders
      add constraint orders_payment_status_check
      check (payment_status in ('unpaid', 'paid', 'failed'));
  end if;
end $$;

create index if not exists orders_bkash_payment_id_idx
  on public.orders (bkash_payment_id)
  where bkash_payment_id is not null;

-- place_order: accept payment_method; set payment_status unpaid
create or replace function public.place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_payment_method text;
  item jsonb;
begin
  if payload -> 'delivery' is null or payload -> 'items' is null or payload -> 'totals' is null then
    raise exception 'delivery, items and totals are required';
  end if;

  v_payment_method := lower(coalesce(nullif(payload ->> 'payment_method', ''), 'cod'));
  if v_payment_method not in ('cod', 'bkash') then
    v_payment_method := 'cod';
  end if;

  insert into public.orders (delivery, totals, notes, payment_method, payment_status)
  values (
    payload -> 'delivery',
    payload -> 'totals',
    nullif(payload ->> 'notes', ''),
    v_payment_method,
    'unpaid'
  )
  returning id, order_number into v_order_id, v_order_number;

  for item in select * from jsonb_array_elements(payload -> 'items') loop
    insert into public.order_items
      (order_id, product_id, variant_id, title, size, color, quantity, unit_price)
    values (
      v_order_id,
      nullif(item ->> 'product_id', '')::uuid,
      nullif(item ->> 'variant_id', '')::uuid,
      item ->> 'title',
      item ->> 'size',
      item ->> 'color',
      coalesce((item ->> 'quantity')::int, 1),
      coalesce((item ->> 'unit_price')::numeric, 0)
    );

    if nullif(item ->> 'variant_id', '') is not null then
      update public.product_variants
        set stock_quantity = greatest(0, stock_quantity - coalesce((item ->> 'quantity')::int, 1))
        where id = (item ->> 'variant_id')::uuid;
    end if;
  end loop;

  return jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
end;
$$;

grant execute on function public.place_order(jsonb) to anon, authenticated;

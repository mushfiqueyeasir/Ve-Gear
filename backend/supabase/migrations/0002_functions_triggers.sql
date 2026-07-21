-- VE-gear :: 0002 functions & triggers

-- ---------------------------------------------------------------------------
-- Role helpers (used by RLS). SECURITY DEFINER so policies can read profiles
-- without recursive RLS checks.
-- ---------------------------------------------------------------------------
create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'admin', false);
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()) in ('admin', 'editor'),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','categories','products','product_variants','customers',
    'orders','promotions','site_settings'
  ] loop
    execute format(
      'drop trigger if exists trg_touch_%1$s on public.%1$s;
       create trigger trg_touch_%1$s before update on public.%1$s
         for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- New auth user -> profile. First ever user becomes admin, rest viewer.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned user_role;
begin
  if not exists (select 1 from public.profiles) then
    assigned := 'admin';
  else
    assigned := 'viewer';
  end if;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    assigned
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Customer upsert + aggregates driven from orders
-- ---------------------------------------------------------------------------
create or replace function public.resolve_order_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone text := nullif(trim(new.delivery ->> 'phone'), '');
  v_name  text := trim(coalesce(new.delivery ->> 'firstName','') || ' ' || coalesce(new.delivery ->> 'lastName',''));
  v_customer_id uuid;
begin
  if new.customer_id is not null then
    return new;
  end if;

  if v_phone is null then
    return new; -- no phone, cannot dedupe; leave customer_id null
  end if;

  select id into v_customer_id from public.customers where phone = v_phone;

  if v_customer_id is null then
    insert into public.customers (name, phone, address)
    values (nullif(v_name,''), v_phone, new.delivery)
    returning id into v_customer_id;
  else
    update public.customers
      set name = coalesce(nullif(v_name,''), name),
          address = new.delivery,
          updated_at = now()
      where id = v_customer_id;
  end if;

  new.customer_id := v_customer_id;
  return new;
end;
$$;

drop trigger if exists trg_resolve_order_customer on public.orders;
create trigger trg_resolve_order_customer
  before insert on public.orders
  for each row execute function public.resolve_order_customer();

create or replace function public.recompute_customer_totals(p_customer_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.customers c set
    orders_count = coalesce(agg.cnt, 0),
    total_spent  = coalesce(agg.spent, 0),
    updated_at   = now()
  from (
    select
      count(*) filter (where status <> 'cancelled') as cnt,
      sum((totals ->> 'total')::numeric) filter (where status <> 'cancelled') as spent
    from public.orders
    where customer_id = p_customer_id
  ) agg
  where c.id = p_customer_id;
$$;

create or replace function public.after_order_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.customer_id is not null then
      perform public.recompute_customer_totals(old.customer_id);
    end if;
    return old;
  end if;

  if new.customer_id is not null then
    perform public.recompute_customer_totals(new.customer_id);
  end if;
  if tg_op = 'UPDATE' and old.customer_id is distinct from new.customer_id
     and old.customer_id is not null then
    perform public.recompute_customer_totals(old.customer_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_after_order_change on public.orders;
create trigger trg_after_order_change
  after insert or update or delete on public.orders
  for each row execute function public.after_order_change();

-- ---------------------------------------------------------------------------
-- place_order RPC: atomic order + items, customer handled by trigger above.
-- Callable by anon (storefront checkout). SECURITY DEFINER bypasses RLS.
-- payload:
--   { delivery:{...}, items:[{product_id,variant_id,size,color,quantity,unit_price,title}],
--     totals:{subtotal,shipping,total}, notes }
-- ---------------------------------------------------------------------------
create or replace function public.place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  item jsonb;
begin
  if payload -> 'delivery' is null or payload -> 'items' is null or payload -> 'totals' is null then
    raise exception 'delivery, items and totals are required';
  end if;

  insert into public.orders (delivery, totals, notes)
  values (payload -> 'delivery', payload -> 'totals', nullif(payload ->> 'notes',''))
  returning id, order_number into v_order_id, v_order_number;

  for item in select * from jsonb_array_elements(payload -> 'items') loop
    insert into public.order_items
      (order_id, product_id, variant_id, title, size, color, quantity, unit_price)
    values (
      v_order_id,
      nullif(item ->> 'product_id','')::uuid,
      nullif(item ->> 'variant_id','')::uuid,
      item ->> 'title',
      item ->> 'size',
      item ->> 'color',
      coalesce((item ->> 'quantity')::int, 1),
      coalesce((item ->> 'unit_price')::numeric, 0)
    );

    -- decrement stock if a variant was specified
    if nullif(item ->> 'variant_id','') is not null then
      update public.product_variants
        set stock_quantity = greatest(0, stock_quantity - coalesce((item ->> 'quantity')::int, 1))
        where id = (item ->> 'variant_id')::uuid;
    end if;
  end loop;

  return jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
end;
$$;

grant execute on function public.place_order(jsonb) to anon, authenticated;

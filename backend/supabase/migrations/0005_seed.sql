-- VE-gear :: 0005 seed
-- Default singleton settings + a small demo catalog so the storefront renders
-- immediately. Safe to run repeatedly (idempotent on slugs / singleton id).

insert into public.site_settings (id, store_name, currency, currency_symbol, contact_email, shipping_flat, free_shipping_threshold)
values (1, 'VE-gear', 'USD', '$', 'support@ve-gear.com', 5, 100)
on conflict (id) do nothing;

-- Categories
insert into public.categories (name, slug, description, sort) values
  ('Apparel',     'apparel',     'Performance wear and everyday essentials', 1),
  ('Accessories', 'accessories', 'Complete the look',                        2),
  ('Footwear',    'footwear',    'Built for the long haul',                  3)
on conflict (slug) do nothing;

-- Demo products with variants (only if the catalog is empty)
do $$
declare
  cat_apparel uuid;
  p1 uuid; p2 uuid;
begin
  if exists (select 1 from public.products) then
    return;
  end if;

  select id into cat_apparel from public.categories where slug = 'apparel';

  insert into public.products (title, slug, original_price, current_price, description, status, product_type)
  values ('Core Training Tee', 'core-training-tee', 45, 35,
          '{"html":"<p>Lightweight, breathable training tee built for movement.</p>"}', 'active', 'tee')
  returning id into p1;

  insert into public.products (title, slug, original_price, current_price, description, status, product_type)
  values ('All-Day Hoodie', 'all-day-hoodie', 90, 72,
          '{"html":"<p>Mid-weight fleece hoodie with a relaxed fit.</p>"}', 'active', 'hoodie')
  returning id into p2;

  insert into public.product_categories (product_id, category_id) values (p1, cat_apparel), (p2, cat_apparel);

  insert into public.product_variants (product_id, size, color, sku, stock_quantity) values
    (p1, 'M',  'Black', 'CTT-M-BLK',  25),
    (p1, 'L',  'Black', 'CTT-L-BLK',  18),
    (p1, 'XL', 'Black', 'CTT-XL-BLK', 3),
    (p2, 'M',  'Grey',  'ADH-M-GRY',  12),
    (p2, 'L',  'Grey',  'ADH-L-GRY',  0);
end $$;

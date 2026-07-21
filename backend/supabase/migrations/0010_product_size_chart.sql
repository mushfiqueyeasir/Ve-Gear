-- VE-gear :: 0010 product size chart
-- Optional per-product size guide shown on the storefront when provided.
-- Shape: [{ "size": "M", "chest": "22", "length": "28" }, ...]
-- Null / empty array = no size chart UI.

alter table public.products
  add column if not exists size_chart jsonb default null;

comment on column public.products.size_chart is
  'Optional size guide rows: [{size, chest, length}, ...] in inches.';

-- Seed a default tee chart on existing active products that have none
update public.products
set size_chart = '[
  {"size":"M","chest":"22","length":"28"},
  {"size":"L","chest":"23","length":"29"},
  {"size":"XL","chest":"24.5","length":"30"},
  {"size":"2XL","chest":"26","length":"31"}
]'::jsonb
where size_chart is null
  and status = 'active'
  and coalesce(product_type, '') in ('tee', 't-shirt', 'tshirt', '');

-- VE-gear :: 0009 product catalog sort order
-- Lets admin drag-reorder products on the storefront / admin list.

alter table public.products
  add column if not exists sort int not null default 0;

create index if not exists products_sort_idx on public.products (sort, created_at desc);

-- Seed existing rows with a stable order from created_at (oldest first → lower sort).
with ordered as (
  select id, (row_number() over (order by created_at asc, id asc)) * 10 as next_sort
  from public.products
)
update public.products p
set sort = ordered.next_sort
from ordered
where p.id = ordered.id and p.sort = 0;

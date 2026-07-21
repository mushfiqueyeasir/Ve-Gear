-- VE-gear :: 0007 CMS pages (about / terms / privacy / refund)
-- Optional when using the JSON CMS fallback in site_settings.socials._cms.
-- Prefer applying 0006_cms.sql first.

create table if not exists public.content_pages (
  slug       text primary key check (slug in ('about','terms','privacy','refund')),
  title      text not null,
  body_html  text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.content_pages enable row level security;

drop policy if exists content_pages_public_read on public.content_pages;
create policy content_pages_public_read on public.content_pages
  for select using (true);

drop policy if exists content_pages_staff_write on public.content_pages;
create policy content_pages_staff_write on public.content_pages
  for all using (public.is_staff()) with check (public.is_staff());

drop trigger if exists trg_content_pages_touch on public.content_pages;
create trigger trg_content_pages_touch before update on public.content_pages
  for each row execute function public.touch_updated_at();

insert into public.content_pages (slug, title, body_html)
values
  ('about', 'About VE Gear', '<p>VE Gear was built for riders who want premium streetwear that performs.</p>'),
  ('terms', 'Terms of Service', '<p>By using VE Gear you agree to these terms.</p>'),
  ('privacy', 'Privacy Policy', '<p>We respect your privacy and protect your data.</p>'),
  ('refund', 'Shipping &amp; Return Policy', '<p>Orders ship via Pathao. Returns accepted within 7 days for unused items.</p>')
on conflict (slug) do nothing;

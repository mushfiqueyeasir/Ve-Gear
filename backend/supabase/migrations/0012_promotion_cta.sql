-- VE-gear :: 0012 promotion CTA (link promo modal / strip to a product or URL)

alter table public.promotions
  add column if not exists cta_url text,
  add column if not exists cta_label text;

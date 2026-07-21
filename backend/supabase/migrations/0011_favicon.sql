-- VE-gear :: 0011 favicon
-- Optional browser tab icon, uploaded from Admin → Settings → Brand.

alter table public.site_settings
  add column if not exists favicon_path text;

comment on column public.site_settings.favicon_path is
  'Storage object path in the branding bucket for the site favicon.';

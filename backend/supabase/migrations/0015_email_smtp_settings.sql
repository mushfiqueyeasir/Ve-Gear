-- Private SMTP settings for order notification emails.
-- Intentionally NOT on site_settings (that table is publicly readable).

create table if not exists public.email_smtp_settings (
  id              int primary key default 1 check (id = 1),
  enabled         boolean not null default false,
  provider        text not null default 'gmail'
                    check (provider in ('gmail', 'smtp')),
  host            text,
  port            int not null default 587,
  secure          boolean not null default false, -- true = TLS on connect (465)
  username        text,
  password        text,
  from_name       text not null default 'VE Gear',
  from_email      text,
  notify_emails   text[] not null default '{}',
  updated_at      timestamptz not null default now()
);

insert into public.email_smtp_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.email_smtp_settings enable row level security;

drop policy if exists email_smtp_settings_admin_all on public.email_smtp_settings;
create policy email_smtp_settings_admin_all on public.email_smtp_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- No public/anon read policy — only admins (and service role) can access.

-- VE-gear :: 0013 audit logs (append-only admin / store activity)

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text,
  actor_role text,
  action text not null,
  entity text not null,
  entity_id text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);

create index if not exists audit_logs_entity_created_at_idx
  on public.audit_logs (entity, created_at desc);

create index if not exists audit_logs_actor_created_at_idx
  on public.audit_logs (actor_id, created_at desc);

alter table public.audit_logs enable row level security;

-- Admins can read; writes go through the service-role client only.
drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs
  for select using (public.is_admin());

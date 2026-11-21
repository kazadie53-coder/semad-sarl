-- Exécuter dans Supabase SQL Editor avant de déployer semad-notify.
-- Une notification par publication et par abonné : empêche les doubles envois.
create table if not exists public.semad_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  email text not null,
  sent_at timestamptz not null default now(),
  unique(post_id,email)
);
alter table public.semad_notification_deliveries enable row level security;
revoke all on public.semad_notification_deliveries from anon, authenticated;
grant select, insert, delete on public.semad_notification_deliveries to service_role;
-- Cette table est strictement privée : aucun accès direct aux visiteurs.

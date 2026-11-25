begin;
create table if not exists public.semad_internal_records (
 id uuid primary key default gen_random_uuid(),
 category text not null check(category in ('Courrier','Document','Finance','Personnel','Activité')),
 title text not null check(char_length(title) between 1 and 200),
 record_date date not null default current_date,
 notes text not null default '',
 status text not null default 'En cours' check(status in ('En cours','Terminé','Archivé')),
 created_at timestamptz not null default now()
);
alter table public.semad_internal_records enable row level security;
revoke all on public.semad_internal_records from anon;
grant select,insert,update,delete on public.semad_internal_records to authenticated;
drop policy if exists internal_admin_only on public.semad_internal_records;
create policy internal_admin_only on public.semad_internal_records for all to authenticated using (exists(select 1 from public.semad_admins a where a.user_id=auth.uid())) with check (exists(select 1 from public.semad_admins a where a.user_id=auth.uid()));
commit;
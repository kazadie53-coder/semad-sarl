-- À exécuter une seule fois dans Supabase SQL Editor.
create table if not exists public.semad_applications (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 name text not null, email text not null, phone text not null,
 city text not null, domain text not null, motivation text not null,
 job_title text, cv_path text not null,
 status text not null default 'reçue'
);
alter table public.semad_applications enable row level security;
revoke all on public.semad_applications from anon, authenticated;
grant select, update on public.semad_applications to authenticated;
drop policy if exists "Administrateurs consultent candidatures" on public.semad_applications;
create policy "Administrateurs consultent candidatures" on public.semad_applications for select to authenticated
 using (exists(select 1 from public.semad_admins a where a.user_id=(select auth.uid())));
drop policy if exists "Administrateurs modifient candidatures" on public.semad_applications;
create policy "Administrateurs modifient candidatures" on public.semad_applications for update to authenticated
 using (exists(select 1 from public.semad_admins a where a.user_id=(select auth.uid())))
 with check (exists(select 1 from public.semad_admins a where a.user_id=(select auth.uid())));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('semad-cv','semad-cv',false,5242880,array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
 on conflict (id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Administrateurs lisent CV" on storage.objects;
create policy "Administrateurs lisent CV" on storage.objects for select to authenticated
 using(bucket_id='semad-cv' and exists(select 1 from public.semad_admins a where a.user_id=(select auth.uid())));

-- À exécuter dans le SQL Editor du projet Supabase SEMAD SARL.
create table if not exists public.semad_admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.semad_posts (
 id uuid primary key default gen_random_uuid(),
 title text not null, date date not null default current_date,
 summary text not null default '', content text not null,
 created_at timestamptz not null default now()
);
alter table public.semad_admins enable row level security;
alter table public.semad_posts enable row level security;
revoke all on public.semad_admins from anon, authenticated;
revoke all on public.semad_posts from anon, authenticated;
grant select on public.semad_admins to authenticated;
grant select,insert,update,delete on public.semad_posts to authenticated;
grant select on public.semad_posts to anon;
create policy "Admins see own membership" on public.semad_admins for select to authenticated using (user_id = (select auth.uid()));
create policy "Public can read posts" on public.semad_posts for select to anon, authenticated using (true);
create policy "Admins can insert posts" on public.semad_posts for insert to authenticated with check (exists (select 1 from public.semad_admins where user_id=(select auth.uid())));
create policy "Admins can update posts" on public.semad_posts for update to authenticated using (exists (select 1 from public.semad_admins where user_id=(select auth.uid()))) with check (exists (select 1 from public.semad_admins where user_id=(select auth.uid())));
create policy "Admins can delete posts" on public.semad_posts for delete to authenticated using (exists (select 1 from public.semad_admins where user_id=(select auth.uid())));
-- Après avoir créé l'utilisateur administrateur dans Authentication > Users :
-- insert into public.semad_admins(user_id) values ('UUID_DE_L_UTILISATEUR');

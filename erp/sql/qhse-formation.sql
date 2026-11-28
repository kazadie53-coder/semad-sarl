begin;
create table if not exists public.erp_qhse_questions(id integer primary key,module text not null,question text not null,options jsonb not null,correct integer not null);
create table if not exists public.erp_qhse_resultats(id uuid primary key default gen_random_uuid(),agent_id uuid not null references public.erp_agents(id),nom text not null,matricule text,fonction text,departement text,reponses jsonb not null,score integer not null,total integer not null,created_at timestamptz default now());
alter table public.erp_qhse_questions enable row level security;
alter table public.erp_qhse_resultats enable row level security;
create or replace function public.erp_qhse_responsable() returns boolean language sql stable security definer set search_path='' as $$ select public.erp_agent_actif() and (public.erp_a_role('ADMIN') or exists(select 1 from public.erp_agents a join public.erp_departements d on d.id=a.departement_id where a.id=auth.uid() and lower(d.nom) ~ '(qhse|hse|qualité)' and lower(a.fonction) ~ '(responsable|directeur|chef|manager)')) $$;
revoke all on function public.erp_qhse_responsable() from public;
grant execute on function public.erp_qhse_responsable() to authenticated;
drop policy if exists qhse_resultats_lecture on public.erp_qhse_resultats;
create policy qhse_resultats_lecture on public.erp_qhse_resultats for select to authenticated using (public.erp_agent_actif() and (agent_id=auth.uid() or public.erp_qhse_responsable()));
grant select on public.erp_qhse_resultats to authenticated;
revoke all on public.erp_qhse_questions from anon,authenticated;
insert into public.erp_qhse_questions(id,module,question,options,correct) values
(1,'Induction QHSE','Que faire devant un danger non maîtrisé ?','["Continuer rapidement","Arrêter et signaler","Ignorer"]'::jsonb,1),
(2,'Induction QHSE','Avant une tâche, que vérifier ?','["Les dangers et consignes","La météo uniquement","Rien"]'::jsonb,0),
(3,'Induction QHSE','Une consigne est incomprise ?','["Deviner","Demander clarification","Ignorer"]'::jsonb,1),
(4,'Induction QHSE','Qui contribue à la sécurité ?','["Seulement HSE","Seulement DG","Tous les agents"]'::jsonb,2),
(5,'Induction QHSE','Une zone est interdite ?','["Respecter le balisage","Entrer rapidement","Retirer le panneau"]'::jsonb,0),
(6,'Équipements de protection individuelle','Un EPI est endommagé. Que faire ?','["Le remplacer avant utilisation","Le porter quand même","Le prêter"]'::jsonb,0),
(7,'Équipements de protection individuelle','Choix des EPI ?','["Selon le risque","Selon la couleur","Au hasard"]'::jsonb,0),
(8,'Équipements de protection individuelle','Les EPI remplacent-ils les protections collectives ?','["Oui","Non","Toujours"]'::jsonb,1),
(9,'Équipements de protection individuelle','Avant usage ?','["Inspecter les EPI","Les modifier","Les partager sans contrôle"]'::jsonb,0),
(10,'Équipements de protection individuelle','Protection auditive ?','["Selon évaluation du bruit","Jamais","Seulement dehors"]'::jsonb,0),
(11,'Analyse des risques','Quand réévaluer les risques ?','["Jamais","Seulement en fin de journée","Lorsque les conditions changent"]'::jsonb,2),
(12,'Analyse des risques','Priorité de prévention ?','["Éliminer le danger","Distribuer des EPI uniquement","Ignorer"]'::jsonb,0),
(13,'Analyse des risques','Un danger est ?','["Une source potentielle de dommage","Un salaire","Un rapport"]'::jsonb,0),
(14,'Analyse des risques','Un risque combine ?','["Probabilité et gravité","Prix et quantité","Date et heure"]'::jsonb,0),
(15,'Analyse des risques','Avant une tâche nouvelle ?','["Évaluer les risques","Commencer seul","Attendre un accident"]'::jsonb,0),
(16,'Incidents et presque-accidents','Un presque-accident doit-il être signalé ?','["Oui","Non","Seulement si blessure"]'::jsonb,0),
(17,'Incidents et presque-accidents','Après un incident ?','["Alerter et sécuriser sans exposition","Cacher les faits","Effacer les traces"]'::jsonb,0),
(18,'Incidents et presque-accidents','Le rapport doit être ?','["Factuel","Inventé","Anonyme obligatoirement"]'::jsonb,0),
(19,'Incidents et presque-accidents','But de l''enquête ?','["Prévenir la répétition","Punir systématiquement","Cacher"]'::jsonb,0),
(20,'Incidents et presque-accidents','Un témoin doit ?','["Rapporter les faits observés","Inventer","Se taire"]'::jsonb,0),
(21,'Incendie et évacuation','Après évacuation, où aller ?','["Au point de rassemblement","Retourner au bureau","Partir sans prévenir"]'::jsonb,0),
(22,'Incendie et évacuation','Une alarme retentit ?','["Suivre les consignes d''évacuation","Finir son travail","Se cacher"]'::jsonb,0),
(23,'Incendie et évacuation','Sortie obstruée ?','["Signaler et utiliser un trajet sûr","Forcer le passage dangereux","Ignorer"]'::jsonb,0),
(24,'Incendie et évacuation','Retour dans le bâtiment ?','["Après autorisation","Immédiatement","Pour récupérer un sac"]'::jsonb,0),
(25,'Incendie et évacuation','Extincteur ?','["Uniquement si formé et conditions sûres","Toujours combattre","Jamais alerter"]'::jsonb,0),
(26,'Premiers secours','Qui alerter ?','["Personne","Les secours et le secouriste","Uniquement un collègue"]'::jsonb,1),
(27,'Premiers secours','Avant d''aider ?','["Vérifier la sécurité de la zone","Courir sans regarder","Déplacer tout le monde"]'::jsonb,0),
(28,'Premiers secours','Victime inconsciente ?','["Alerter les secours et suivre leurs instructions","Donner à boire","La laisser seule"]'::jsonb,0),
(29,'Premiers secours','Matériel de secours ?','["Connaître son emplacement","Le cacher","Le verrouiller sans accès"]'::jsonb,0),
(30,'Premiers secours','Soins hors compétence ?','["Attendre les secours qualifiés","Improviser","Donner des médicaments inconnus"]'::jsonb,0),
(31,'Environnement et qualité','Que faire devant un déversement inconnu ?','["Le toucher","Le jeter à l''égout","Isoler si possible et alerter"]'::jsonb,2),
(32,'Environnement et qualité','Déchets dangereux ?','["Suivre la filière prévue","Mélanger","Brûler librement"]'::jsonb,0),
(33,'Environnement et qualité','Fuite détectée ?','["Signaler et appliquer les consignes","Ignorer","Laver à l''égout"]'::jsonb,0),
(34,'Environnement et qualité','Produit non conforme ?','["Isoler et signaler","Livrer","Masquer"]'::jsonb,0),
(35,'Environnement et qualité','Étiquette chimique ?','["Lire avant usage","Retirer","Ignorer"]'::jsonb,0),
(36,'Comportement professionnel','Une tâche exige une habilitation que vous n''avez pas. Que faire ?','["Refuser de commencer et informer le responsable","Essayer seul","Demander à un collègue de couvrir"]'::jsonb,0),
(37,'Comportement professionnel','Causerie sécurité ?','["Participer activement","Ignorer","Quitter"]'::jsonb,0),
(38,'Comportement professionnel','Fatigue dangereuse ?','["Informer le responsable","Cacher","Continuer coûte que coûte"]'::jsonb,0),
(39,'Comportement professionnel','Pression pour travailler dangereusement ?','["Arrêter et signaler","Obéir sans réserve","Se taire"]'::jsonb,0),
(40,'Comportement professionnel','Respect des collègues ?','["Obligatoire","Facultatif","Réservé aux chefs"]'::jsonb,0)
on conflict(id) do update set module=excluded.module,question=excluded.question,options=excluded.options,correct=excluded.correct;
create or replace function public.erp_qhse_soumettre(p_reponses jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare a record; n integer; sc integer; detail jsonb; rid uuid;
begin
if not public.erp_agent_actif() then raise exception 'Compte inactif'; end if;
select ag.*,d.nom as dep into a from public.erp_agents ag left join public.erp_departements d on d.id=ag.departement_id where ag.id=auth.uid();
select count(*),count(*) filter(where (p_reponses->>q.id::text)::integer=q.correct),jsonb_agg(jsonb_build_object('module',q.module,'question',q.question,'reponse',q.options->((p_reponses->>q.id::text)::integer),'correction',q.options->q.correct,'juste',(p_reponses->>q.id::text)::integer=q.correct) order by q.id) into n,sc,detail from public.erp_qhse_questions q where p_reponses->>q.id::text in ('0','1','2');
if n<>40 then raise exception 'Répondez aux 40 questions'; end if;
insert into public.erp_qhse_resultats(agent_id,nom,matricule,fonction,departement,reponses,score,total) values(a.id,a.nom_complet,a.matricule,a.fonction,a.dep,detail,sc,n) returning id into rid;
return rid;
end $$;
revoke all on function public.erp_qhse_soumettre(jsonb) from public;
grant execute on function public.erp_qhse_soumettre(jsonb) to authenticated;
commit;
# Installation sécurisée SEMAD SARL
1. Créer un projet Supabase appartenant à SEMAD SARL sur https://supabase.com/dashboard.
2. Exécuter le fichier admin/schema.sql dans SQL Editor.
3. Créer le compte administrateur dans Authentication > Users, puis insérer son UUID dans semad_admins comme indiqué à la fin du SQL.
4. Dans admin/config.json remplacer les deux valeurs d'exemple par Project URL et publishable key (clé publique seulement). Ne jamais publier la clé secret/service_role.
5. Ouvrir /semad-sarl/admin/ et se connecter avec l'e-mail et le mot de passe Supabase.
6. Les publications Supabase doivent ensuite être raccordées à la section Actualités publique (news.js). Tant que cette étape n'est pas effectuée, les nouvelles publications seront stockées dans Supabase mais non affichées sur la page d'accueil.
Note : ne pas utiliser les anciens jetons GitHub ; ce portail ne les demande pas.

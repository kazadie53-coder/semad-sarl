# Activation des candidatures — SEMAD SARL

## État réel
- Interface administrateur : ajoutée au site (liste, statut, CV).
- Table SQL et stockage privé : script dans `supabase/applications.sql` (à vérifier dans le projet).
- Edge Function : code préparé dans `supabase/functions/semad-receive-application/index.ts`.
- Formulaire public : **toujours FormSubmit**. Ne pas le basculer avant un test réel.
- Notifications : **non activées** tant que Resend n'est pas configuré.

## Opérations réservées au compte Supabase (non réalisables par GitHub)
1. Vérifier dans SQL Editor que le script `supabase/applications.sql` est appliqué. Le bucket doit s'appeler exactement `semad-cv`, et rester **privé**.
2. Dans Edge Functions, créer `semad-receive-application`, copier le fichier `index.ts`, puis déployer avec la vérification JWT **désactivée pour cette fonction publique uniquement**. L'accès public est protégé par la validation des données et Cloudflare Turnstile.
3. Dans les secrets de la fonction, renseigner `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (ou clé secrète serveur adaptée), `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` et `SEMAD_NOTIFICATION_FROM`. Ne jamais mettre ces secrets dans GitHub ou le navigateur.
4. Configurer Cloudflare Turnstile pour le domaine `kazadie53-coder.github.io`. Il faut sa **clé de site publique** pour intégrer le widget au formulaire.
5. Vérifier un domaine expéditeur dans Resend et renseigner une adresse autorisée dans `SEMAD_NOTIFICATION_FROM`. Les notifications sont destinées à `semad.developpementsarl@gmail.com`.
6. Après déploiement, tester avec un CV fictif : vérifier la réponse HTTP, la ligne dans `semad_applications`, l'objet privé dans `semad-cv`, la lecture admin et l'arrivée du mail.
7. **Seulement après ce test**, remplacer l'envoi FormSubmit du formulaire de recrutement par l'appel à l'Edge Function avec le jeton Turnstile.

## Sécurité
- La clé `service_role` ne doit exister que dans les secrets Supabase, jamais dans le dépôt.
- La lecture des candidatures doit rester limitée aux comptes figurant dans `public.semad_admins`.
- Le CV doit être stocké dans un bucket privé ; les liens de téléchargement doivent être temporaires.
- Avant ouverture publique, prévoir contrôle anti-abus, conservation/suppression des CV et vérification des consentements.

## Vérification du site
Espace administrateur : https://kazadie53-coder.github.io/semad-sarl/admin/

Ce document décrit les prérequis, **pas une preuve que le déploiement est terminé**.

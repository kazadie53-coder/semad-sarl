# Réception directe des candidatures SEMAD SARL

**État : préparé, NON activé en production.** Le formulaire actuel reste sur FormSubmit jusqu'à validation de l'installation.

1. Dans Supabase SQL Editor, exécuter le fichier `supabase/applications.sql` pour créer la table et le stockage privé.
2. Déployer `supabase/functions/submit-application/index.ts` comme Edge Function nommée `submit-application`. Désactiver la vérification JWT de cette fonction publique ; les autorisations sont appliquées côté serveur. Pour la production, ajouter une protection anti-robots et une limitation de débit côté serveur (CAPTCHA vérifié serveur, WAF).
3. Configurer dans les secrets de la fonction : `RESEND_API_KEY`, `RESEND_FROM` (adresse d'un domaine vérifié chez Resend), `NOTIFICATION_EMAIL=semad.developpementsarl@gmail.com`. Les secrets Supabase sont fournis par l'environnement du projet. **Ne jamais copier une clé secrète dans GitHub Pages.**
4. Intégrer le formulaire du site avec la fonction seulement après test du stockage, des droits d'accès, de l'envoi et des notifications.
5. Ajouter un écran de consultation des candidatures dans `admin/index.html` avec accès admin uniquement et téléchargement des CV privés via URLs signées.
6. Vérifier la politique de confidentialité et la durée de conservation des candidatures. Le domaine expéditeur Resend doit être vérifié avant que les notifications puissent fonctionner.

La clé `sb_publishable_...` visible dans `admin/config.json` n'est pas une clé secrète et ne suffit pas à configurer les notifications. Ne jamais publier `service_role` ou `sb_secret`.

# Procédure de vérification — candidatures SEMAD SARL

**État : test réel non exécuté.** Le dépôt GitHub n'a pas accès aux secrets du projet Supabase ni aux comptes Cloudflare/Resend.

## 1. Sécurité
- Supabase Storage : bucket `semad-cv` **privé**, taille maximale 5 Mo et types PDF/DOC/DOCX.
- SQL : table `semad_applications` avec RLS actif, lecture et modification limitées aux membres de `semad_admins`.
- Fonction `semad-receive-application` : JWT legacy désactivé, vérification Turnstile requise et secret conservé côté serveur.
- Vérifier que le formulaire public ne contient aucune clé `service_role`, `sb_secret_...` ou clé Resend.
- Ne jamais utiliser un vrai CV pour un premier test. Utiliser un document fictif sans données personnelles.

## 2. Notifications
- Créer et vérifier un domaine expéditeur dans Resend, puis définir `RESEND_API_KEY` et `SEMAD_NOTIFICATION_FROM` dans Supabase Secrets.
- Vérifier que la notification arrive à `semad.developpementsarl@gmail.com`. Les CV restent dans Supabase ; ne pas les joindre aux e-mails.
- La fonction actuelle enregistre d'abord la candidature puis tente d'envoyer le mail : une notification échouée n'annule pas le dossier.

## 3. Test réel à effectuer après configuration
1. Configurer Turnstile avec le domaine public `kazadie53-coder.github.io` et intégrer sa clé publique au formulaire.
2. Tester l'envoi d'un CV fictif de moins de 5 Mo, avec consentement.
3. Vérifier une réponse HTTP 201 contenant `ok: true` et une référence UUID.
4. Vérifier que la ligne apparaît dans `semad_applications` et que le CV existe dans le bucket privé `semad-cv`.
5. Se connecter à l'espace administrateur et vérifier la liste, le téléchargement du CV et le changement de statut.
6. Vérifier la réception du mail, ou consulter les logs de la fonction si le mail n'arrive pas.
7. Tester un CV trop volumineux, un fichier interdit, un formulaire incomplet et une requête sans Turnstile : tous doivent être rejetés.
8. Vérifier qu'un visiteur anonyme ne peut ni lister les candidatures ni télécharger un CV.
9. Basculer le formulaire public de FormSubmit vers Supabase **seulement après la réussite des tests**.

## 4. Contrôle sans candidat
URL de la fonction : `https://wdiyrtgxsuwgrhetjqyx.supabase.co/functions/v1/semad-receive-application`

Un appel OPTIONS devrait répondre avec les en-têtes CORS ; un POST incomplet doit être rejeté sans créer de candidature. Ces contrôles ne remplacent pas un test de bout en bout.

**Ne publier aucun secret dans GitHub ou dans une capture d'écran.**

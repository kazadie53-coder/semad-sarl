// Avant publication : remplacez la valeur ci-dessous par l'adresse e-mail officielle de SEMAD SARL.
// Exemple après création : const CONTACT_EMAIL = 'contact@semadsarl.com';
const CONTACT_EMAIL = 'semad.developpementsarl@gmail.com';
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? '✕' : '☰';
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.textContent = '☰';
}));
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('quote-form').addEventListener('submit', event => {
  event.preventDefault();
  const status = document.getElementById('form-status');
  if (!CONTACT_EMAIL || !CONTACT_EMAIL.includes('@')) {
    status.textContent = 'Le formulaire est prêt, mais l’adresse de réception doit être configurée dans script.js avant publication. Aucune demande n’a été envoyée.';
    return;
  }
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent('Demande de devis SEMAD SARL — ' + data.get('service'));
  const body = encodeURIComponent('Nom / entreprise : ' + data.get('name') + '\nE-mail : ' + data.get('email') + '\nService : ' + data.get('service') + '\n\nDemande :\n' + data.get('message'));
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  status.textContent = 'Votre application de messagerie devrait s’ouvrir avec votre demande. Vérifiez le message puis envoyez-le.';
});

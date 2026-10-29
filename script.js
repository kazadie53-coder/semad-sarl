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

document.getElementById('quote-form').addEventListener('submit', async event => {
  event.preventDefault();

  const form = event.currentTarget;
  const status = document.getElementById('form-status');
  const button = form.querySelector('button[type="submit"]');

  if (!CONTACT_EMAIL || !CONTACT_EMAIL.includes('@')) {
    status.textContent = 'Erreur : l’adresse e-mail de SEMAD SARL doit être configurée.';
    return;
  }

  const data = new FormData(form);

  const message = {
    name: data.get('name'),
    email: data.get('email'),
    service: data.get('service'),
    message: data.get('message'),
    _subject: 'Demande de devis SEMAD SARL — ' + data.get('service')
  };

  button.disabled = true;
  button.textContent = 'Envoi en cours…';
  status.textContent = 'Transmission de votre demande…';

  try {
    const response = await fetch(
      'https://formsubmit.co/ajax/' + CONTACT_EMAIL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(message)
      }
    );

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error('Échec de l’envoi');
    }

    status.textContent =
      'Merci ! Votre demande a été envoyée à SEMAD SARL.';
    form.reset();
  } catch (error) {
    status.textContent =
      'L’envoi a échoué. Vérifiez votre connexion et réessayez, ou contactez-nous par WhatsApp.';
  } finally {
    button.disabled = false;
    button.textContent = 'Préparer ma demande';
  }
});

});

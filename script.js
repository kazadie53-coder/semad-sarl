// Avant publication : remplacez la valeur ci-dessous par l'adresse e-mail officielle de SEMAD SARL.
// Exemple après création : const CONTACT_EMAIL = 'contact@semadsarl.com';
const CONTACT_EMAIL = 'semad.developpementsarl@gmail.com';
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.navigation');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? '✕' : '☰';
});
// Menus déroulants : un seul groupe ouvert à la fois
const dropdownButtons = [...document.querySelectorAll('.nav-dropdown-toggle')];
function closeDropdowns() {
  dropdownButtons.forEach(button => {
    button.setAttribute('aria-expanded', 'false');
    document.getElementById(button.getAttribute('aria-controls')).hidden = true;
  });
}
dropdownButtons.forEach(button => button.addEventListener('click', () => {
  const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
  closeDropdowns();
  if (shouldOpen) {
    button.setAttribute('aria-expanded', 'true');
    document.getElementById(button.getAttribute('aria-controls')).hidden = false;
  }
}));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  closeDropdowns();
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = '☰';
}));
document.addEventListener('click', event => {
  if (!event.target.closest('.nav-group')) closeDropdowns();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeDropdowns(); nav.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); menuButton.textContent='☰'; menuButton.focus(); }
});
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


// Fenêtres de présentation des services
const serviceDetails = [{"title":"Commerce","intro":"SEMAD SARL intervient dans le domaine du commerce général, de l’approvisionnement et de la distribution de biens, selon les besoins exprimés.","heading1":"Nos domaines d’intervention","body1":"Approvisionnement en produits et fournitures ; commerce général ; recherche de solutions de distribution et de fourniture adaptées aux commandes et aux marchés.","heading2":"Notre approche","body2":"Écouter la demande, préciser les caractéristiques et quantités recherchées, étudier la disponibilité et proposer une offre adaptée."},{"title":"Agriculture & élevage","intro":"Nous développons des projets de production agricole et d’élevage afin de contribuer à l’approvisionnement local et à la création d’opportunités.","heading1":"Projets envisagés","body1":"Culture du maïs et autres activités agricoles selon les ressources disponibles ; aviculture, notamment l’élevage de poules pondeuses et la production d’œufs.","heading2":"Notre approche","body2":"Étudier les besoins en terrain, équipements, intrants, alimentation animale et suivi technique avant le lancement de chaque projet."},{"title":"Services aux entreprises","intro":"SEMAD SARL propose un cadre de collaboration et d’accompagnement adapté aux besoins des entreprises et des organisations.","heading1":"Domaines d’intervention","body1":"Identification des besoins, coordination de prestations et appui opérationnel dans le cadre des activités et capacités autorisées de la société.","heading2":"Notre approche","body2":"Analyser chaque demande, définir le périmètre de la prestation et établir une proposition claire, adaptée aux moyens disponibles."},{"title":"Formation professionnelle","intro":"Nous souhaitons contribuer au développement des compétences par des initiatives de formation pratique et de perfectionnement.","heading1":"Domaines de formation","body1":"Initiation et perfectionnement en informatique ; formation en coupe et couture ; ateliers pratiques selon les besoins identifiés et les ressources disponibles.","heading2":"Notre approche","body2":"Organiser des programmes progressifs, axés sur la pratique et l’acquisition de compétences utiles à l’insertion professionnelle et à l’entrepreneuriat."},{"title":"Sécurité & gardiennage","intro":"SEMAD SARL développe une offre de sécurité privée et de gardiennage adaptée aux besoins des entreprises et des particuliers.","heading1":"Domaines de prestations","body1":"Surveillance et gardiennage de sites industriels, commerces, résidences et entrepôts ; contrôle des accès et organisation de rondes selon les contrats et la réglementation.","heading2":"Notre approche","body2":"Une approche fondée sur la prévention, la vigilance, la discipline et la qualité du service."},{"title":"Télécommunications et infrastructures techniques","intro":"Prestations techniques dédiées aux infrastructures et équipements de télécommunications.","heading1":"Prestations envisagées","body1":"Installation, inspection, entretien et maintenance de sites, pylônes, antennes, shelters, équipements radio, groupes électrogènes et batteries.","heading2":"Notre approche","body2":"Une démarche axée sur la fiabilité des équipements, la prévention des pannes et la continuité des installations."},{"title":"Transport des biens et des personnes","intro":"Solutions de transport routier de voyageurs et de marchandises.","heading1":"Prestations envisagées","body1":"Transport urbain et interurbain, voyages interprovinciaux, colis, bagages, agences, gares routières et billetterie.","heading2":"Notre approche","body2":"Priorité à la sécurité des déplacements, à l’organisation logistique et à la qualité de l’accueil."},{"title":"Carburants et produits pétroliers","intro":"Solutions de distribution de carburants, de lubrifiants et de services associés.","heading1":"Activités envisagées","body1":"Vente et distribution de carburants et lubrifiants, exploitation future de stations-service.","heading2":"Notre approche","body2":"Une orientation vers la qualité des produits, la sécurité des installations et la satisfaction de la clientèle."}];
const serviceDialog = document.getElementById('service-dialog');
let lastServiceTrigger = null;
const serviceDialogTitle = document.getElementById('service-dialog-title');
const serviceDialogContent = document.getElementById('service-dialog-content');
document.querySelectorAll('.service-open').forEach(button => button.addEventListener('click', () => {
  const item = serviceDetails[Number(button.dataset.service)];
  lastServiceTrigger = button;
  if (!item) return;
  serviceDialogTitle.textContent = item.title;
  serviceDialogContent.replaceChildren();
  const section = document.createElement('section');
  section.className = 'service-detail';
  for (const [tag, value] of [['p',item.intro],['h3',item.heading1],['p',item.body1],['h3',item.heading2],['p',item.body2]]) {
    const element = document.createElement(tag);
    element.textContent = value;
    section.appendChild(element);
  }
  serviceDialogContent.appendChild(section);
  serviceDialog.showModal();
}));
document.querySelector('.service-close').addEventListener('click', () => serviceDialog.close());
serviceDialog.addEventListener('close', () => { if (lastServiceTrigger) lastServiceTrigger.focus(); });
serviceDialog.addEventListener('click', event => { if (event.target === serviceDialog) serviceDialog.close(); });
document.getElementById('service-dialog-contact').addEventListener('click', () => {
  const select = document.getElementById('service');
  const current = serviceDetails.find(item => item.title === serviceDialogTitle.textContent);
  if (current) select.value = current.title === 'Agriculture & élevage' ? 'Agriculture et élevage' : current.title === 'Sécurité & gardiennage' ? 'Sécurité et gardiennage' : current.title;
  serviceDialog.close();
});

// Préselection du domaine lors d'une demande d'informations depuis une carte.
document.querySelectorAll('[data-contact-service]').forEach(link => link.addEventListener('click', () => {
  const item = serviceDetails[Number(link.dataset.contactService)];
  const select = document.getElementById('service');
  if (!item || !select) return;
  const label = item.title === 'Agriculture & élevage' ? 'Agriculture et élevage' : item.title === 'Sécurité & gardiennage' ? 'Sécurité et gardiennage' : item.title;
  if ([...select.options].some(option => option.value === label)) select.value = label;
}));
// Affichage indépendant de chaque rubrique (navigation par vues)
const pageViews = ['accueil','apropos','services','valeurs','actualites','carrieres','devis'];
const relationViews = ['emplois','fournisseurs','clients','partenaires'];
const viewSections = pageViews.map(id => document.getElementById(id));
const relationCards = relationViews.map(id => document.getElementById(id));
const relationsHeading = document.querySelector('#carrieres > .section-heading');
const relationsOverview = document.getElementById('relations-overview');
function showView() {
  const requested = decodeURIComponent(location.hash.slice(1));
  const current = [...pageViews,...relationViews].includes(requested) ? requested : 'accueil';
  const isRelation = relationViews.includes(current);
  viewSections.forEach(section => { section.hidden = section.id !== (isRelation ? 'carrieres' : current); });
  relationCards.forEach(card => { card.hidden = !isRelation || card.id !== current; });
  if (relationsOverview) relationsOverview.hidden = current !== 'carrieres';
  if (relationsHeading) relationsHeading.hidden = isRelation;
  document.title = (current === 'accueil' ? 'Bienvenue' : ({
    apropos:'À propos',services:'Nos services',valeurs:'Nos valeurs',actualites:'Actualités',
    devis:'Contact & devis',emplois:'Emplois & recrutement',fournisseurs:'Fournisseurs',
    clients:'Clients',partenaires:'Partenaires',carrieres:'Carrières & relations'
  }[current] || 'SEMAD SARL')) + ' | SEMAD SARL';
  document.querySelectorAll('.nav-dropdown a, .navigation > .nav-cta').forEach(link => { const active=link.getAttribute('href')==='#'+current; if(active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
  document.querySelectorAll('.nav-group').forEach(group=>{const active=!!group.querySelector('a[aria-current="page"]');group.classList.toggle('nav-group-active',active);});
  window.scrollTo({top:0,behavior:'auto'});
}
window.addEventListener('hashchange',showView);
showView();



// Le navigateur soumet directement le formulaire multipart/form-data à FormSubmit.
// Le champ CV est requis et son type est restreint dans index.html.
// La réception du fichier doit être confirmée dans la boîte e-mail.

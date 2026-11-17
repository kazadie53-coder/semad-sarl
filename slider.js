/* Diaporama SEMAD SARL : autonome des autres scripts du site. */
(function () {
  'use strict';
  const slides = [
    ["Bienvenue • SEMAD SARL • Kolwezi","Construire aujourd'hui <span>les opportunités de demain.</span>","Une ambition congolaise fondée sur la confiance, l'excellence et le développement, au service des projets et des communautés.","Découvrir notre société","#apropos"],
    ["Formation professionnelle • Informatique","Développer les compétences <span>numériques de demain.</span>","Notre projet de formation en informatique favorise l'apprentissage pratique et l'employabilité.","Découvrir la formation","#services"],
    ["Formation professionnelle • Coupe et couture","Apprendre un métier, <span>créer des opportunités.</span>","Des ateliers pratiques de coupe et couture sont envisagés pour valoriser les savoir-faire.","Découvrir la formation","#services"],
    ["Agriculture & élevage • Aviculture","Préparer un élevage <span>avicole responsable.</span>","Notre projet d'élevage de poussins femelles et de poules pondeuses se construit progressivement.","Découvrir l'aviculture","#services"],
    ["Agriculture • Culture du maïs","Cultiver la terre, <span>préparer l'avenir.</span>","Des projets de culture du maïs pour contribuer à la production alimentaire locale.","Découvrir nos projets","#services"],
    ["Commerce • Équipements de protection","Des équipements adaptés <span>aux exigences du terrain.</span>","Commerce envisagé d'EPI : casques, gilets, chaussures de sécurité et accessoires.","Découvrir le commerce","#services"]
  ];
  function init() {
    const hero=document.querySelector('.semad-hero');
    const dots=document.getElementById('slide-dots');
    const prev=document.getElementById('slide-prev');
    const next=document.getElementById('slide-next');
    const eyebrow=document.getElementById('slide-eyebrow');
    const title=document.getElementById('slide-title');
    const description=document.getElementById('slide-description');
    const primary=document.getElementById('slide-primary');
    if (![hero,dots,prev,next,eyebrow,title,description,primary].every(Boolean)) return;
    let index=0;
    dots.replaceChildren();
    function show(i) {
      index=(i+slides.length)%slides.length;
      const s=slides[index];
      hero.dataset.slide=String(index);
      eyebrow.textContent=s[0];title.innerHTML=s[1];description.textContent=s[2];
      primary.textContent=s[3];primary.href=s[4];
      [...dots.children].forEach((dot,n)=>{dot.classList.toggle('active',n===index);dot.setAttribute('aria-pressed',String(n===index));});
    }
    slides.forEach((_,n)=>{const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label','Afficher la diapositive '+(n+1));dot.addEventListener('click',()=>show(n));dots.appendChild(dot);});
    prev.addEventListener('click',()=>show(index-1));
    next.addEventListener('click',()=>show(index+1));
    show(0);
    window.setInterval(()=>{if (!document.hidden && (!location.hash || location.hash==='#accueil')) show(index+1);},6000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
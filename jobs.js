(async function(){
const area=document.getElementById('job-openings');if(!area)return;
const today=new Date().toLocaleDateString('en-CA',{timeZone:'Africa/Lubumbashi'});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nl=s=>esc(s).replace(/\n/g,'<br>');
try{
const cfg=await fetch('./admin/config.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Configuration Supabase absente');return r.json()});
const response=await fetch(cfg.url+'/rest/v1/semad_posts?select=title,date,content&title=like.%5BRECRUTEMENT%5D%20*&order=date.desc',{headers:{apikey:cfg.publishableKey},cache:'no-store'});
if(!response.ok)throw Error('Lecture des offres impossible');
const rows=await response.json();
const jobs=rows.map(p=>{try{return JSON.parse(p.content)}catch{return null}}).filter(j=>j&&j.title&&(!j.deadline||j.deadline>=today));
if(!jobs.length){area.innerHTML='<p><strong>Aucune offre d’emploi ouverte pour le moment.</strong> Les offres officielles apparaîtront ici.</p>';return}
area.replaceChildren();
for(const j of jobs){
const article=document.createElement('article');article.className='career-opening';article.style.cssText='border:1px solid #d5dfed;border-radius:12px;padding:18px;margin:16px 0;background:white';
const intro=document.createElement('p');intro.className='eyebrow';intro.textContent='Recrutement SEMAD SARL';
const title=document.createElement('h4');title.textContent=j.title;article.append(intro,title);
const meta=document.createElement('p');meta.textContent=[j.location,j.contract].filter(Boolean).join(' • ');article.append(meta);
for(const [label,value] of [['Missions',j.missions],['Profil et conditions',j.requirements],['Date limite',j.deadline?new Date(j.deadline+'T12:00:00').toLocaleDateString('fr-FR'):''],['Comment postuler',j.apply]]){if(!value)continue;const heading=document.createElement('strong');heading.textContent=label+' :';const p=document.createElement('p');p.style.whiteSpace='pre-line';p.textContent=value;article.append(heading,p)}
const link=document.createElement('a');link.className='button button-gold';link.href='#emplois';link.textContent='Postuler à cette offre';link.addEventListener('click',event=>{event.preventDefault();const form=document.getElementById('career-form');if(!form)return;const subject=form.querySelector('input[name="_subject"]');if(subject)subject.value='Candidature – '+j.title+' — SEMAD SARL';const motivation=form.querySelector('textarea[name="profil"]');if(motivation){motivation.placeholder='Indiquez votre motivation pour le poste : '+j.title;}const heading=document.querySelector('.career-form-heading h4');if(heading)heading.textContent='Postuler : '+j.title;form.scrollIntoView({behavior:'smooth',block:'start'});});article.append(link);area.append(article)
}
}catch(error){console.error('Offres de recrutement indisponibles',error);area.textContent='Impossible de charger les offres pour le moment. Veuillez réessayer plus tard.'}
})();
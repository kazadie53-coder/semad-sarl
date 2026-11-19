(function(){
const area=document.getElementById('job-openings');if(!area)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nl=s=>esc(s).replace(/\n/g,'<br>');
fetch('./jobs.json?ts='+Date.now(),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
const today=new Date().toLocaleDateString('en-CA',{timeZone:'Africa/Lubumbashi'});
const jobs=(Array.isArray(data.jobs)?data.jobs:[]).filter(j=>j.status==='published'&&(!j.deadline||j.deadline>=today)).sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
if(!jobs.length){area.innerHTML='<p><strong>Aucune offre d’emploi ouverte pour le moment.</strong> Les offres officielles apparaîtront ici.</p>';return}
area.innerHTML=jobs.map(j=>'<article class="career-opening" style="border:1px solid #d5dfed;border-radius:12px;padding:18px;margin:16px 0;background:white"><p class="eyebrow">Recrutement SEMAD SARL</p><h4>'+esc(j.title)+'</h4><p><strong>Lieu :</strong> '+esc(j.location)+' | <strong>Contrat :</strong> '+esc(j.contract)+'</p><p><strong>Missions :</strong><br>'+nl(j.missions)+'</p><p><strong>Profil recherché :</strong><br>'+nl(j.requirements)+'</p>'+(j.deadline?'<p><strong>Date limite :</strong> '+esc(j.deadline)+'</p>':'')+'<p><strong>Pour postuler :</strong> utilisez le formulaire ci-dessous et indiquez le titre de cette offre dans votre motivation.</p><a href="#career-form" class="button button-gold">Postuler</a></article>').join('');
}).catch(()=>{area.textContent='Les offres ne peuvent pas être chargées pour le moment. Veuillez réessayer ultérieurement.'});
})();
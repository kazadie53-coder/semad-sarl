/* SEMAD SARL — inscriptions aux alertes. Aucun secret dans le navigateur. */
(async function(){
  const form=document.getElementById('semad-subscribe-form');
  const status=document.getElementById('subscriber-status');
  const pushButton=document.getElementById('subscriber-push');
  const pushStatus=document.getElementById('subscriber-push-status');
  if(!form)return;
  let cfg=null;
  try{
    const response=await fetch('subscriptions-config.json',{cache:'no-store'});
    if(response.ok)cfg=await response.json();
  }catch{}
  const endpoint=cfg?.endpoint;
  const configured=typeof endpoint==='string' && /^https:\/\/[a-z0-9-]+\.supabase\.co\/functions\/v1\/semad-subscribe$/.test(endpoint);
  if(!configured){
    status.textContent="Les inscriptions seront disponibles prochainement.";
    pushStatus.textContent="Les alertes sur téléphone seront disponibles prochainement.";
    form.querySelector('button[type="submit"]').disabled=true;
    pushButton.disabled=true;
    return;
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const button=document.getElementById('subscriber-submit');
    button.disabled=true;status.textContent='Enregistrement de votre demande…';
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:document.getElementById('subscriber-email').value.trim(),preference:document.getElementById('subscriber-topic').value,consent:document.getElementById('subscriber-consent').checked})});
      if(!response.ok){
        const detail=await response.json().catch(()=>({}));
        throw Error(detail.error || detail.message || ('Erreur '+response.status));
      }
      status.textContent='Votre adresse e-mail a été enregistrée.';
      form.reset();
    }catch(error){
      status.textContent='Inscription refusée : '+(error?.message||'erreur inconnue')+'.';
    }
    finally{button.disabled=false}
  });
  pushButton.addEventListener('click',async()=>{
    if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){
      pushStatus.textContent='Ce navigateur ne prend pas en charge les notifications.';return;
    }
    if(!cfg?.vapidPublicKey){pushStatus.textContent='Les notifications push ne sont pas encore activées.';return}
    try{
      const permission=await Notification.requestPermission();
      if(permission!=='granted'){pushStatus.textContent="Autorisation non accordée.";return}
      const registration=await navigator.serviceWorker.register('./semad-sw.js',{scope:'./'});
      const bytes=Uint8Array.from(atob(cfg.vapidPublicKey.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
      const subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes});
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'push',subscription:subscription.toJSON(),topic:document.getElementById('subscriber-topic').value})});
      if(!response.ok)throw Error('Échec de l’enregistrement');
      pushStatus.textContent='Notifications activées sur cet appareil.';
    }catch{pushStatus.textContent='Activation impossible pour le moment. Réessayez plus tard.'}
  });
})();

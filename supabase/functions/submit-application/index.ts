// Supabase Edge Function: submit-application
// Déployer avec JWT verification désactivée pour autoriser les candidats anonymes.
// Secrets requis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
// NOTIFICATION_EMAIL, RESEND_FROM (domaine expéditeur vérifié chez Resend).
import { createClient } from 'npm:@supabase/supabase-js@2';
const allowedOrigin='https://kazadie53-coder.github.io';
const cors={'Access-Control-Allow-Origin':allowedOrigin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'content-type, apikey, authorization'};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.method!=='POST')return reply({error:'Méthode non autorisée'},405);
 if(req.headers.get('origin')!==allowedOrigin)return reply({error:'Origine non autorisée'},403);
 try{
  const f=await req.formData();
  const val=(key:string)=>String(f.get(key)||'').trim();
  if(val('_honey'))return reply({ok:true});
  const name=val('name'),email=val('email'),phone=val('telephone'),city=val('ville'),domain=val('domaine'),motivation=val('profil'),jobTitle=val('job_title');
  const file=f.get('attachment');
  if(!name||!email||!phone||!city||!domain||!motivation||val('consentement')!=='Oui'||!(file instanceof File))return reply({error:'Veuillez compléter tous les champs.'},400);
  if(name.length>120||email.length>160||phone.length>35||city.length>100||domain.length>160||motivation.length>1800||jobTitle.length>180)return reply({error:'Champ trop long.'},400);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return reply({error:'Adresse e-mail invalide.'},400);
  const ext=file.name.split('.').pop()?.toLowerCase();
  const mime:{[key:string]:string}={pdf:'application/pdf',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
  if(!ext||!mime[ext]||file.size===0||file.size>5242880)return reply({error:'CV PDF ou Word requis, 5 Mo maximum.'},400);
  const bytes=new Uint8Array(await file.arrayBuffer());
  const pdf=ext==='pdf'&&new TextDecoder().decode(bytes.slice(0,5))==='%PDF-';
  const doc=ext==='doc'&&[0xD0,0xCF,0x11,0xE0].every((v,i)=>bytes[i]===v);
  const docx=ext==='docx'&&bytes[0]===0x50&&bytes[1]===0x4B;
  if(!(pdf||doc||docx))return reply({error:'Le format du CV est invalide.'},400);
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const id=crypto.randomUUID(),path=id+'.'+ext;
  const uploaded=await db.storage.from('semad-cv').upload(path,bytes,{contentType:mime[ext],upsert:false});
  if(uploaded.error)throw uploaded.error;
  const inserted=await db.from('semad_applications').insert({id,name,email,phone,city,domain,motivation,job_title:jobTitle||null,cv_path:path});
  if(inserted.error){await db.storage.from('semad-cv').remove([path]);throw inserted.error;}
  const key=Deno.env.get('RESEND_API_KEY'),from=Deno.env.get('RESEND_FROM'),to=Deno.env.get('NOTIFICATION_EMAIL');
  let notified=false;
  if(key&&from&&to){
   const mail=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],subject:'Nouvelle candidature SEMAD SARL'+(jobTitle?' – '+jobTitle:''),text:'Nouvelle candidature reçue.\nNom : '+name+'\nPoste : '+(jobTitle||'Spontanée')+'\nDate : '+new Date().toISOString()+'\nConnectez-vous au tableau de bord pour consulter le dossier et le CV.'})});
   notified=mail.ok;
   if(!mail.ok)console.error('Notification e-mail non envoyée',mail.status);
  }
  return reply({ok:true,notified});
 }catch(e){console.error(e);return reply({error:'Envoi indisponible. Réessayez ultérieurement.'},500)}
});

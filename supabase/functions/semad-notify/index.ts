// SEMAD SARL — envoi sur demande de l'administrateur et désabonnement.
// Déploiement : Edge Function semad-notify, verify_jwt désactivé pour permettre
// l'accès public au lien de désabonnement ; l'envoi POST vérifie la session ET le rôle admin.
// Secrets : RESEND_API_KEY, SEMAD_NOTIFICATION_FROM, SEMAD_UNSUBSCRIBE_SECRET
// Supabase : SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"https://kazadie53-coder.github.io","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Content-Type":"application/json"};
const json=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers:cors});
const encode=(bytes:Uint8Array)=>Array.from(bytes).map(b=>b.toString(16).padStart(2,"0")).join("");
const sign=async(email:string,secret:string)=>{
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 return encode(new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(email))));
};
const escapeHtml=(v:string)=>v.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response(null,{headers:cors});
 const url=Deno.env.get("SUPABASE_URL")||"";
 const anon=Deno.env.get("SUPABASE_ANON_KEY")||"";
 const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
 const secret=Deno.env.get("SEMAD_UNSUBSCRIBE_SECRET")||"";
 if(!url||!service||!secret||secret.length<32)return json(503,{error:"Configuration serveur incomplète"});
 const admin=createClient(url,service);
 try{
  if(req.method==="GET"){
   const q=new URL(req.url).searchParams;
   const email=(q.get("email")||"").trim().toLowerCase();
   const token=q.get("token")||"";
   if(!email||!token||token.length!==64||!(/^[0-9a-f]{64}$/i.test(token)))return new Response("Lien invalide",{status:400});
   const expected=await sign(email,secret);
   let mismatch=0;for(let i=0;i<64;i++)mismatch|=expected.charCodeAt(i)^token.toLowerCase().charCodeAt(i);
   if(mismatch)return new Response("Lien invalide",{status:403});
   const {error}=await admin.from("semad_subscribers").update({unsubscribed_at:new Date().toISOString()}).eq("email",email);
   return new Response(error?"Désabonnement indisponible.":"Votre désabonnement SEMAD SARL est enregistré.",{status:error?500:200,headers:{"Content-Type":"text/plain; charset=utf-8"}});
  }
  if(req.method!=="POST")return json(405,{error:"Méthode non autorisée"});
  const resend=Deno.env.get("RESEND_API_KEY")||"";
  const from=Deno.env.get("SEMAD_NOTIFICATION_FROM")||"";
  if(!anon||!resend||!from)return json(503,{error:"Configuration d'envoi incomplète"});
  const authorization=req.headers.get("Authorization")||"";
  if(!authorization.startsWith("Bearer "))return json(401,{error:"Connexion requise"});
  const userClient=createClient(url,anon,{global:{headers:{Authorization:authorization}}});
  const {data:{user},error:authError}=await userClient.auth.getUser();
  if(authError||!user)return json(401,{error:"Session invalide"});
  const {data:role,error:roleError}=await admin.from("semad_admins").select("user_id").eq("user_id",user.id).maybeSingle();
  if(roleError||!role)return json(403,{error:"Accès réservé aux administrateurs"});
  const {postId}=await req.json();
  if(typeof postId!=="string"||!/^[0-9a-f-]{36}$/i.test(postId))return json(400,{error:"Publication invalide"});
  const {data:post,error:postError}=await admin.from("semad_posts").select("id,title,summary").eq("id",postId).maybeSingle();
  if(postError||!post)return json(404,{error:"Publication introuvable"});
  const job=post.title.startsWith("[RECRUTEMENT] ");
  const title=job?post.title.slice(14):post.title;
  const category=job?"jobs":"news";
  // Seulement les adresses confirmées, consentantes et non désabonnées.
  const {data:subscribers,error:subError}=await admin.from("semad_subscribers").select("email").eq("consent",true).is("unsubscribed_at",null).not("confirmed_at","is",null).in("preference",["all",category]).limit(1000);
  if(subError)return json(500,{error:"Impossible de consulter les abonnés"});
  let sent=0,failed=0,skipped=0;
  for(const sub of subscribers||[]){
   const email=String(sub.email||"").trim().toLowerCase();
   if(!email)continue;
   const {error:claimError}=await admin.from("semad_notification_deliveries").insert({post_id:post.id,email});
   if(claimError){skipped++;continue} // unique(post_id,email) : déjà notifié
   const token=await sign(email,secret);
   const unsub=url+"/functions/v1/semad-notify?email="+encodeURIComponent(email)+"&token="+token;
   const link="https://kazadie53-coder.github.io/semad-sarl/"+(job?"recrutement.html":"#actualites");
   const html='<div style="font-family:Arial,sans-serif"><h2>SEMAD SARL</h2><h3>'+escapeHtml(title)+'</h3><p>'+escapeHtml(post.summary||"Nouvelle publication disponible.")+'</p><p><a href="'+link+'">Consulter sur notre site</a></p><p style="font-size:12px">Vous recevez cet e-mail car vous avez confirmé votre abonnement. <a href="'+unsub+'">Se désabonner</a></p></div>';
   try{
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+resend,"Content-Type":"application/json"},body:JSON.stringify({from,to:[email],subject:"SEMAD SARL — "+title,html,headers:{"List-Unsubscribe":"<"+unsub+">"}})});
    if(!response.ok)throw Error("Resend "+response.status);
    sent++;
   }catch(e){
    failed++;console.error("Échec notification:",e instanceof Error?e.message:String(e));
    await admin.from("semad_notification_deliveries").delete().eq("post_id",post.id).eq("email",email);
   }
  }
  return json(200,{sent,failed,skipped,eligible:subscribers?.length||0});
 }catch(e){console.error("semad-notify:",e instanceof Error?e.message:String(e));return json(500,{error:"Notification indisponible"})}
});

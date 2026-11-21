// SEMAD SARL — inscription avec double opt-in et confirmation par e-mail.
// Déployer dans Supabase Edge Functions sous le nom semad-subscribe.
// Désactiver Verify JWT : GET est public ; POST n'utilise que des données validées.
// Secrets : RESEND_API_KEY, SEMAD_NOTIFICATION_FROM.
// Supabase : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const origin="https://kazadie53-coder.github.io";
const cors={"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"content-type, apikey, authorization","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Content-Type":"application/json; charset=utf-8"};
const json=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers:cors});
const hex=(b:Uint8Array)=>Array.from(b).map(x=>x.toString(16).padStart(2,"0")).join("");
const hash=async(s:string)=>hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s))));
const page=(message:string,ok:boolean)=>new Response('<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SEMAD SARL — Confirmation</title><body style="font:16px Arial,sans-serif;max-width:650px;margin:12vh auto;padding:24px"><h1>SEMAD SARL</h1><p>'+message+'</p><p><a href="https://kazadie53-coder.github.io/semad-sarl/">Retour au site SEMAD SARL</a></p></body></html>',{status:ok?200:400,headers:{"Content-Type":"text/html; charset=utf-8"}});
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{headers:cors});
 const url=Deno.env.get("SUPABASE_URL")||"";
 const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
 if(!url||!service)return json(503,{error:"Configuration Supabase manquante"});
 const db=createClient(url,service);
 try{
  if(req.method==="GET"){
   const token=new URL(req.url).searchParams.get("token")||"";
   if(!/^[0-9a-f]{64}$/.test(token))return page("Lien de confirmation invalide.",false);
   const digest=await hash(token);
   const {data:subscriber,error}=await db.from("semad_subscribers").select("id,confirmation_expires_at,confirmed_at").eq("confirmation_token_hash",digest).maybeSingle();
   if(error||!subscriber)return page("Lien invalide ou déjà utilisé. Vous pouvez vous réinscrire pour demander un nouveau lien.",false);
   if(!subscriber.confirmation_expires_at||Date.parse(subscriber.confirmation_expires_at)<Date.now())return page("Ce lien a expiré. Inscrivez-vous à nouveau pour recevoir un nouveau lien.",false);
   const {data:updated,error:updateError}=await db.from("semad_subscribers").update({confirmed_at:new Date().toISOString(),confirmation_token_hash:null,confirmation_expires_at:null,unsubscribed_at:null}).eq("id",subscriber.id).eq("confirmation_token_hash",digest).select("id");
   if(updateError||!updated?.length)return page("Confirmation momentanément indisponible. Veuillez réessayer.",false);
   return page("Votre adresse e-mail est confirmée. Vous recevrez les communications SEMAD SARL correspondant à vos préférences.",true);
  }
  if(req.method!=="POST")return json(405,{error:"Méthode non autorisée"});
  const body=await req.json();
  if(body.website)return json(200,{success:true});
  const email=String(body.email||"").trim().toLowerCase();
  const preference=body.preference;
  if(body.consent!==true||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!["all","jobs","news"].includes(preference))return json(400,{error:"Informations d'inscription invalides"});
  const {data:existing,error:lookupError}=await db.from("semad_subscribers").select("id,confirmed_at,confirmation_expires_at,unsubscribed_at").eq("email",email).maybeSingle();
  if(lookupError)return json(500,{error:"Inscription momentanément indisponible"});
  if(existing?.confirmed_at&&!existing.unsubscribed_at){
   const {error}=await db.from("semad_subscribers").update({preference,consent:true}).eq("id",existing.id);
   return error?json(500,{error:"Mise à jour indisponible"}):json(200,{success:true,message:"Votre abonnement est déjà confirmé."});
  }
  // Évite l'envoi répété de courriels de confirmation durant 10 minutes.
  if(existing?.confirmation_expires_at&&Date.parse(existing.confirmation_expires_at)>Date.now()+14*60*1000)
   return json(200,{success:true,message:"Un e-mail de confirmation a déjà été envoyé. Vérifiez votre boîte de réception."});
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  const token=hex(bytes),digest=await hash(token);
  const expires=new Date(Date.now()+24*60*60*1000).toISOString();
  const payload={email,preference,consent:true,confirmed_at:null,unsubscribed_at:null,confirmation_token_hash:digest,confirmation_expires_at:expires};
  const {error:saveError}=await db.from("semad_subscribers").upsert(payload,{onConflict:"email"});
  if(saveError)return json(500,{error:"Impossible d'enregistrer l'abonnement"});
  const resend=Deno.env.get("RESEND_API_KEY")||"";
  const from=Deno.env.get("SEMAD_NOTIFICATION_FROM")||"";
  if(!resend||!from)return json(503,{error:"Configuration e-mail incomplète"});
  const link=url+"/functions/v1/semad-subscribe?token="+encodeURIComponent(token);
  const html='<div style="font-family:Arial,sans-serif"><h2>SEMAD SARL</h2><p>Merci pour votre inscription aux informations SEMAD SARL.</p><p>Pour confirmer votre adresse e-mail, cliquez sur le lien suivant (valable 24 heures) :</p><p><a href="'+link+'">Confirmer mon abonnement</a></p><p>Si vous n’avez pas demandé cette inscription, ignorez ce message.</p></div>';
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+resend,"Content-Type":"application/json"},body:JSON.stringify({from,to:[email],subject:"SEMAD SARL — Confirmez votre abonnement",html})});
  if(!response.ok){console.error("Resend confirmation:",response.status,await response.text());return json(502,{error:"E-mail de confirmation non envoyé. Veuillez réessayer plus tard."});}
  return json(200,{success:true,message:"Vérifiez votre boîte e-mail pour confirmer votre inscription."});
 }catch(e){console.error("semad-subscribe:",e instanceof Error?e.message:String(e));return json(500,{error:"Service temporairement indisponible"});}
});
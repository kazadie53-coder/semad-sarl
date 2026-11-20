// SEMAD SARL — notification des abonnés après publication.
// Déployer comme Edge Function « semad-notify » avec vérification JWT activée.
// Secrets requis : RESEND_API_KEY, SEMAD_NOTIFICATION_FROM.
// Secrets Supabase intégrés : SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const origin = "https://kazadie53-coder.github.io";
const cors = {"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json"};
const respond=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers:cors});
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response(null,{headers:cors});
 if(req.method!=="POST")return respond(405,{error:"Méthode non autorisée"});
 try{
  const url=Deno.env.get("SUPABASE_URL")||"";
  const anon=Deno.env.get("SUPABASE_ANON_KEY")||"";
  const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
  const resend=Deno.env.get("RESEND_API_KEY")||"";
  const from=Deno.env.get("SEMAD_NOTIFICATION_FROM")||"";
  if(!url||!anon||!service||!resend||!from)return respond(503,{error:"Configuration de notification incomplète"});
  const authorization=req.headers.get("Authorization")||"";
  if(!authorization.startsWith("Bearer "))return respond(401,{error:"Connexion requise"});
  const userClient=createClient(url,anon,{global:{headers:{Authorization:authorization}}});
  const {data:{user},error:authError}=await userClient.auth.getUser();
  if(authError||!user)return respond(401,{error:"Session invalide"});
  const admin=createClient(url,service);
  const {data:role,error:roleError}=await admin.from("semad_admins").select("user_id").eq("user_id",user.id).maybeSingle();
  if(roleError||!role)return respond(403,{error:"Accès réservé aux administrateurs"});
  const {postId}=await req.json();
  if(typeof postId!=="string"||!/^[0-9a-f-]{36}$/i.test(postId))return respond(400,{error:"Publication invalide"});
  const {data:post,error:postError}=await admin.from("semad_posts").select("id,title,summary,content").eq("id",postId).maybeSingle();
  if(postError||!post)return respond(404,{error:"Publication introuvable"});
  const job=post.title.startsWith("[RECRUTEMENT] ");
  const title=job?post.title.replace(/^\[RECRUTEMENT\] /,""):post.title;
  const category=job?"jobs":"news";
  const {data:subscribers,error:subError}=await admin.from("semad_subscribers").select("email").eq("consent",true).is("unsubscribed_at",null).in("preference",["all",category]).not("confirmed_at","is",null);
  if(subError)return respond(500,{error:"Lecture des abonnés impossible"});
  // Ne pas envoyer sans confirmation de consentement et mécanisme de désabonnement.
  // Le système actuel n'émet pas encore de liens de désabonnement uniques.
  return respond(409,{error:"Envoi suspendu : confirmation d'abonnement et désabonnement sécurisé à finaliser",eligible:subscribers?.length||0,title});
 }catch(e){console.error("semad-notify:",e instanceof Error?e.message:String(e));return respond(500,{error:"Notification indisponible"})}
});

// SEMAD SARL — fonction de réception des candidatures.
// À déployer dans Supabase Edge Functions sous le nom semad-receive-application.
// Secrets requis : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TURNSTILE_SECRET_KEY,
// RESEND_API_KEY, SEMAD_NOTIFICATION_FROM.
// Bucket privé requis : semad-cv. Table : public.semad_applications.
// Cette fonction n'est PAS active tant qu'elle n'est pas déployée et configurée.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "https://kazadie53-coder.github.io",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const maxSize = 5 * 1024 * 1024;
const allowed = new Map([
  ["application/pdf", ".pdf"],
  ["application/msword", ".doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
]);
const required = (v: FormDataEntryValue | null) => typeof v === "string" ? v.trim() : "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
  try {
    const form = await req.formData();
    const name = required(form.get("name"));
    const email = required(form.get("email"));
    const phone = required(form.get("phone"));
    const city = required(form.get("city"));
    const domain = required(form.get("domain"));
    const motivation = required(form.get("motivation"));
    const jobTitle = required(form.get("job_title")) || null;
    const consent = required(form.get("consent"));
    const token = required(form.get("turnstile_token"));
    const cv = form.get("cv");
    if (!name || !email || !phone || !city || !domain || !motivation || consent !== "yes")
      return json({ error: "Veuillez remplir tous les champs obligatoires." }, 400);
    if (name.length > 180 || email.length > 254 || phone.length > 40 || city.length > 150 ||
        domain.length > 150 || motivation.length > 6000 || (jobTitle?.length ?? 0) > 200 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return json({ error: "Données invalides." }, 400);
    if (!(cv instanceof File) || !allowed.has(cv.type) || cv.size < 1 || cv.size > maxSize ||
        !cv.name.toLowerCase().endsWith(allowed.get(cv.type)!))
      return json({ error: "CV PDF ou Word requis (5 Mo maximum)." }, 400);

    const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (!turnstileSecret || !token) return json({ error: "Vérification anti-robot indisponible." }, 503);
    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: turnstileSecret, response: token }),
    });
    const verification = await check.json();
    if (!verification.success) return json({ error: "Vérification anti-robot échouée." }, 403);

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) return json({ error: "Service indisponible." }, 503);
    const db = createClient(url, serviceKey, { auth: { persistSession: false } });
    const id = crypto.randomUUID();
    const path = `${id}/cv${allowed.get(cv.type)}`;
    const { error: uploadError } = await db.storage.from("semad-cv").upload(path, cv, {
      contentType: cv.type, upsert: false,
    });
    if (uploadError) {
      console.error("Storage error", uploadError);
      return json({ error: "Impossible d'enregistrer le CV." }, 500);
    }
    const { error: insertError } = await db.from("semad_applications").insert({
      id, name, email, phone, city, domain, motivation, job_title: jobTitle, cv_path: path, status: "reçue",
    });
    if (insertError) {
      await db.storage.from("semad-cv").remove([path]);
      console.error("Database error", insertError);
      return json({ error: "Impossible d'enregistrer la candidature." }, 500);
    }

    // L'envoi de notification ne doit pas faire échouer une candidature déjà enregistrée.
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("SEMAD_NOTIFICATION_FROM");
    if (resendKey && from) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from, to: ["semad.developpementsarl@gmail.com"],
            subject: "Nouvelle candidature SEMAD SARL",
            text: `Une candidature a été enregistrée. Poste : ${jobTitle || "Spontanée"}. Connectez-vous à l'espace administrateur pour consulter les coordonnées et le CV. Référence : ${id}`,
          }),
        });
        if (!response.ok) console.error("Notification email failed", response.status);
      } catch (error) { console.error("Notification error", error); }
    }
    return json({ ok: true, reference: id }, 201);
  } catch (error) {
    console.error("Submission error", error);
    return json({ error: "Une erreur est survenue." }, 500);
  }
});

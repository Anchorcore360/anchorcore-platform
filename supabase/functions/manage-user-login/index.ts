import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};
const response = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: cors });

const validEmail = (email: string) =>
  email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return response(405, { error: "POST required." });

  try {
    const token = request.headers.get("Authorization");
    if (!token?.startsWith("Bearer ")) return response(401, { error: "Not signed in." });

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_ANON_KEY");
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key || !service) return response(500, { error: "Server configuration is unavailable." });

    const caller = createClient(url, key, { global: { headers: { Authorization: token } } });
    const { data: { user }, error: authError } = await caller.auth.getUser();
    if (authError || !user) return response(401, { error: "Invalid session." });

    const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
    const [{ data: actor, error: actorError }, { data: access, error: accessError }] = await Promise.all([
      admin.from("profiles").select("permission_level,account_status,login_enabled").eq("id", user.id).maybeSingle(),
      admin.from("portal_access").select("manage_users").eq("user_id", user.id).maybeSingle()
    ]);
    if (actorError || accessError) return response(500, { error: "Could not validate user administration access." });
    const superUser = actor?.permission_level === "super_user";
    if (!actor || actor.account_status !== "active" || actor.login_enabled === false ||
        !(superUser || access?.manage_users === true)) {
      return response(403, { error: "Manage Users access is required." });
    }

    const body = await request.json();
    const action = String(body.action || "");
    const email = String(body.email || "").trim().toLowerCase();
    if (!validEmail(email)) return response(400, { error: "Enter a valid email address for login." });
    if (!["existing_login", "person_without_login"].includes(action)) {
      return response(400, { error: "Unsupported login email action." });
    }

    // Prevent a login address being reused by another RRTA record.
    const [{ data: duplicateProfile }, { data: duplicatePeople }] = await Promise.all([
      admin.from("profiles").select("id").ilike("email", email).limit(10),
      admin.from("people").select("id,profile_id").or("email.ilike." + email + ",work_email.ilike." + email).limit(10)
    ]);
    if (!Array.isArray(duplicateProfile) || !Array.isArray(duplicatePeople)) {
      return response(500, { error: "Unable to check existing login addresses." });
    }

    if (action === "person_without_login") {
      const personId = String(body.person_id || "");
      const { data: person, error: personError } = await admin.from("people")
        .select("id,profile_id,email").eq("id", personId).maybeSingle();
      if (personError || !person) return response(404, { error: "Person not found." });
      if (person.profile_id) return response(409, { error: "This person already has a linked login. Edit their existing login instead." });
      if (duplicateProfile.length || duplicatePeople.some(p => p.id !== personId)) {
        return response(409, { error: "This email is already associated with another person or login." });
      }
      const { error } = await admin.from("people")
        .update({ email, updated_at: new Date().toISOString() }).eq("id", personId);
      if (error) return response(400, { error: "Could not save the login email: " + error.message });
      return response(200, { success: true, email });
    }

    const targetId = String(body.target_user_id || "");
    const { data: target, error: targetError } = await admin.from("profiles")
      .select("id,email,permission_level").eq("id", targetId).maybeSingle();
    if (targetError || !target) return response(404, { error: "Account profile not found." });
    if (target.permission_level === "super_user" && !superUser) {
      return response(403, { error: "Only a Super User can edit another Super User login." });
    }
    if (duplicateProfile.some(p => p.id !== targetId) ||
        duplicatePeople.some(p => p.profile_id !== targetId)) {
      return response(409, { error: "This email is already associated with another person or login." });
    }

    const { data: authUser, error: lookupError } = await admin.auth.admin.getUserById(targetId);
    if (lookupError || !authUser?.user) return response(404, { error: "No authentication account is linked to this profile." });
    const previous = String(authUser.user.email || "");
    if (previous.toLowerCase() === email) {
      if (target.email !== email) {
        const { error: syncError } = await admin.from("profiles").update({ email, updated_at: new Date().toISOString() }).eq("id", targetId);
        if (syncError) return response(400, { error: "Login exists but profile email could not be synchronised." });
      }
      return response(200, { success: true, email, changed: false });
    }

    // Updating Auth first prevents displaying an address that cannot actually be used to sign in.
    const { error: updateError } = await admin.auth.admin.updateUserById(targetId, { email, email_confirm: true });
    if (updateError) return response(409, { error: "Login email was not changed: " + updateError.message });

    const { error: profileError } = await admin.from("profiles")
      .update({ email, updated_at: new Date().toISOString() }).eq("id", targetId);
    if (profileError) {
      await admin.auth.admin.updateUserById(targetId, { email: previous, email_confirm: true });
      return response(500, { error: "Profile email could not be saved; attempted to restore the original login. Please check the account." });
    }

    const { error: personError } = await admin.from("people")
      .update({ email, updated_at: new Date().toISOString() }).eq("profile_id", targetId);
    if (personError) {
      // The authentication email and profile are already correct. Do not give a false success.
      return response(500, { error: "Login updated, but the linked people record needs attention. New login: " + email });
    }
    return response(200, { success: true, email, changed: true });
  } catch (error) {
    return response(500, { error: error instanceof Error ? error.message : String(error) });
  }
});

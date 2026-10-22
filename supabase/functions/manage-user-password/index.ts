import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json"};
const out=(status:number,body:any)=>new Response(JSON.stringify(body),{status,headers:cors});
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 try{
  const auth=req.headers.get('Authorization'); if(!auth?.startsWith('Bearer '))return out(401,{error:'Not signed in.'});
  const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!anon||!service)return out(500,{error:'Server configuration is incomplete.'});
  const caller=createClient(url,anon,{global:{headers:{Authorization:auth}}});
  const {data:{user}}=await caller.auth.getUser(); if(!user)return out(401,{error:'Session check failed.'});
  const admin=createClient(url,service,{auth:{autoRefreshToken:false,persistSession:false}});
  const [{data:actor},{data:actorPortal}]=await Promise.all([
   admin.from('profiles').select('permission_level,account_status').eq('id',user.id).maybeSingle(),
   admin.from('portal_access').select('manage_users').eq('user_id',user.id).maybeSingle()
  ]);
  const actorIsSuper=String(actor?.permission_level||'').toLowerCase()==='super_user';
  if(!actor||String(actor.account_status||'active').toLowerCase()!=='active'||!(actorIsSuper||actorPortal?.manage_users===true))return out(403,{error:'User administration access is required.'});
  const b=await req.json(),targetId=String(b.target_user_id||''),password=String(b.password||'');
  if(!targetId||password.length<8)return out(400,{error:'User and a password of at least 8 characters are required.'});
  const {data:target}=await admin.from('profiles').select('permission_level').eq('id',targetId).maybeSingle();
  if(!target)return out(404,{error:'User profile not found.'});
  if(String(target.permission_level||'').toLowerCase()==='super_user'&&!actorIsSuper)return out(403,{error:'Only a Super User can reset another Super User password.'});
  const {data:authTarget,error:authError}=await admin.auth.admin.getUserById(targetId);
  if(authError||!authTarget?.user)return out(404,{error:'The user profile has no corresponding authentication account. Password was not changed.'});
  const {error}=await admin.auth.admin.updateUserById(targetId,{password});
  if(error)return out(400,{error:'Password was not changed: '+error.message});
  const {data:changed,error:flagErr}=await admin.from('profiles')
    .update({must_change_password:true,updated_at:new Date().toISOString()})
    .eq('id',targetId).select('id,must_change_password').maybeSingle();
  if(flagErr||!changed?.must_change_password)return out(500,{error:'Password updated in Auth but mandatory password change could not be verified. Contact an administrator before using this login.'});
  return out(200,{success:true,must_change_password:true});
 }catch(e){return out(500,{error:e instanceof Error?e.message:String(e)})}
});
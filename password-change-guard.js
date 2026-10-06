(function(){
  if(window.__rrtaPasswordChangeGuard)return;
  window.__rrtaPasswordChangeGuard=true;
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page==='portal.html'||page==='change-password.html')return;
  let tries=0;
  const timer=setInterval(async()=>{
    tries++;
    if(!window.supabase?.createClient){if(tries>80)clearInterval(timer);return}
    clearInterval(timer);
    try{
      const db=window.__rrtaPasswordGuardDb||(window.__rrtaPasswordGuardDb=window.supabase.createClient('https://qgbpotjqggeodxqcwkgj.supabase.co','sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS'));
      const {data:{user}}=await db.auth.getUser();
      if(!user)return;
      const {data:p}=await db.from('profiles').select('must_change_password').eq('id',user.id).maybeSingle();
      if(p?.must_change_password===true)location.replace('change-password.html');
    }catch(e){console.warn('Password change guard unavailable',e)}
  },100);
})();
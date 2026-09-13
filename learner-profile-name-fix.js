(function(){
  if(window.__rrtaLearnerProfileNameFix)return;window.__rrtaLearnerProfileNameFix=true;
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='learner-portal.html')return;
  async function run(n=0){
    const el=document.getElementById('name');
    if(!el||!window.supabase?.createClient){if(n<30)setTimeout(()=>run(n+1),200);return}
    try{
      const db=window.supabase.createClient('https://qgbpotjqggeodxqcwkgj.supabase.co','sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS');
      const {data:u}=await db.auth.getUser();if(!u?.user)return;
      const {data:p}=await db.from('profiles').select('full_name').eq('id',u.user.id).single();
      if(p?.full_name)el.textContent=p.full_name;
    }catch(e){}
  }
  run();
})();
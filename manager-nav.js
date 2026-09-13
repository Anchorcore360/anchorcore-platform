(function(){
  if(window.__rrtaManagerNavLoaded)return;window.__rrtaManagerNavLoaded=true;
  if(document.body?.dataset.portalNav!=='learner')return;
  const style=document.createElement('style');style.textContent=`
    .manager-nav-block{margin-top:8px;border-top:1px solid rgba(255,255,255,.08);padding-top:8px}.manager-nav-parent{width:100%;border:0;background:transparent;color:#c7ced8;border-radius:9px;padding:10px 12px;font:inherit;font-size:12px;font-weight:750;display:flex;align-items:center;gap:10px;cursor:pointer;text-align:left}.manager-nav-parent:hover,.manager-nav-parent.open{background:rgba(255,255,255,.08);color:#fff}.manager-nav-parent svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8}.manager-nav-parent .chev{margin-left:auto}.manager-nav-sub{display:none;padding:2px 0 3px 28px}.manager-nav-block.open .manager-nav-sub{display:grid;gap:2px}.manager-nav-sub a{color:#aeb7c2;text-decoration:none;border-radius:7px;padding:8px 9px;font-size:10px;font-weight:750}.manager-nav-sub a:hover,.manager-nav-sub a.active{background:rgba(255,255,255,.08);color:#fff}`;document.head.appendChild(style);
  const wait=(n=0)=>{if(!window.supabase?.createClient){if(n<30)setTimeout(()=>wait(n+1),200);return}boot()};
  async function boot(){
    const db=window.supabase.createClient('https://qgbpotjqggeodxqcwkgj.supabase.co','sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS');
    const {data:u}=await db.auth.getUser();if(!u?.user)return;
    const id=u.user.id;
    const {data:reports,error}=await db.from('profiles').select('id').or(`manager_1_id.eq.${id},manager_2_id.eq.${id},manager_3_id.eq.${id}`).limit(1);
    if(error||!reports?.length)return;
    const nav=document.querySelector('.portal-nav');if(!nav||document.querySelector('.manager-nav-block'))return;
    const block=document.createElement('div');block.className='manager-nav-block';
    const page=(location.pathname.split('/').pop()||'').toLowerCase(),hash=location.hash;
    block.innerHTML=`<button class="manager-nav-parent" type="button"><svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 21a6 6 0 0 1 12 0M13 21a5 5 0 0 1 9 0"/></svg><span>Manage My Team</span><span class="chev">›</span></button><div class="manager-nav-sub"><a href="manager-team.html" class="${page==='manager-team.html'&&!hash?'active':''}">Team Overview</a><a href="manager-team.html#requests" class="${page==='manager-team.html'&&hash==='#requests'?'active':''}">Training Requests</a></div>`;
    nav.appendChild(block);
    const btn=block.querySelector('.manager-nav-parent');btn.onclick=()=>{block.classList.toggle('open');btn.classList.toggle('open');btn.querySelector('.chev').textContent=block.classList.contains('open')?'⌄':'›'};
    if(page==='manager-team.html'){block.classList.add('open');btn.classList.add('open');btn.querySelector('.chev').textContent='⌄'}
  }
  wait();
})();
(function(){
  if(window.__rrtaManagerNavLoaded)return;window.__rrtaManagerNavLoaded=true;
  if(document.body?.dataset.portalNav!=='learner')return;
  const style=document.createElement('style');style.textContent=`
    .manager-nav-block{margin-top:8px;border-top:1px solid rgba(255,255,255,.08);padding-top:8px}.manager-nav-parent{width:100%;border:0;background:transparent;color:#c7ced8;border-radius:9px;padding:10px 12px;font:inherit;font-size:12px;font-weight:750;display:flex;align-items:center;gap:10px;cursor:pointer;text-align:left}.manager-nav-parent:hover,.manager-nav-parent.open{background:rgba(255,255,255,.08);color:#fff}.manager-nav-parent svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8}.manager-nav-parent .chev{margin-left:auto}.manager-nav-sub{display:none;padding:2px 0 3px 28px}.manager-nav-block.open .manager-nav-sub{display:grid;gap:2px}.manager-nav-sub a{color:#aeb7c2;text-decoration:none;border-radius:7px;padding:8px 9px;font-size:10px;font-weight:750}.manager-nav-sub a:hover,.manager-nav-sub a.active{background:rgba(255,255,255,.08);color:#fff}
    body[data-portal-nav="learner"] #certificates .cert{position:relative;padding:16px 92px 16px 16px;min-height:150px}
    body[data-portal-nav="learner"] #certificates .cert-top{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:14px!important}
    body[data-portal-nav="learner"] #certificates .cert-top strong{order:-1;display:block!important;font-size:15px!important;line-height:1.2!important;color:#18202a!important;margin:0!important;font-weight:900!important}
    body[data-portal-nav="learner"] #certificates .cert-top .pill{margin:0!important;flex:0 0 auto!important;text-transform:capitalize}
    body[data-portal-nav="learner"] #certificates .cert-actions{position:absolute!important;right:14px!important;bottom:14px!important;margin:0!important;display:flex!important;gap:7px!important}
    body[data-portal-nav="learner"] #certificates .cert-actions .btn{width:34px!important;height:34px!important;padding:0!important;border-radius:9px!important;display:grid!important;place-items:center!important;font-size:0!important;background:#fff!important;color:#20262d!important;border:1px solid #d7dde4!important;box-shadow:0 3px 8px rgba(18,24,33,.05)!important}
    body[data-portal-nav="learner"] #certificates .cert-actions .btn:hover{background:#20262d!important;color:#fff!important;border-color:#20262d!important}
    body[data-portal-nav="learner"] #certificates .cert-actions .btn svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.8}
    body[data-portal-nav="learner"] #certificates.list .cert{padding-right:100px!important}
    body[data-portal-nav="learner"] #certificates.list .cert-actions{right:14px!important;bottom:50%!important;transform:translateY(50%)!important}
  `;document.head.appendChild(style);
  const pageNow=(location.pathname.split('/').pop()||'').toLowerCase();
  const loadCase=()=>{if(!document.querySelector('script[data-training-request-case]')){const c=document.createElement('script');c.src='training-request-case.js?v=20260913-1';c.dataset.trainingRequestCase='1';document.head.appendChild(c)}if(!document.querySelector('script[data-training-request-read-receipts]')){const r=document.createElement('script');r.src='training-request-read-receipts.js?v=20260913-1';r.dataset.trainingRequestReadReceipts='1';document.head.appendChild(r)}};
  if(pageNow==='manager-team.html'){
    if(!document.querySelector('script[data-manager-team-compliance]')){const s=document.createElement('script');s.src='manager-team-compliance.js?v=20260913-1';s.dataset.managerTeamCompliance='1';document.head.appendChild(s)}
    if(!document.querySelector('script[data-manager-team-request-dashboard]')){const r=document.createElement('script');r.src='manager-team-request-dashboard.js?v=20260913-1';r.dataset.managerTeamRequestDashboard='1';document.head.appendChild(r)}
    if(!document.querySelector('script[data-training-request-duplicate-guard]')){const d=document.createElement('script');d.src='training-request-duplicate-guard.js?v=20260913-1';d.dataset.trainingRequestDuplicateGuard='1';document.head.appendChild(d)}
    loadCase();
  }
  if(pageNow==='manager-member.html'){
    if(!document.querySelector('script[data-manager-member-evidence]')){const e=document.createElement('script');e.src='manager-member-evidence.js?v=20260913-3';e.dataset.managerMemberEvidence='1';document.head.appendChild(e)}
    if(!document.querySelector('script[data-accreditation-history]')){const h=document.createElement('script');h.src='accreditation-history.js?v=20260913-1';h.dataset.accreditationHistory='1';document.head.appendChild(h)}
    if(!document.querySelector('script[data-manager-training-request]')){const t=document.createElement('script');t.src='manager-training-request.js?v=20260913-2';t.dataset.managerTrainingRequest='1';document.head.appendChild(t)}
    const polish=()=>document.querySelectorAll('#certificates [data-cert-path]').forEach(b=>{if(b.dataset.eyeReady)return;b.dataset.eyeReady='1';b.setAttribute('aria-label','View certificate');b.setAttribute('title','View certificate');b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>'});
    new MutationObserver(()=>requestAnimationFrame(polish)).observe(document.body,{childList:true,subtree:true});setTimeout(polish,250);setTimeout(polish,900);
  }
  if(pageNow==='learner-portal.html'){
    if(!document.querySelector('script[data-manager-evidence-notifications]')){const n=document.createElement('script');n.src='learner-manager-evidence-notifications.js?v=20260913-1';n.dataset.managerEvidenceNotifications='1';document.head.appendChild(n)}
    if(!document.querySelector('script[data-accreditation-history]')){const h=document.createElement('script');h.src='accreditation-history.js?v=20260913-1';h.dataset.accreditationHistory='1';document.head.appendChild(h)}
    if(!document.querySelector('script[data-learner-profile-name-fix]')){const p=document.createElement('script');p.src='learner-profile-name-fix.js?v=20260913-1';p.dataset.learnerProfileNameFix='1';document.head.appendChild(p)}
    loadCase();
  }
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
    if(page==='manager-team.html'||page==='manager-member.html'){block.classList.add('open');btn.classList.add('open');btn.querySelector('.chev').textContent='⌄'}
  }
  wait();
})();
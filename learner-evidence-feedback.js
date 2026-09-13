(function(){
  if(window.__rrtaLearnerEvidenceFeedbackLoaded)return;
  window.__rrtaLearnerEvidenceFeedbackLoaded=true;
  if(document.body?.dataset.portalNav!=='learner')return;

  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]);
  const norm=(v)=>String(v||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  let rows=[],db=null,markingRead=false;

  function addStyles(){
    if(document.getElementById('rrta-learner-feedback-style'))return;
    const s=document.createElement('style');
    s.id='rrta-learner-feedback-style';
    s.textContent=`
      .learner-action-panel{margin:15px 0;background:linear-gradient(135deg,#fff7f7,#fff);border:1px solid #efc5ca;border-left:5px solid #b20f22;border-radius:14px;padding:17px 18px;box-shadow:0 10px 24px rgba(18,24,33,.05)}
      .learner-action-panel-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:11px}.learner-action-panel h3{margin:4px 0 3px;font-size:18px}.learner-action-panel p{margin:0;color:#687484;font-size:11px;line-height:1.5}.learner-action-count{min-width:32px;height:32px;border-radius:999px;background:#b20f22;color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900}
      .learner-action-list{display:grid;gap:9px}.learner-action-item{border:1px solid #ead9dc;border-radius:10px;padding:12px;background:#fff;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center}.learner-action-item strong{display:block;font-size:12px}.learner-action-note{margin-top:6px!important;color:#8b2633!important;font-weight:700}.learner-action-btn{border:0;background:#b20f22;color:#fff;border-radius:8px;padding:8px 10px;font-size:9px;font-weight:850;cursor:pointer;white-space:nowrap}
      .learner-feedback-note{display:block;margin-top:5px;padding:7px 9px;border-radius:7px;background:#fff1f2;color:#9b1c2f;font-size:9px;font-weight:750;line-height:1.4}
      .learner-evidence-modal{position:fixed;inset:0;z-index:2147483600;background:rgba(16,22,30,.55);display:grid;place-items:center;padding:20px;backdrop-filter:blur(2px)}
      .learner-evidence-modal-card{width:min(540px,96vw);background:#fff;border-radius:16px;box-shadow:0 26px 70px rgba(0,0,0,.28);overflow:hidden}.learner-evidence-modal-head{padding:19px 20px 16px;border-bottom:1px solid #e5e8ec;display:flex;justify-content:space-between;gap:15px}.learner-evidence-modal-head h2{margin:4px 0 0;font-size:20px}.learner-evidence-close{width:34px;height:34px;border:0;border-radius:50%;background:#eef1f4;font-size:19px;cursor:pointer}.learner-evidence-modal-body{padding:19px 20px}.learner-evidence-modal-body p{font-size:11px;color:#657181;line-height:1.55}.learner-evidence-feedback{margin:14px 0;padding:12px 13px;background:#fff3f4;border:1px solid #f1c9ce;border-radius:10px;color:#8f1827;font-size:11px;line-height:1.5}.learner-evidence-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.learner-evidence-modal-actions button{border:0;border-radius:8px;padding:10px 12px;font-size:10px;font-weight:850;cursor:pointer}.learner-evidence-cancel{background:#eef1f4;color:#303a46}.learner-evidence-upload{background:#b20f22;color:#fff}
      .learner-evidence-nav-badge{margin-left:auto;min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#d92d20;color:#fff;font-size:9px;font-weight:900;display:inline-grid;place-items:center;box-shadow:0 0 0 2px #1b222c}
      .learner-read-marker{display:block;margin-top:5px;color:#667085;font-size:8px;font-weight:800}
      @media(max-width:650px){.learner-action-item{grid-template-columns:1fr}.learner-action-btn{width:100%}.learner-evidence-modal-actions{flex-direction:column-reverse}.learner-evidence-modal-actions button{width:100%}}
    `;
    document.head.appendChild(s);
  }

  function goToEvidenceRequests(){
    const link=[...document.querySelectorAll('a')].find(a=>String(a.getAttribute('href')||'').includes('#requests'));
    if(link){link.click();return}
    location.hash='requests';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }

  function submitReplacement(r){
    goToEvidenceRequests();
    setTimeout(()=>{
      const form=document.getElementById('evidenceForm');
      if(!form)return;
      const q=form.elements?.qualification,a=form.elements?.awarding;
      if(q)q.value=r.qualification_name||'';
      if(a&&r.awarding_body)a.value=r.awarding_body;
      form.scrollIntoView({behavior:'smooth',block:'start'});
      const f=form.querySelector('input[name="file"]');
      if(f){f.focus({preventScroll:true});try{f.click()}catch(_){}}
    },180);
  }

  function openActionModal(r){
    document.querySelector('.learner-evidence-modal')?.remove();
    const modal=document.createElement('div');modal.className='learner-evidence-modal';
    modal.innerHTML=`<section class="learner-evidence-modal-card" role="dialog" aria-modal="true" aria-label="Evidence action required"><div class="learner-evidence-modal-head"><div><div class="eyebrow">Evidence Action Required</div><h2>${esc(r.qualification_name||'Qualification')}</h2></div><button type="button" class="learner-evidence-close" aria-label="Close">×</button></div><div class="learner-evidence-modal-body"><p>Your evidence has been returned by the Training Academy. You can upload replacement evidence now, or cancel and come back to it later from <strong>Evidence Requests</strong>.</p><div class="learner-evidence-feedback"><strong>Academy feedback</strong><br>${esc(r.reviewer_note||'Please upload suitable replacement evidence.')}</div><div class="learner-evidence-modal-actions"><button type="button" class="learner-evidence-cancel">Cancel</button><button type="button" class="learner-evidence-upload">Upload New Evidence</button></div></div></section>`;
    document.body.appendChild(modal);
    const close=()=>modal.remove();
    modal.querySelector('.learner-evidence-close').onclick=close;
    modal.querySelector('.learner-evidence-cancel').onclick=close;
    modal.addEventListener('click',e=>{if(e.target===modal)close()});
    modal.querySelector('.learner-evidence-upload').onclick=()=>{close();submitReplacement(r)};
  }

  function latestByQualification(){
    const map=new Map();
    rows.slice().sort((a,b)=>new Date(b.reviewed_at||b.submitted_at||0)-new Date(a.reviewed_at||a.submitted_at||0)).forEach(r=>{const k=norm(r.qualification_name);if(k&&!map.has(k))map.set(k,r)});
    return map;
  }

  function updateEvidenceNavBadge(count){
    const link=[...document.querySelectorAll('a')].find(a=>/Evidence Requests/i.test(a.textContent||''));
    if(!link)return;
    let badge=link.querySelector('.learner-evidence-nav-badge');
    if(!count){badge?.remove();return}
    if(!badge){badge=document.createElement('span');badge.className='learner-evidence-nav-badge';link.appendChild(badge)}
    badge.textContent=count>99?'99+':String(count);badge.title=`${count} unread Academy feedback notification${count===1?'':'s'}`;
  }

  function injectOverview(rejected){
    let host=document.querySelector('.view.active .welcome-grid')?.parentElement || [...document.querySelectorAll('.view')].find(v=>v.querySelector('.welcome-grid'));
    if(!host)return;
    host.querySelector('#learnerEvidenceActionPanel')?.remove();
    if(!rejected.length)return;
    const panel=document.createElement('section');
    panel.id='learnerEvidenceActionPanel';panel.className='learner-action-panel';
    panel.innerHTML=`<div class="learner-action-panel-head"><div><div class="eyebrow">Evidence Action Required</div><h3>${rejected.length===1?'1 submission needs your attention':`${rejected.length} submissions need your attention`}</h3><p>The Training Academy has returned evidence to you. Read the feedback and upload replacement evidence.</p></div><span class="learner-action-count">${rejected.length}</span></div><div class="learner-action-list">${rejected.map(r=>`<div class="learner-action-item"><div><strong>${esc(r.qualification_name||'Qualification')}</strong><p class="learner-action-note">Academy feedback: ${esc(r.reviewer_note||'Please upload suitable replacement evidence.')}</p>${r.learner_read_at?'<span class="learner-read-marker">Feedback read</span>':''}</div><button type="button" class="learner-action-btn" data-replace-evidence="${esc(r.id)}">Upload replacement evidence</button></div>`).join('')}</div>`;
    const welcome=host.querySelector('.welcome-grid');
    if(welcome)welcome.insertAdjacentElement('afterend',panel);else host.prepend(panel);
    panel.querySelectorAll('[data-replace-evidence]').forEach(b=>b.onclick=()=>{const r=rejected.find(x=>String(x.id)===String(b.dataset.replaceEvidence));if(r)openActionModal(r)});
  }

  function cleanReadComplianceRow(c){
    const pill=c[2]?.querySelector('.pill');
    if(pill){pill.textContent='Missing';pill.classList.remove('good','warn');pill.classList.add('bad')}
    c[0]?.querySelectorAll('.learner-feedback-note').forEach(n=>n.remove());
    c[2]?.querySelectorAll('.compliance-upload-btn,[data-replace-inline]').forEach(n=>n.remove());
  }

  function enhanceCompliance(latest){
    const body=document.getElementById('complianceBody');if(!body)return;
    body.querySelectorAll('table tbody tr').forEach(tr=>{
      const c=tr.querySelectorAll('td');if(c.length<3)return;
      const r=latest.get(norm(c[0].textContent));if(!r||r.status!=='rejected')return;
      if(r.learner_read_at){cleanReadComplianceRow(c);return}
      const pill=c[2].querySelector('.pill');if(pill){pill.textContent='Action Required';pill.classList.remove('good','warn');pill.classList.add('bad')}
      c[2].querySelectorAll('.compliance-upload-btn,[data-replace-inline]').forEach(n=>n.remove());
      if(r.reviewer_note&&!c[0].querySelector('.learner-feedback-note')){const n=document.createElement('span');n.className='learner-feedback-note';n.textContent='Academy feedback: '+r.reviewer_note;c[0].appendChild(n)}
    });
    body.querySelectorAll('.compliance-card').forEach(card=>{
      const h=card.querySelector('h3');if(!h)return;const r=latest.get(norm(h.textContent));if(!r||r.status!=='rejected')return;
      const pill=card.querySelector('.pill');
      const actions=card.querySelector('.compliance-card-actions');
      if(r.learner_read_at){
        if(pill){pill.textContent='Missing';pill.classList.remove('good','warn');pill.classList.add('bad')}
        if(actions)actions.innerHTML='';
        return;
      }
      if(pill){pill.textContent='Action Required';pill.classList.remove('good','warn');pill.classList.add('bad')}
      if(actions)actions.innerHTML=`<span class="learner-feedback-note">Academy feedback: ${esc(r.reviewer_note||'Please review the Academy feedback in Evidence Requests.')}</span>`;
    });
  }

  function enhanceRequests(latest){
    const body=document.getElementById('requestBody');if(!body)return;
    body.querySelectorAll('tbody tr').forEach(tr=>{
      const c=tr.querySelectorAll('td');if(c.length<3)return;
      const r=latest.get(norm(c[0].textContent));if(!r||r.status!=='rejected')return;
      const pill=c[2].querySelector('.pill');if(pill){pill.textContent='Rejected · Action Required';pill.classList.remove('good','warn');pill.classList.add('bad')}
      const target=c[c.length-1];
      if(target&&r.reviewer_note&&!target.querySelector('.learner-feedback-note')){const n=document.createElement('span');n.className='learner-feedback-note';n.textContent='Academy feedback: '+r.reviewer_note;target.appendChild(n)}
      if(target&&!target.querySelector('[data-request-replace]')){const b=document.createElement('button');b.type='button';b.className='learner-action-btn';b.dataset.requestReplace=r.id;b.textContent='Upload New Evidence';b.style.marginTop='7px';b.onclick=()=>openActionModal(r);target.appendChild(b)}
    });
  }

  function evidenceRequestsVisible(){
    if(location.hash==='#requests')return true;
    const body=document.getElementById('requestBody');
    return !!body?.closest('.view')?.classList.contains('active');
  }

  async function markFeedbackRead(){
    if(markingRead||!db||!evidenceRequestsVisible())return;
    const latest=latestByQualification();
    const unread=[...latest.values()].filter(r=>r.status==='rejected'&&!r.learner_read_at);
    if(!unread.length)return;
    markingRead=true;
    for(const r of unread){
      const {data,error}=await db.rpc('mark_evidence_feedback_read',{request_id:r.id});
      if(!error){r.learner_read_at=data||new Date().toISOString();const original=rows.find(x=>String(x.id)===String(r.id));if(original)original.learner_read_at=r.learner_read_at}
    }
    markingRead=false;
    apply();
  }

  function apply(){
    const latest=latestByQualification();
    const rejected=[...latest.values()].filter(r=>r.status==='rejected');
    const unread=rejected.filter(r=>!r.learner_read_at);
    updateEvidenceNavBadge(unread.length);
    injectOverview(rejected);enhanceCompliance(latest);enhanceRequests(latest);
  }

  async function boot(attempt=0){
    if(!window.supabase?.createClient){if(attempt<30)return setTimeout(()=>boot(attempt+1),200);return}
    addStyles();
    db=window.supabase.createClient('https://qgbpotjqggeodxqcwkgj.supabase.co','sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS');
    const {data:u}=await db.auth.getUser();if(!u?.user)return;
    const {data,error}=await db.from('evidence_review_requests').select('id,learner_id,qualification_name,awarding_body,status,reviewer_note,submitted_at,reviewed_at,learner_read_at').eq('learner_id',u.user.id).order('submitted_at',{ascending:false});
    if(error)return;
    rows=data||[];apply();
    setTimeout(markFeedbackRead,250);
    const obs=new MutationObserver(()=>requestAnimationFrame(()=>{apply();markFeedbackRead()}));obs.observe(document.body,{subtree:true,childList:true});
    window.addEventListener('hashchange',()=>setTimeout(()=>{apply();markFeedbackRead()},120));
  }
  boot();
})();
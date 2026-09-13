(function(){
  if(window.__rrtaLearnerEvidenceFeedbackLoaded)return;
  window.__rrtaLearnerEvidenceFeedbackLoaded=true;
  if(document.body?.dataset.portalNav!=='learner')return;

  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]);
  const norm=(v)=>String(v||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  let rows=[];

  function addStyles(){
    if(document.getElementById('rrta-learner-feedback-style'))return;
    const s=document.createElement('style');
    s.id='rrta-learner-feedback-style';
    s.textContent=`
      .learner-action-panel{margin:15px 0;background:linear-gradient(135deg,#fff7f7,#fff);border:1px solid #efc5ca;border-left:5px solid #b20f22;border-radius:14px;padding:17px 18px;box-shadow:0 10px 24px rgba(18,24,33,.05)}
      .learner-action-panel-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:11px}.learner-action-panel h3{margin:4px 0 3px;font-size:18px}.learner-action-panel p{margin:0;color:#687484;font-size:11px;line-height:1.5}.learner-action-count{min-width:32px;height:32px;border-radius:999px;background:#b20f22;color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900}
      .learner-action-list{display:grid;gap:9px}.learner-action-item{border:1px solid #ead9dc;border-radius:10px;padding:12px;background:#fff;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center}.learner-action-item strong{display:block;font-size:12px}.learner-action-note{margin-top:6px!important;color:#8b2633!important;font-weight:700}.learner-action-btn{border:0;background:#b20f22;color:#fff;border-radius:8px;padding:8px 10px;font-size:9px;font-weight:850;cursor:pointer;white-space:nowrap}
      .learner-feedback-note{display:block;margin-top:5px;padding:7px 9px;border-radius:7px;background:#fff1f2;color:#9b1c2f;font-size:9px;font-weight:750;line-height:1.4}
      @media(max-width:650px){.learner-action-item{grid-template-columns:1fr}.learner-action-btn{width:100%}}
    `;
    document.head.appendChild(s);
  }

  function submitReplacement(r){
    if(typeof window.show==='function')window.show('requests'); else location.hash='requests';
    setTimeout(()=>{
      const form=document.getElementById('evidenceForm');
      if(!form)return;
      const q=form.elements?.qualification,a=form.elements?.awarding;
      if(q)q.value=r.qualification_name||'';
      if(a&&r.awarding_body)a.value=r.awarding_body;
      form.scrollIntoView({behavior:'smooth',block:'start'});
      const f=form.querySelector('input[name="file"]');if(f)f.focus({preventScroll:true});
    },80);
  }

  function latestByQualification(){
    const map=new Map();
    rows.slice().sort((a,b)=>new Date(b.reviewed_at||b.submitted_at||0)-new Date(a.reviewed_at||a.submitted_at||0)).forEach(r=>{const k=norm(r.qualification_name);if(k&&!map.has(k))map.set(k,r)});
    return map;
  }

  function injectOverview(rejected){
    let host=document.querySelector('.view.active .welcome-grid')?.parentElement || [...document.querySelectorAll('.view')].find(v=>v.querySelector('.welcome-grid'));
    if(!host)return;
    host.querySelector('#learnerEvidenceActionPanel')?.remove();
    if(!rejected.length)return;
    const panel=document.createElement('section');
    panel.id='learnerEvidenceActionPanel';panel.className='learner-action-panel';
    panel.innerHTML=`<div class="learner-action-panel-head"><div><div class="eyebrow">Evidence Action Required</div><h3>${rejected.length===1?'1 submission needs your attention':`${rejected.length} submissions need your attention`}</h3><p>The Training Academy has returned evidence to you. Read the feedback and upload replacement evidence.</p></div><span class="learner-action-count">${rejected.length}</span></div><div class="learner-action-list">${rejected.map(r=>`<div class="learner-action-item"><div><strong>${esc(r.qualification_name||'Qualification')}</strong><p class="learner-action-note">Academy feedback: ${esc(r.reviewer_note||'Please upload suitable replacement evidence.')}</p></div><button type="button" class="learner-action-btn" data-replace-evidence="${esc(r.id)}">Upload replacement evidence</button></div>`).join('')}</div>`;
    const welcome=host.querySelector('.welcome-grid');
    if(welcome)welcome.insertAdjacentElement('afterend',panel);else host.prepend(panel);
    panel.querySelectorAll('[data-replace-evidence]').forEach(b=>b.onclick=()=>{const r=rejected.find(x=>String(x.id)===String(b.dataset.replaceEvidence));if(r)submitReplacement(r)});
  }

  function enhanceCompliance(latest){
    const body=document.getElementById('complianceBody');if(!body)return;
    body.querySelectorAll('table tbody tr').forEach(tr=>{
      const c=tr.querySelectorAll('td');if(c.length<3)return;
      const r=latest.get(norm(c[0].textContent));if(!r||r.status!=='rejected')return;
      const pill=c[2].querySelector('.pill');if(pill){pill.textContent='Action Required';pill.classList.remove('good','warn');pill.classList.add('bad')}
      if(!c[2].querySelector('[data-replace-inline]')){const b=document.createElement('button');b.type='button';b.className='compliance-upload-btn';b.dataset.replaceInline=r.id;b.title='Upload replacement evidence';b.setAttribute('aria-label','Upload replacement evidence');b.innerHTML='↥';b.onclick=()=>submitReplacement(r);c[2].appendChild(b)}
      if(r.reviewer_note&&!c[0].querySelector('.learner-feedback-note')){const n=document.createElement('span');n.className='learner-feedback-note';n.textContent='Academy feedback: '+r.reviewer_note;c[0].appendChild(n)}
    });
    body.querySelectorAll('.compliance-card').forEach(card=>{
      const h=card.querySelector('h3');if(!h)return;const r=latest.get(norm(h.textContent));if(!r||r.status!=='rejected')return;
      const pill=card.querySelector('.pill');if(pill){pill.textContent='Action Required';pill.classList.remove('good','warn');pill.classList.add('bad')}
      let actions=card.querySelector('.compliance-card-actions');if(actions){actions.innerHTML=`<span class="learner-feedback-note">Academy feedback: ${esc(r.reviewer_note||'Please upload replacement evidence.')}</span><button type="button" class="compliance-upload-btn" data-card-replace>Upload replacement evidence</button>`;actions.querySelector('[data-card-replace]').onclick=()=>submitReplacement(r)}
    });
  }

  function enhanceRequests(latest){
    const body=document.getElementById('requestBody');if(!body)return;
    body.querySelectorAll('tbody tr').forEach(tr=>{
      const c=tr.querySelectorAll('td');if(c.length<3)return;
      const r=latest.get(norm(c[0].textContent));if(!r||r.status!=='rejected')return;
      const pill=c[2].querySelector('.pill');if(pill){pill.textContent='Rejected · Action Required';pill.classList.remove('good','warn');pill.classList.add('bad')}
      if(r.reviewer_note){const target=c[c.length-1];if(target&&!target.querySelector('.learner-feedback-note')){const n=document.createElement('span');n.className='learner-feedback-note';n.textContent='Academy feedback: '+r.reviewer_note;target.appendChild(n)}}
    });
  }

  function apply(){
    const latest=latestByQualification();
    const rejected=[...latest.values()].filter(r=>r.status==='rejected');
    injectOverview(rejected);enhanceCompliance(latest);enhanceRequests(latest);
  }

  async function boot(attempt=0){
    if(!window.supabase?.createClient){if(attempt<30)return setTimeout(()=>boot(attempt+1),200);return}
    addStyles();
    const db=window.supabase.createClient('https://qgbpotjqggeodxqcwkgj.supabase.co','sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS');
    const {data:u}=await db.auth.getUser();if(!u?.user)return;
    const {data,error}=await db.from('evidence_review_requests').select('id,learner_id,qualification_name,awarding_body,status,reviewer_note,submitted_at,reviewed_at').eq('learner_id',u.user.id).order('submitted_at',{ascending:false});
    if(error)return;
    rows=data||[];apply();
    const obs=new MutationObserver(()=>requestAnimationFrame(apply));obs.observe(document.body,{subtree:true,childList:true});
    window.addEventListener('hashchange',()=>setTimeout(apply,50));
  }
  boot();
})();
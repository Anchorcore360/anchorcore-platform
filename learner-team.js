(function(){
  const style=document.createElement('style');
  style.textContent=`
    .team-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}.team-card{background:#fff;border:1px solid #d9dee5;border-radius:12px;padding:18px;cursor:pointer}.team-card:hover{border-color:#aeb7c2}.team-card h3{margin:0 0 5px}.team-card p{margin:3px 0;color:#667085;font-size:13px}.team-summary{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.team-chip{font-size:11px;font-weight:800;padding:5px 8px;border-radius:999px;background:#eef1f3;color:#475467}.team-chip.good{background:#e8f6ed;color:#176b37}.team-chip.warn{background:#fff6d8;color:#8a6100}.team-chip.bad{background:#fdebec;color:#b42318}.team-detail{margin-top:16px}.team-req{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:10px;align-items:center;padding:11px 12px;border-bottom:1px solid #e7eaee}.team-req:last-child{border-bottom:0}.team-req small{display:block;color:#667085;margin-top:3px}.team-back{margin-bottom:14px}.team-cert{border:0;background:#252b31;color:#fff;padding:7px 10px;border-radius:7px;font-weight:700;cursor:pointer;font-size:12px}
    .team-overview{display:grid;grid-template-columns:180px repeat(4,minmax(120px,1fr));gap:12px;margin-bottom:18px}.team-score{background:#fff;border:1px solid #d9dee5;border-radius:14px;padding:18px;display:grid;place-items:center;text-align:center}.team-score-ring{--pct:0;position:relative;width:112px;height:112px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#252b31 calc(var(--pct)*1%),#e8ecef 0)}.team-score-ring:after{content:'';position:absolute;inset:10px;background:#fff;border-radius:50%}.team-score-ring strong{position:relative;z-index:1;font-size:27px}.team-score small{display:block;color:#667085;margin-top:9px}.team-stat{background:#fff;border:1px solid #d9dee5;border-radius:12px;padding:17px}.team-stat span{display:block;color:#667085;font-size:12px}.team-stat strong{display:block;font-size:26px;margin-top:5px}.team-stat small{display:block;color:#667085;margin-top:4px}.team-section-title{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:6px 0 12px}.team-section-title h2{margin:0}.team-no-role{border-color:#d9dee5;background:#fafbfc}
    @media(max-width:1050px){.team-overview{grid-template-columns:180px repeat(2,1fr)}}@media(max-width:700px){.team-req{grid-template-columns:1fr}.team-req>*{justify-self:start}.team-overview{grid-template-columns:1fr 1fr}.team-score{grid-column:1/-1}}
  `;
  document.head.appendChild(style);
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const date=d=>d?new Date(d+'T00:00:00').toLocaleDateString('en-GB'):'—';
  let team=[];
  function statusFor(a){if(!a)return{label:'Missing',cls:'bad'};if(a.expiry_date){const t=new Date();t.setHours(0,0,0,0);const e=new Date(a.expiry_date+'T00:00:00');const days=Math.ceil((e-t)/86400000);if(days<0)return{label:'Expired',cls:'bad'};if(days<=30)return{label:'Expiring',cls:'warn'}}return{label:'Valid',cls:'good'}}
  function match(itemName,accName){if(typeof accredMatch==='function')return accredMatch(itemName,accName);const a=String(itemName||'').toUpperCase(),b=String(accName||'').toUpperCase();const code=x=>(x.match(/\b(?:SA\d+[A-Z]?|S\d{3}|O\d+|LA|EFAW|IPAF\s*1B)\b/)||[])[0]?.replace(/\s/g,'');const ca=code(a),cb=code(b);if(ca&&cb)return ca===cb;const na=a.replace(/[^A-Z0-9]/g,''),nb=b.replace(/[^A-Z0-9]/g,'');return na&&nb&&(na.includes(nb)||nb.includes(na))}
  async function init(){
    if(typeof profile==='undefined'||!profile?.id)return setTimeout(init,250);
    const {data,error}=await db.from('profiles').select('id,full_name,email,employee_number,job_title,organisation,manager_1_id,manager_2_id,manager_3_id').or(`manager_1_id.eq.${profile.id},manager_2_id.eq.${profile.id},manager_3_id.eq.${profile.id}`).order('full_name');
    if(error||!data?.length)return;
    team=data;
    addTeamUI();
  }
  function addTeamUI(){
    if(document.getElementById('view-team'))return;
    const nav=document.querySelector('.sidebar .nav');if(!nav)return;
    const btn=document.createElement('button');btn.className='nav-btn';btn.dataset.view='team';btn.innerHTML='<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>My Team</span>';
    btn.onclick=()=>{if(typeof showView==='function')showView('team');renderTeamList()};nav.appendChild(btn);
    const content=document.querySelector('.content');const view=document.createElement('div');view.id='view-team';view.className='view';view.innerHTML='<div class="page-head"><div><div class="eyebrow">Manager View</div><h1>My Team</h1><p class="muted">View your team’s compliance, training status and certificate evidence.</p></div></div><div id="teamContent"><div class="empty">Loading Your Team…</div></div>';content.appendChild(view);renderTeamList();
  }
  async function complianceSummary(person){
    const [{data:roles},{data:accs}]=await Promise.all([
      db.from('profile_job_roles').select('job_role_id,job_roles(name)').eq('profile_id',person.id),
      db.from('accreditations').select('accreditation_name,expiry_date').eq('learner_id',person.id)
    ]);
    const roleIds=(roles||[]).map(r=>r.job_role_id);if(!roleIds.length)return{current:0,total:0,missing:0,expiring:0,hasRole:false,roles:[]};
    const {data:reqs}=await db.from('job_role_requirements').select('job_role_id,compliance_items(name)').in('job_role_id',roleIds);
    let current=0,missing=0,expiring=0;for(const r of reqs||[]){const a=(accs||[]).find(x=>match(r.compliance_items?.name,x.accreditation_name)),st=statusFor(a);if(st.label==='Valid')current++;else if(st.label==='Expiring'){current++;expiring++}else missing++}
    return{current,total:(reqs||[]).length,missing,expiring,hasRole:true,roles:(roles||[]).map(r=>r.job_roles?.name).filter(Boolean)};
  }
  async function renderTeamList(){
    const box=document.getElementById('teamContent');if(!box)return;box.innerHTML='<div class="empty">Loading Your Team…</div>';
    const rows=[];for(const p of team){rows.push({person:p,summary:await complianceSummary(p)})}
    const scored=rows.filter(x=>x.summary.total>0),totalReq=scored.reduce((n,x)=>n+x.summary.total,0),totalCurrent=scored.reduce((n,x)=>n+x.summary.current,0),totalMissing=scored.reduce((n,x)=>n+x.summary.missing,0),totalExpiring=scored.reduce((n,x)=>n+x.summary.expiring,0),noRole=rows.filter(x=>!x.summary.hasRole).length;
    const overallPct=totalReq?Math.round(totalCurrent/totalReq*100):0;
    const fullyCompliant=scored.filter(x=>x.summary.current===x.summary.total).length;
    const cards=rows.map(({person:p,summary:s})=>{const pct=s.total?Math.round((s.current/s.total)*100):0;return `<article class="team-card ${!s.hasRole?'team-no-role':''}" data-team-id="${p.id}"><h3>${safe(p.full_name||'Team Member')}</h3><p>${safe(p.job_title||'—')} · ${safe(p.organisation||'—')}</p><p>${safe(p.employee_number||'No Employee Number')}</p><div class="team-summary">${s.hasRole?`<span class="team-chip ${pct>=90?'good':pct>=70?'warn':'bad'}">${pct}% Compliant</span><span class="team-chip">${s.current}/${s.total} Current</span>${s.missing?`<span class="team-chip bad">${s.missing} Missing</span>`:''}${s.expiring?`<span class="team-chip warn">${s.expiring} Expiring</span>`:''}`:`<span class="team-chip">No Job Role Assigned</span>`}</div></article>`}).join('');
    box.innerHTML=`<section class="team-overview"><div class="team-score"><div class="team-score-ring" style="--pct:${overallPct}"><strong>${totalReq?overallPct+'%':'—'}</strong></div><small><strong>${safe(profile?.full_name||'Manager')} Team Compliance</strong><br>${totalReq?'Based on all assigned role requirements':'Waiting for job roles to be assigned'}</small></div><div class="team-stat"><span>Team Members</span><strong>${team.length}</strong><small>${noRole?`${noRole} without a job role`:'All have a job role'}</small></div><div class="team-stat"><span>Fully Compliant</span><strong>${fullyCompliant}</strong><small>100% of requirements current</small></div><div class="team-stat"><span>Missing Requirements</span><strong>${totalMissing}</strong><small>Across the scored team</small></div><div class="team-stat"><span>Expiring Soon</span><strong>${totalExpiring}</strong><small>Within 30 days</small></div></section><div class="team-section-title"><div><h2>Team Compliance Summary</h2><p class="muted" style="margin:4px 0 0">Select a team member to view their full compliance record and certificates.</p></div></div><div class="team-grid">${cards}</div>`;
    box.querySelectorAll('[data-team-id]').forEach(el=>el.onclick=()=>renderPerson(el.dataset.teamId));
  }
  async function renderPerson(id){
    const person=team.find(x=>x.id===id),box=document.getElementById('teamContent');if(!person||!box)return;box.innerHTML='<div class="empty">Loading Team Member…</div>';
    const [{data:roles},{data:accs},{data:training}]=await Promise.all([
      db.from('profile_job_roles').select('job_role_id,is_primary,job_roles(name)').eq('profile_id',id),
      db.from('accreditations').select('id,accreditation_name,awarding_body,certificate_number,issue_date,expiry_date,certificate_url,status').eq('learner_id',id).order('accreditation_name'),
      db.from('training_records').select('course_title,start_date,end_date,completion_status,location').eq('learner_id',id).order('start_date',{ascending:false}).limit(12)
    ]);
    const roleIds=(roles||[]).map(r=>r.job_role_id);let reqs=[];if(roleIds.length){const {data}=await db.from('job_role_requirements').select('job_role_id,status,compliance_items(name,category)').in('job_role_id',roleIds);reqs=data||[]}
    let current=0,missing=0,expiring=0;const rows=reqs.map(r=>{const a=(accs||[]).find(x=>match(r.compliance_items?.name,x.accreditation_name)),st=statusFor(a);if(st.label==='Valid')current++;else if(st.label==='Expiring'){current++;expiring++}else missing++;return `<div class="team-req"><div><strong>${safe(r.compliance_items?.name||'Requirement')}</strong><small>${safe(r.compliance_items?.category||'')} ${a?.expiry_date?'· Expires '+date(a.expiry_date):''}</small></div><span class="team-chip ${st.cls}">${st.label}</span>${a?.certificate_url?`<button class="team-cert" data-cert="${safe(a.certificate_url)}">View Certificate</button>`:'<span></span>'}</div>`}).join('');
    const pct=reqs.length?Math.round(current/reqs.length*100):0;
    const trainingHtml=(training||[]).length?`<div class="team-detail panel"><h2>Recent / Booked Training</h2>${training.map(t=>`<div class="team-req"><div><strong>${safe(t.course_title||'Course')}</strong><small>${date(t.start_date)}${t.end_date&&t.end_date!==t.start_date?' – '+date(t.end_date):''} · ${safe(t.location||'—')}</small></div><span class="team-chip">${safe(String(t.completion_status||'').replaceAll('_',' '))}</span><span></span></div>`).join('')}</div>`:'';
    box.innerHTML=`<button class="btn secondary team-back">← Back To My Team</button><section class="panel"><div class="eyebrow">Team Member</div><h1 style="margin:5px 0">${safe(person.full_name)}</h1><p class="muted">${safe(person.job_title||'—')} · ${safe(person.organisation||'—')} · ${safe(person.employee_number||'No Employee Number')}</p><p><strong>Job Roles:</strong> ${(roles||[]).map(r=>safe(r.job_roles?.name||'')).filter(Boolean).join(', ')||'None Assigned'}</p><div class="team-summary">${reqs.length?`<span class="team-chip ${pct>=90?'good':pct>=70?'warn':'bad'}">${pct}% Compliant</span><span class="team-chip">${current}/${reqs.length} Current</span>${missing?`<span class="team-chip bad">${missing} Missing</span>`:''}${expiring?`<span class="team-chip warn">${expiring} Expiring</span>`:''}`:'<span class="team-chip">No Job Role Assigned</span>'}</div></section><div class="team-detail panel"><h2>Compliance</h2>${rows||'<div class="empty">No Compliance Requirements Assigned.</div>'}</div>${trainingHtml}`;
    box.querySelector('.team-back').onclick=renderTeamList;box.querySelectorAll('[data-cert]').forEach(b=>b.onclick=()=>openCertificate(b.dataset.cert));
  }
  async function openCertificate(path){
    if(!path)return;let url=path;if(!/^https?:/i.test(path)){const {data,error}=await db.storage.from('learner-documents').createSignedUrl(path,300);if(error||!data?.signedUrl){alert('Unable to open this certificate.');return}url=data.signedUrl}window.open(url,'_blank','noopener');
  }
  window.addEventListener('load',()=>setTimeout(init,350));setTimeout(init,900);
})();
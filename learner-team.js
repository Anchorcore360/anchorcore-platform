(function(){
  const style=document.createElement('style');
  style.textContent=`
    .team-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}.team-card{background:#fff;border:1px solid #d9dee5;border-radius:12px;padding:18px;cursor:pointer}.team-card:hover{border-color:#aeb7c2}.team-card h3{margin:0 0 5px}.team-card p{margin:3px 0;color:#667085;font-size:13px}.team-summary{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.team-chip{font-size:11px;font-weight:800;padding:5px 8px;border-radius:999px;background:#eef1f3;color:#475467}.team-chip.good{background:#e8f6ed;color:#176b37}.team-chip.warn{background:#fff6d8;color:#8a6100}.team-chip.bad{background:#fdebec;color:#b42318}.team-detail{margin-top:16px}.team-req{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:10px;align-items:center;padding:11px 12px;border-bottom:1px solid #e7eaee}.team-req:last-child{border-bottom:0}.team-req small{display:block;color:#667085;margin-top:3px}.team-back{margin-bottom:14px}.team-cert{border:0;background:#252b31;color:#fff;padding:7px 10px;border-radius:7px;font-weight:700;cursor:pointer;font-size:12px}@media(max-width:700px){.team-req{grid-template-columns:1fr}.team-req>*{justify-self:start}}
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
    const roleIds=(roles||[]).map(r=>r.job_role_id);if(!roleIds.length)return{current:0,total:0,missing:0,expiring:0};
    const {data:reqs}=await db.from('job_role_requirements').select('job_role_id,compliance_items(name)').in('job_role_id',roleIds);
    let current=0,missing=0,expiring=0;for(const r of reqs||[]){const a=(accs||[]).find(x=>match(r.compliance_items?.name,x.accreditation_name)),st=statusFor(a);if(st.label==='Valid')current++;else if(st.label==='Expiring'){current++;expiring++}else missing++}
    return{current,total:(reqs||[]).length,missing,expiring};
  }
  async function renderTeamList(){
    const box=document.getElementById('teamContent');if(!box)return;box.innerHTML='<div class="empty">Loading Your Team…</div>';
    const cards=[];for(const p of team){const s=await complianceSummary(p);const pct=s.total?Math.round((s.current/s.total)*100):0;cards.push(`<article class="team-card" data-team-id="${p.id}"><h3>${safe(p.full_name||'Team Member')}</h3><p>${safe(p.job_title||'—')} · ${safe(p.organisation||'—')}</p><p>${safe(p.employee_number||'No Employee Number')}</p><div class="team-summary"><span class="team-chip ${pct>=90?'good':pct>=70?'warn':'bad'}">${pct}% Compliant</span><span class="team-chip">${s.current}/${s.total} Current</span>${s.missing?`<span class="team-chip bad">${s.missing} Missing</span>`:''}${s.expiring?`<span class="team-chip warn">${s.expiring} Expiring</span>`:''}</div></article>`)}
    box.innerHTML=`<div class="team-grid">${cards.join('')}</div>`;box.querySelectorAll('[data-team-id]').forEach(el=>el.onclick=()=>renderPerson(el.dataset.teamId));
  }
  async function renderPerson(id){
    const person=team.find(x=>x.id===id),box=document.getElementById('teamContent');if(!person||!box)return;box.innerHTML='<div class="empty">Loading Team Member…</div>';
    const [{data:roles},{data:accs},{data:training}]=await Promise.all([
      db.from('profile_job_roles').select('job_role_id,is_primary,job_roles(name)').eq('profile_id',id),
      db.from('accreditations').select('id,accreditation_name,awarding_body,certificate_number,issue_date,expiry_date,certificate_url,status').eq('learner_id',id).order('accreditation_name'),
      db.from('training_records').select('course_title,start_date,end_date,completion_status,location').eq('learner_id',id).order('start_date',{ascending:false}).limit(12)
    ]);
    const roleIds=(roles||[]).map(r=>r.job_role_id);let reqs=[];if(roleIds.length){const {data}=await db.from('job_role_requirements').select('job_role_id,status,compliance_items(name,category)').in('job_role_id',roleIds);reqs=data||[]}
    const rows=reqs.map(r=>{const a=(accs||[]).find(x=>match(r.compliance_items?.name,x.accreditation_name)),st=statusFor(a);return `<div class="team-req"><div><strong>${safe(r.compliance_items?.name||'Requirement')}</strong><small>${safe(r.compliance_items?.category||'')} ${a?.expiry_date?'· Expires '+date(a.expiry_date):''}</small></div><span class="team-chip ${st.cls}">${st.label}</span>${a?.certificate_url?`<button class="team-cert" data-cert="${safe(a.certificate_url)}">View Certificate</button>`:'<span></span>'}</div>`}).join('');
    const trainingHtml=(training||[]).length?`<div class="team-detail panel"><h2>Recent / Booked Training</h2>${training.map(t=>`<div class="team-req"><div><strong>${safe(t.course_title||'Course')}</strong><small>${date(t.start_date)}${t.end_date&&t.end_date!==t.start_date?' – '+date(t.end_date):''} · ${safe(t.location||'—')}</small></div><span class="team-chip">${safe(String(t.completion_status||'').replaceAll('_',' '))}</span><span></span></div>`).join('')}</div>`:'';
    box.innerHTML=`<button class="btn secondary team-back">← Back To My Team</button><section class="panel"><div class="eyebrow">Team Member</div><h1 style="margin:5px 0">${safe(person.full_name)}</h1><p class="muted">${safe(person.job_title||'—')} · ${safe(person.organisation||'—')} · ${safe(person.employee_number||'No Employee Number')}</p><p><strong>Job Roles:</strong> ${(roles||[]).map(r=>safe(r.job_roles?.name||'')).filter(Boolean).join(', ')||'None Assigned'}</p></section><div class="team-detail panel"><h2>Compliance</h2>${rows||'<div class="empty">No Compliance Requirements Assigned.</div>'}</div>${trainingHtml}`;
    box.querySelector('.team-back').onclick=renderTeamList;box.querySelectorAll('[data-cert]').forEach(b=>b.onclick=()=>openCertificate(b.dataset.cert));
  }
  async function openCertificate(path){
    if(!path)return;let url=path;if(!/^https?:/i.test(path)){const {data,error}=await db.storage.from('learner-documents').createSignedUrl(path,300);if(error||!data?.signedUrl){alert('Unable to open this certificate.');return}url=data.signedUrl}window.open(url,'_blank','noopener');
  }
  window.addEventListener('load',()=>setTimeout(init,350));setTimeout(init,900);
})();
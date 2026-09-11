let managerDirectory=[];
const originalLoadData=loadData;
loadData=async function(){
  await originalLoadData();
  const {data,error}=await db.from('profiles').select('id,full_name,forename,surname,employee_number,job_title,role,account_status').order('full_name');
  if(error)throw error;
  managerDirectory=(data||[]).filter(p=>p.id!==learnerId);
};

function managerDisplayName(id){
  if(!id)return 'Not assigned';
  const p=managerDirectory.find(x=>x.id===id);
  return p?.full_name||[p?.forename,p?.surname].filter(Boolean).join(' ')||'Unknown employee';
}
function managerMeta(id){
  if(!id)return '';
  const p=managerDirectory.find(x=>x.id===id);
  if(!p)return '';
  return [p.job_title,p.employee_number?`Employee ${p.employee_number}`:''].filter(Boolean).join(' · ');
}
function formatDob(value){
  if(!value)return '—';
  const [y,m,d]=String(value).split('-');
  return y&&m&&d?`${d}/${m}/${y}`:value;
}
function ensureManagerPanel(){
  let panel=document.getElementById('managerPanel');
  if(panel)return panel;
  const overview=document.getElementById('tab-overview');
  const stats=overview?.querySelector('.profile-grid');
  if(!overview||!stats)return null;
  panel=document.createElement('section');
  panel.id='managerPanel';
  panel.className='manager-panel';
  panel.innerHTML='<div class="manager-panel-head"><div><h2>Management & reporting</h2><p>A learner can sit under up to three managers.</p></div><button class="btn secondary small" id="editManagersBtn" type="button">Edit managers</button></div><div class="manager-grid" id="managerGrid"></div>';
  stats.insertAdjacentElement('afterend',panel);
  panel.querySelector('#editManagersBtn').onclick=openProfileModal;
  return panel;
}
function renderManagers(){
  const panel=ensureManagerPanel();
  if(!panel)return;
  const grid=panel.querySelector('#managerGrid');
  const items=[['Primary manager',learner.manager_1_id],['Second manager',learner.manager_2_id],['Third manager',learner.manager_3_id]];
  grid.innerHTML=items.map(([label,id])=>`<div class="manager-card"><span>${esc(label)}</span><strong class="${id?'':'manager-none'}">${esc(managerDisplayName(id))}</strong>${id&&managerMeta(id)?`<small>${esc(managerMeta(id))}</small>`:''}</div>`).join('');
}
function renderDateOfBirth(){
  const grid=document.getElementById('detailsGrid');
  if(!grid)return;
  let card=document.getElementById('dateOfBirthDetail');
  if(!card){
    card=document.createElement('div');
    card.className='detail';
    card.id='dateOfBirthDetail';
    const employeeCard=[...grid.querySelectorAll('.detail')].find(x=>(x.querySelector('span')?.textContent||'').trim().toLowerCase()==='employee number');
    if(employeeCard)employeeCard.insertAdjacentElement('afterend',card);else grid.appendChild(card);
  }
  card.innerHTML=`<span>Date of birth</span><strong>${esc(formatDob(learner.date_of_birth))}</strong>`;
}
function markCompactDetails(){
  document.querySelectorAll('#detailsGrid .detail').forEach(card=>{
    const label=(card.querySelector('span')?.textContent||'').trim().toLowerCase();
    card.classList.toggle('email-detail',label==='email');
    card.classList.toggle('id-detail',label==='learner id');
  });
}
const originalRender=render;
render=async function(){
  await originalRender();
  renderDateOfBirth();
  markCompactDetails();
  renderManagers();
};

function managerOptions(selected){
  const sorted=[...managerDirectory].sort((a,b)=>{
    const an=(a.surname||a.full_name||'').toLowerCase();
    const bn=(b.surname||b.full_name||'').toLowerCase();
    return an.localeCompare(bn)||String(a.forename||a.full_name||'').localeCompare(String(b.forename||b.full_name||''));
  });
  return '<option value="">Not assigned</option>'+sorted.map(p=>{
    const name=p.full_name||[p.forename,p.surname].filter(Boolean).join(' ')||'Unnamed employee';
    const meta=[p.employee_number,p.job_title].filter(Boolean).join(' · ');
    return `<option value="${p.id}" ${selected===p.id?'selected':''}>${esc(name)}${meta?` — ${esc(meta)}`:''}</option>`;
  }).join('');
}

openProfileModal=function(){
  modal('Edit learner profile',`<div class="form-grid">
    <label>Forename<input name="forename" required value="${esc(learner.forename||'')}"></label>
    <label>Surname<input name="surname" required value="${esc(learner.surname||'')}"></label>
    <label>Date of birth<input name="date_of_birth" type="date" value="${esc(learner.date_of_birth||'')}"></label>
    <label>Email<input name="email" type="email" value="${esc(learner.email||'')}"></label>
    <label>Employee number<input name="employee_number" value="${esc(learner.employee_number||'')}"></label>
    <label>Job title<input name="job_title" value="${esc(learner.job_title||'')}"></label>
    <label>Organisation<input name="organisation" value="${esc(learner.organisation||'')}"></label>
    <label>Account status<select name="account_status"><option value="active" ${learner.account_status==='active'?'selected':''}>Active</option><option value="archived" ${learner.account_status==='archived'?'selected':''}>Archived</option></select></label>
    <div class="manager-fields-title">Management & reporting</div>
    <div class="manager-select-note">Select up to three different managers. The learner will appear in each selected manager's team.</div>
    <label>Primary manager<select name="manager_1_id">${managerOptions(learner.manager_1_id)}</select></label>
    <label>Second manager<select name="manager_2_id">${managerOptions(learner.manager_2_id)}</select></label>
    <label>Third manager<select name="manager_3_id">${managerOptions(learner.manager_3_id)}</select></label>
  </div>`,async f=>{
    const forename=f.get('forename').trim(),surname=f.get('surname').trim();
    const managers=[f.get('manager_1_id')||null,f.get('manager_2_id')||null,f.get('manager_3_id')||null];
    const chosen=managers.filter(Boolean);
    if(new Set(chosen).size!==chosen.length)throw new Error('Please choose a different person for each manager position.');
    const {error}=await db.from('profiles').update({
      forename,surname,full_name:`${forename} ${surname}`.trim(),
      date_of_birth:f.get('date_of_birth')||null,
      email:f.get('email').trim().toLowerCase()||null,
      employee_number:f.get('employee_number').trim()||null,
      job_title:f.get('job_title').trim()||null,
      organisation:f.get('organisation').trim()||null,
      account_status:f.get('account_status'),
      manager_1_id:managers[0],manager_2_id:managers[1],manager_3_id:managers[2],
      updated_at:new Date().toISOString()
    }).eq('id',learnerId);
    if(error)throw error;
  });
};

const rewireProfileEditors=()=>{
  const top=document.getElementById('editProfileBtn');
  const details=document.getElementById('editProfileBtn2');
  if(top)top.onclick=openProfileModal;
  if(details)details.onclick=openProfileModal;
};
rewireProfileEditors();

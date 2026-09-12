let managerDirectory=[];
let jobRoleDirectory=[];
let learnerJobRoles=[];
const originalLoadData=loadData;
loadData=async function(){
  await originalLoadData();
  const [peopleRes,rolesRes,linksRes]=await Promise.all([
    db.from('profiles').select('id,full_name,forename,surname,employee_number,job_title,role,account_status').order('full_name'),
    db.from('job_roles').select('id,division,name,active').eq('active',true).order('division').order('name'),
    db.from('profile_job_roles').select('profile_id,job_role_id,is_primary').eq('profile_id',learnerId)
  ]);
  if(peopleRes.error)throw peopleRes.error;
  if(rolesRes.error)throw rolesRes.error;
  if(linksRes.error)throw linksRes.error;
  managerDirectory=(peopleRes.data||[]).filter(p=>p.id!==learnerId);
  jobRoleDirectory=rolesRes.data||[];
  learnerJobRoles=linksRes.data||[];
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
function selectedPrimaryRole(){
  return learnerJobRoles.find(x=>x.is_primary)?.job_role_id||null;
}
function selectedSecondaryRole(){
  return learnerJobRoles.find(x=>!x.is_primary)?.job_role_id||null;
}
function jobRoleById(id){return jobRoleDirectory.find(r=>String(r.id)===String(id));}
function ensureJobRolePanel(){
  let panel=document.getElementById('jobRolePanel');
  if(panel)return panel;
  const managerPanel=ensureManagerPanel();
  const overview=document.getElementById('tab-overview');
  if(!overview)return null;
  panel=document.createElement('section');
  panel.id='jobRolePanel';
  panel.className='manager-panel';
  panel.innerHTML='<div class="manager-panel-head"><div><h2>Compliance job roles</h2><p>These roles stay with the operative and drive their compliance requirements.</p></div><button class="btn secondary small" id="editJobRolesBtn" type="button">Edit job roles</button></div><div class="manager-grid" id="jobRoleGrid"></div>';
  if(managerPanel)managerPanel.insertAdjacentElement('afterend',panel);else overview.appendChild(panel);
  panel.querySelector('#editJobRolesBtn').onclick=openProfileModal;
  return panel;
}
function renderJobRoles(){
  const panel=ensureJobRolePanel();
  if(!panel)return;
  const primary=jobRoleById(selectedPrimaryRole());
  const secondary=jobRoleById(selectedSecondaryRole());
  panel.querySelector('#jobRoleGrid').innerHTML=[['Primary job role',primary],['Secondary job role',secondary]].map(([label,role])=>`<div class="manager-card"><span>${esc(label)}</span><strong class="${role?'':'manager-none'}">${esc(role?.name||'Not assigned')}</strong>${role?`<small>${esc(role.division)}</small>`:''}</div>`).join('');
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
  renderJobRoles();
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
function jobRoleOptions(selected){
  const divisions=[...new Set(jobRoleDirectory.map(r=>r.division))];
  return '<option value="">Not assigned</option>'+divisions.map(division=>{
    const roles=jobRoleDirectory.filter(r=>r.division===division);
    return `<optgroup label="${esc(division)}">${roles.map(r=>`<option value="${r.id}" ${String(selected)===String(r.id)?'selected':''}>${esc(r.name)}</option>`).join('')}</optgroup>`;
  }).join('');
}

openProfileModal=function(){
  const primaryRole=selectedPrimaryRole(),secondaryRole=selectedSecondaryRole();
  modal('Edit learner profile',`<div class="form-grid">
    <label>Forename<input name="forename" required value="${esc(learner.forename||'')}"></label>
    <label>Surname<input name="surname" required value="${esc(learner.surname||'')}"></label>
    <label>Date of birth<input name="date_of_birth" type="date" value="${esc(learner.date_of_birth||'')}"></label>
    <label>Email<input name="email" type="email" value="${esc(learner.email||'')}"></label>
    <label>Employee number<input name="employee_number" value="${esc(learner.employee_number||'')}"></label>
    <label>Job title<input name="job_title" value="${esc(learner.job_title||'')}"></label>
    <label>Organisation<input name="organisation" value="${esc(learner.organisation||'')}"></label>
    <label>Account status<select name="account_status"><option value="active" ${learner.account_status==='active'?'selected':''}>Active</option><option value="archived" ${learner.account_status==='archived'?'selected':''}>Archived</option></select></label>
    <div class="manager-fields-title">Compliance job roles</div>
    <div class="manager-select-note">Choose the operative's main role and, where required, a second role. Both roles will be used when calculating compliance.</div>
    <label>Primary job role<select name="primary_job_role">${jobRoleOptions(primaryRole)}</select></label>
    <label>Secondary job role<select name="secondary_job_role">${jobRoleOptions(secondaryRole)}</select></label>
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
    const primary=f.get('primary_job_role')?Number(f.get('primary_job_role')):null;
    const secondary=f.get('secondary_job_role')?Number(f.get('secondary_job_role')):null;
    if(primary&&secondary&&primary===secondary)throw new Error('Primary and secondary job roles must be different.');
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
    const del=await db.from('profile_job_roles').delete().eq('profile_id',learnerId);
    if(del.error)throw del.error;
    const roleRows=[];
    if(primary)roleRows.push({profile_id:learnerId,job_role_id:primary,is_primary:true});
    if(secondary)roleRows.push({profile_id:learnerId,job_role_id:secondary,is_primary:false});
    if(roleRows.length){const ins=await db.from('profile_job_roles').insert(roleRows);if(ins.error)throw ins.error;}
  });
};

const rewireProfileEditors=()=>{
  const top=document.getElementById('editProfileBtn');
  const details=document.getElementById('editProfileBtn2');
  if(top)top.onclick=openProfileModal;
  if(details)details.onclick=openProfileModal;
};
rewireProfileEditors();

(async function installModernProfileShell(){
  if(document.body.dataset.profileShellReady==='1')return;
  document.body.dataset.profileShellReady='1';
  const {data:u}=await db.auth.getUser();
  if(!u?.user)return;
  const [{data:p},{data:access}]=await Promise.all([
    db.from('profiles').select('role,permission_level').eq('id',u.user.id).maybeSingle(),
    db.from('portal_access').select('academy_admin,workforce_manager').eq('user_id',u.user.id).maybeSingle()
  ]);
  const academy=access?.academy_admin===true||p?.permission_level==='super_user'||String(p?.role||'').toLowerCase()==='trainer';
  const portalType=academy?'academy':'workforce';
  const title=academy?'RRTA Training Academy Administration':'RRT Workforce Management';
  const subtitle=academy?'Staff Profile':'Team Member Profile';
  const backHref=academy?'compliance-operatives.html':'workforce.html#team';
  const backText=academy?'← Back To Compliance':'← Back To My Team';
  document.body.dataset.portalNav=portalType;
  document.querySelector('.site-header')?.remove();
  let css=document.querySelector('link[href="portal-navigation.css"]');
  if(!css){css=document.createElement('link');css.rel='stylesheet';css.href='portal-navigation.css';document.head.appendChild(css)}
  const app=document.getElementById('profileApp');
  const errorBox=document.getElementById('profileError');
  if(!app)return;
  const shell=document.createElement('div');shell.className='profile-platform-shell';
  const side=document.createElement('aside');side.className='side';side.innerHTML='<div class="brand"><img src="rrta-logo.png" alt="RRTA"></div><div class="spacer"></div>';
  const main=document.createElement('main');main.className='profile-platform-main';
  const top=document.createElement('header');top.className='profile-platform-top';top.innerHTML=`<strong>${title}</strong><span>${subtitle}</span>`;
  const host=document.createElement('div');host.className='profile-platform-content';
  app.parentNode.insertBefore(shell,app);shell.appendChild(side);shell.appendChild(main);main.appendChild(top);main.appendChild(host);host.appendChild(app);if(errorBox)host.appendChild(errorBox);
  const back=app.querySelector('.profile-topbar a.text-btn');if(back){back.href=backHref;back.textContent=backText}
  const script=document.createElement('script');script.src='portal-navigation.js';document.head.appendChild(script);
})();

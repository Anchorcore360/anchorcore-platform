let managerDirectory=[];
let jobRoleDirectory=[];
let learnerJobRoles=[];
let companyDirectory=[];
const originalLoadData=loadData;
loadData=async function(){
  await originalLoadData();
  const sourcePerson=typeof personRecord!=='undefined'&&!!personRecord;
  const [peopleRes,rolesRes,linksRes,companiesRes]=await Promise.all([
    db.from('profiles').select('id,full_name,forename,surname,employee_number,job_title,role,account_status,organisational_access_role,portal_access_role').order('full_name'),
    db.from('job_roles').select('id,division,name,active').eq('active',true).order('division').order('name'),
    sourcePerson?db.from('person_job_roles').select('person_id,job_role_id,is_primary').eq('person_id',personRecord.id):db.from('person_job_roles').select('person_id,job_role_id,is_primary').eq('person_id','00000000-0000-0000-0000-000000000000'),
    db.from('external_customers').select('id,company_name,is_internal_rrt,active').order('company_name')
  ]);
  if(peopleRes.error)throw peopleRes.error;
  if(rolesRes.error)throw rolesRes.error;
  if(linksRes.error)throw linksRes.error;
  if(companiesRes.error)throw companiesRes.error;
  managerDirectory=(peopleRes.data||[]).filter(p=>p.id!==learnerId);
  jobRoleDirectory=rolesRes.data||[];
  learnerJobRoles=linksRes.data||[];
  companyDirectory=companiesRes.data||[];
};
const originalRender=render;
render=async function(){await originalRender();try{renderManagers();renderJobRoles()}catch(err){console.error('Profile enhancement render failed',err)}};
function managerDisplayName(id){if(!id)return'Not assigned';const p=managerDirectory.find(x=>x.id===id);return p?.full_name||[p?.forename,p?.surname].filter(Boolean).join(' ')||'Unknown employee'}
function managerMeta(id){if(!id)return'';const p=managerDirectory.find(x=>x.id===id);if(!p)return'';return[p.job_title,p.employee_number?`Employee ${p.employee_number}`:''].filter(Boolean).join(' · ')}
function formatDob(value){if(!value)return'—';const[y,m,d]=String(value).split('-');return y&&m&&d?`${d}/${m}/${y}`:value}
function ensureHeroComplianceRole(){const meta=document.querySelector('.profile-meta');if(!meta)return;let row=document.getElementById('primaryComplianceRoleHero');if(!row){row=document.createElement('span');row.id='primaryComplianceRoleHero';const email=document.getElementById('email')?.closest('span');if(email)meta.insertBefore(row,email);else meta.appendChild(row)}const primary=learnerJobRoles.find(x=>x.is_primary)?.job_role_id||null;const role=jobRoleDirectory.find(r=>String(r.id)===String(primary));row.innerHTML='<strong>Primary Compliance Role:</strong> '+esc(role?.name||'Not Assigned')}
function ensurePrimaryManagerSummary(){const details=document.getElementById('detailsGrid');if(!details)return;let box=details.querySelector('[data-primary-manager-summary]');if(box)return;box=document.createElement('div');box.setAttribute('data-primary-manager-summary','1');box.className='detail primary-manager-summary';box.innerHTML='<span>Primary manager</span><strong>Not assigned</strong>';const created=[...details.children].find(x=>x.querySelector('span')?.textContent.trim()==='Created');if(created)details.insertBefore(box,created);else details.appendChild(box)}
function ensureManagerPanel(){let panel=document.getElementById('managerPanel');if(panel)return panel;const overview=document.getElementById('tab-overview'),stats=overview?.querySelector('.profile-grid');if(!overview||!stats)return null;panel=document.createElement('section');panel.id='managerPanel';panel.className='manager-panel';panel.innerHTML='<div class="manager-panel-head"><div><h2>Management & reporting</h2><p>A person can sit under up to three managers.</p></div><button class="btn secondary small" id="editManagersBtn" type="button">Edit managers</button></div><div class="manager-grid" id="managerGrid"></div>';stats.insertAdjacentElement('afterend',panel);panel.querySelector('#editManagersBtn').onclick=openProfileModal;return panel}
function renderManagers(){ensurePrimaryManagerSummary();ensureHeroComplianceRole();const panel=ensureManagerPanel();if(!panel)return;const grid=panel.querySelector('#managerGrid');const items=[['Primary manager',learner.manager_1_id],['Second manager',learner.manager_2_id],['Third manager',learner.manager_3_id]];grid.innerHTML=items.map(([label,id])=>`<div class="manager-card"><span>${esc(label)}</span><strong class="${id?'':'manager-none'}">${esc(managerDisplayName(id))}</strong>${id&&managerMeta(id)?`<small>${esc(managerMeta(id))}</small>`:''}</div>`).join('');const primaryBox=document.querySelector('[data-primary-manager-summary]');if(primaryBox){const id=learner.manager_1_id;primaryBox.innerHTML=`<span>Primary manager</span><strong class="${id?'':'manager-none'}">${esc(managerDisplayName(id))}</strong>${id&&managerMeta(id)?`<small>${esc(managerMeta(id))}</small>`:''}`}}
function selectedPrimaryRole(){return learnerJobRoles.find(x=>x.is_primary)?.job_role_id||null}
function selectedSecondaryRole(){return learnerJobRoles.find(x=>!x.is_primary)?.job_role_id||null}
function jobRoleById(id){return jobRoleDirectory.find(r=>String(r.id)===String(id))}
function ensureJobRolePanel(){let panel=document.getElementById('jobRolePanel');if(panel)return panel;const managerPanel=ensureManagerPanel(),overview=document.getElementById('tab-overview');if(!overview)return null;panel=document.createElement('section');panel.id='jobRolePanel';panel.className='manager-panel';panel.innerHTML='<div class="manager-panel-head"><div><h2>Compliance job roles</h2><p>These roles drive this person’s compliance requirements.</p></div><button class="btn secondary small" id="editJobRolesBtn" type="button">Edit job roles</button></div><div class="manager-grid" id="jobRoleGrid"></div>';if(managerPanel)managerPanel.insertAdjacentElement('afterend',panel);else overview.appendChild(panel);panel.querySelector('#editJobRolesBtn').onclick=openProfileModal;return panel}
function renderJobRoles(){const panel=ensureJobRolePanel();if(!panel)return;const primary=jobRoleById(selectedPrimaryRole()),secondary=jobRoleById(selectedSecondaryRole());panel.querySelector('#jobRoleGrid').innerHTML=[['Primary job role',primary],['Secondary job role',secondary]].map(([label,role])=>`<div class="manager-card"><span>${esc(label)}</span><strong class="${role?'':'manager-none'}">${esc(role?.name||'Not assigned')}</strong>${role?`<small>${esc(role.division)}</small>`:''}</div>`).join('')}
const systemAccessRoles=[['operator','Operator'],['supervisor','Supervisor'],['manager','Manager'],['rrt_subcontractor_manager','RRT Subcontractor Manager'],['rrt_subcontractor_operator','RRT Subcontractor Operator'],['external','External — No Access'],['health_safety','Health & Safety'],['operations_manager','Operations Manager'],['administrator','Administrator'],['academy_staff','Academy Staff']];
function normalizeSystemRole(value){const v=String(value||'operator').trim().toLowerCase();if(v==='operative')return'operator';if(v==='academy'||v==='academy_staff staff'||v==='academy staff staff'||v==='academy staff'||v==='academy_staff')return'academy_staff';return v.replaceAll(' ','_')}
function systemRoleOptions(){const current=normalizeSystemRole(learner.organisational_access_role||learner.portal_access_role||'operator');return systemAccessRoles.map(([v,l])=>`<option value="${v}" ${current===v?'selected':''}>${l}</option>`).join('')}
async function enablePortalAccess(personId,role,password){const {data:{session}}=await db.auth.getSession();if(!session)throw new Error('Your session has expired. Please sign in again.');const supabaseUrl='https://qgbpotjqggeodxqcwkgj.supabase.co',anonKey='sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS';const res=await fetch(supabaseUrl+'/functions/v1/enable-portal-access',{method:'POST',headers:{'Content-Type':'application/json','apikey':anonKey,'Authorization':'Bearer '+session.access_token},body:JSON.stringify({person_id:personId,system_role:role,password})});const body=await res.json().catch(()=>({}));if(!res.ok)throw new Error(body.error||'Portal account could not be created.');return body}
function renderDateOfBirth(){const grid=document.getElementById('detailsGrid');if(!grid)return;let card=document.getElementById('dateOfBirthDetail');if(!card){card=document.createElement('div');card.className='detail';card.id='dateOfBirthDetail';const employeeCard=[...grid.querySelectorAll('.detail')].find(x=>(x.querySelector('span')?.textContent||'').trim().toLowerCase()==='employee number');if(employeeCard)employeeCard.insertAdjacentElement('afterend',card);else grid.appendChild(card)}card.innerHTML=`<span>Date of birth</span><strong>${esc(formatDob(learner.date_of_birth))}</strong>`}
function systemAccessLabel(){const v=normalizeSystemRole(learner.organisational_access_role||learner.portal_access_role||'operator');return systemAccessRoles.find(x=>x[0]===v)?.[1]||v.replaceAll('_',' ')}
function renderSystemAccess(){const label=systemAccessLabel();const grid=document.getElementById('detailsGrid');if(grid){const cards=[...grid.querySelectorAll('.detail')].filter(x=>(x.querySelector('span')?.textContent||'').trim().toLowerCase()==='system access');let card=cards[0];if(card){card.innerHTML=`<span>System access</span><strong><span class="pill access">${esc(label)}</span></strong>`;}cards.slice(1).forEach(x=>x.remove());}const hero=document.getElementById('systemAccessHero');if(hero)hero.textContent=label;document.querySelectorAll('.profile-meta span').forEach(el=>{const k=(el.querySelector('strong')?.textContent||'').trim().toLowerCase();if(k.startsWith('system role'))el.remove();});}
function removeDuplicateQrActions(){const qr=document.querySelector('.qr-slot');if(!qr)return;const hero=document.querySelector('.profile-hero');hero?.querySelectorAll('button').forEach(b=>{if(!b.closest('.photo-wrap')&&!b.closest('.qr-slot'))b.remove()});const qrButtons=[...qr.querySelectorAll('button')];qrButtons.slice(2).forEach(b=>b.remove())}
function markCompactDetails(){document.querySelectorAll('#detailsGrid .detail').forEach(card=>{const label=(card.querySelector('span')?.textContent||'').trim().toLowerCase();card.classList.toggle('email-detail',label==='email');card.classList.toggle('id-detail',label==='learner id')})}
const originalRender=render;render=async function(){await originalRender();renderDateOfBirth();markCompactDetails();renderManagers();renderJobRoles();renderSystemAccess();removeDuplicateQrActions()};
function managerOptions(selected){const eligible=new Set(['supervisor','manager','rrt_subcontractor_manager','health_safety','operations_manager','administrator','academy_staff']);const sorted=[...managerDirectory].filter(p=>eligible.has(normalizeSystemRole(p.organisational_access_role||p.portal_access_role||''))||p.id===selected).sort((a,b)=>{const an=(a.surname||a.full_name||'').toLowerCase(),bn=(b.surname||b.full_name||'').toLowerCase();return an.localeCompare(bn)||String(a.forename||a.full_name||'').localeCompare(String(b.forename||b.full_name||''))});return'<option value="">Not assigned</option>'+sorted.map(p=>{const name=p.full_name||[p.forename,p.surname].filter(Boolean).join(' ')||'Unnamed employee',meta=[p.employee_number,p.job_title].filter(Boolean).join(' · ');return`<option value="${p.id}" ${selected===p.id?'selected':''}>${esc(name)}${meta?` — ${esc(meta)}`:''}</option>`}).join('')}
function companyOptions(){const currentId=(typeof personRecord!=='undefined'&&personRecord?.default_company_id)||'';const currentName=String(learner.organisation||'').trim().toLowerCase();return'<option value="">Select company</option>'+companyDirectory.map(x=>{const selected=(String(x.id)===String(currentId)||(!currentId&&String(x.company_name||'').trim().toLowerCase()===currentName));return'<option value="'+x.id+'"'+(selected?' selected':'')+'>'+esc(x.company_name)+(x.is_internal_rrt?' — RRT':'')+'</option>'}).join('')}
function jobRoleOptions(selected){const divisions=[...new Set(jobRoleDirectory.map(r=>r.division))];return'<option value="">Not assigned</option>'+divisions.map(division=>{const roles=jobRoleDirectory.filter(r=>r.division===division);return`<optgroup label="${esc(division)}">${roles.map(r=>`<option value="${r.id}" ${String(selected)===String(r.id)?'selected':''}>${esc(r.name)}</option>`).join('')}</optgroup>`}).join('')}
openProfileModal=async function(){
  await loadData();
  const primaryRole=selectedPrimaryRole(),secondaryRole=selectedSecondaryRole();
  let linkedPerson=null;
  if(learnerId){
    const lp=await db.from('people').select('id,profile_id,default_company_id').eq('profile_id',learnerId).maybeSingle();
    if(!lp.error)linkedPerson=lp.data||null;
  }
  if(linkedPerson&&typeof personRecord!=='undefined'&&(!personRecord||!personRecord.default_company_id))personRecord=linkedPerson;
  const accessText=systemAccessLabel();
  const statusText=String(learner.account_status||personRecord?.status||'active').replace(/^./,x=>x.toUpperCase());
  modal('Edit person profile',`<div class="form-grid">
    <label>Forename<input name="forename" required value="${esc(learner.forename||'')}"></label>
    <label>Surname<input name="surname" required value="${esc(learner.surname||'')}"></label>
    <label>Date of birth<input name="date_of_birth" type="date" value="${esc(learner.date_of_birth||'')}"></label>
    <label>Email<input name="email" type="email" value="${esc(learner.email||'')}"></label>
    <label>Employee number<input name="employee_number" value="${esc(learner.employee_number||'')}"></label>
    <label>Job title <span style="font-weight:500;color:#7a8491">(Staffology/company title — entered manually)</span><input name="job_title" value="${esc(learner.job_title||'')}" placeholder="Enter company job title"></label>
    <label style="align-self:start">System Access
      <div style="margin-top:5px;height:42px;border:1px solid #d3d9df;border-radius:8px;background:#f4f6f8;padding:0 11px;display:flex;align-items:center;font-size:11px;font-weight:800;color:#475467">${esc(accessText)}</div>
      <span style="display:block;font-weight:500;color:#7a8491;margin-top:5px">View only. Change access in Setup → Manage Users.</span>
    </label>
    <label style="align-self:start">Account status
      <div style="margin-top:5px;height:42px;border:1px solid #d3d9df;border-radius:8px;background:#f4f6f8;padding:0 11px;display:flex;align-items:center;font-size:11px;font-weight:800;color:#475467">${esc(statusText)}</div>
      <span style="display:block;font-weight:500;color:#7a8491;margin-top:5px">View only. Lifecycle changes are managed through Manage People.</span>
    </label>
    <label style="align-self:start">Company<select name="company_id" required>${companyOptions()}</select><span style="display:block;font-weight:500;color:#7a8491;margin-top:5px">Choose Independent when no company details are supplied.</span></label>
    <div class="manager-fields-title">Compliance job roles</div>
    <div class="manager-select-note">Choose the main compliance role and, where required, a second role.</div>
    <label>Primary job role<select name="primary_job_role">${jobRoleOptions(primaryRole)}</select></label>
    <label>Secondary job role<select name="secondary_job_role">${jobRoleOptions(secondaryRole)}</select></label>
    <div class="manager-fields-title">Management & reporting</div>
    <div class="manager-select-note">Select up to three different managers.</div>
    <label>Primary manager<select name="manager_1_id">${managerOptions(learner.manager_1_id)}</select></label>
    <label>Second manager<select name="manager_2_id">${managerOptions(learner.manager_2_id)}</select></label>
    <label>Third manager<select name="manager_3_id">${managerOptions(learner.manager_3_id)}</select></label>
  </div>`,async f=>{
    const forename=f.get('forename').trim(),surname=f.get('surname').trim(),
      managers=[f.get('manager_1_id')||null,f.get('manager_2_id')||null,f.get('manager_3_id')||null],
      chosen=managers.filter(Boolean);
    if(new Set(chosen).size!==chosen.length)throw new Error('Please choose a different person for each manager position.');
    const primary=f.get('primary_job_role')?Number(f.get('primary_job_role')):null,
      secondary=f.get('secondary_job_role')?Number(f.get('secondary_job_role')):null;
    if(primary&&secondary&&primary===secondary)throw new Error('Primary and secondary job roles must be different.');
    const companyId=f.get('company_id')||null;
    if(!companyId)throw new Error('Please select a company or Independent.');
    const company=companyDirectory.find(x=>String(x.id)===String(companyId));
    if(!company)throw new Error('The selected company could not be found.');
    const syncCompanyRelationship=async(personId)=>{
      const now=new Date().toISOString();
      const relationshipType=company?.is_internal_rrt?'rrt_direct_staff':'rrta_external_delegate';
      const active=await db.from('person_relationships').select('id,company_id,relationship_type').eq('person_id',personId).eq('active',true);
      if(active.error)throw active.error;
      for(const rel of (active.data||[]).filter(r=>String(r.company_id)!==String(companyId)||String(r.relationship_type)!==relationshipType)){
        const endRel=await db.from('person_relationships').update({active:false,ended_at:now,updated_at:now}).eq('id',rel.id);
        if(endRel.error)throw endRel.error;
      }
      const matching=(active.data||[]).find(r=>String(r.company_id)===String(companyId)&&String(r.relationship_type)===relationshipType);
      if(!matching){
        const existing=await db.from('person_relationships').select('id').eq('person_id',personId).eq('company_id',companyId).eq('relationship_type',relationshipType).maybeSingle();
        if(existing.error)throw existing.error;
        if(existing.data?.id){
          const revive=await db.from('person_relationships').update({active:true,ended_at:null,updated_at:now}).eq('id',existing.data.id);
          if(revive.error)throw revive.error;
        }else{
          const ins=await db.from('person_relationships').insert({person_id:personId,relationship_type:relationshipType,company_id:companyId,active:true,started_at:now,updated_at:now});
          if(ins.error)throw ins.error;
        }
      }
    };
    const savePersonRoles=async(personId)=>{
      const del=await db.from('person_job_roles').delete().eq('person_id',personId);if(del.error)throw del.error;
      const rows=[];if(primary)rows.push({person_id:personId,job_role_id:primary,is_primary:true});if(secondary)rows.push({person_id:personId,job_role_id:secondary,is_primary:false});
      if(rows.length){const ins=await db.from('person_job_roles').insert(rows);if(ins.error)throw ins.error}
    };
    const sourcePerson=typeof personRecord!=='undefined'&&!!personRecord;
    if(sourcePerson){
      const personPatch={
        forename,surname,full_name:`${forename} ${surname}`.trim(),
        date_of_birth:f.get('date_of_birth')||null,
        email:f.get('email').trim().toLowerCase()||null,
        employee_number:f.get('employee_number').trim()||null,
        job_title:(f.get('job_title')||'').trim()||null,
        default_company_id:companyId,
        updated_at:new Date().toISOString()
      };
      const pe=await db.from('people').update(personPatch).eq('id',personRecord.id);if(pe.error)throw pe.error;
      await syncCompanyRelationship(personRecord.id);
      await savePersonRoles(personRecord.id);
      if(personRecord.profile_id){
        const pu=await db.from('profiles').update({
          forename,surname,full_name:`${forename} ${surname}`.trim(),
          date_of_birth:f.get('date_of_birth')||null,
          email:f.get('email').trim().toLowerCase()||null,
          employee_number:f.get('employee_number').trim()||null,
          job_title:(f.get('job_title')||'').trim()||null,
          organisation:company.company_name,
          company_id:companyId,
          manager_1_id:managers[0],manager_2_id:managers[1],manager_3_id:managers[2],
          updated_at:new Date().toISOString()
        }).eq('id',personRecord.profile_id);
        if(pu.error)throw pu.error;
      }
    }else{
      const pu=await db.from('profiles').update({
        forename,surname,full_name:`${forename} ${surname}`.trim(),
        date_of_birth:f.get('date_of_birth')||null,
        email:f.get('email').trim().toLowerCase()||null,
        employee_number:f.get('employee_number').trim()||null,
        job_title:(f.get('job_title')||'').trim()||null,
        organisation:company.company_name,
        company_id:companyId,
        manager_1_id:managers[0],manager_2_id:managers[1],manager_3_id:managers[2],
        updated_at:new Date().toISOString()
      }).eq('id',learnerId);
      if(pu.error)throw pu.error;
      const linked=await db.from('people').select('id').eq('profile_id',learnerId).maybeSingle();
      if(linked.error)throw linked.error;
      if(linked.data?.id){
        const pe=await db.from('people').update({default_company_id:companyId,updated_at:new Date().toISOString()}).eq('id',linked.data.id);
        if(pe.error)throw pe.error;
        await syncCompanyRelationship(linked.data.id);
      }
      const del=await db.from('profile_job_roles').delete().eq('profile_id',learnerId);if(del.error)throw del.error;
      const roleRows=[];if(primary)roleRows.push({profile_id:learnerId,job_role_id:primary,is_primary:true});if(secondary)roleRows.push({profile_id:learnerId,job_role_id:secondary,is_primary:false});
      if(roleRows.length){const ins=await db.from('profile_job_roles').insert(roleRows);if(ins.error)throw ins.error}
    }
  })
};
const rewireProfileEditors=()=>{const top=document.getElementById('editProfileBtn'),details=document.getElementById('editProfileBtn2');if(top){top.onclick=null;top.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openProfileModal()},true)}if(details){details.onclick=null;details.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openProfileModal()},true)}};rewireProfileEditors();
(function installProfileShell(){
  if(document.body.dataset.profileShellReady==='1')return;document.body.dataset.profileShellReady='1';
  document.body.dataset.portalNav='academy';
  let css=document.querySelector('link[href="portal-navigation.css"]');if(!css){css=document.createElement('link');css.rel='stylesheet';css.href='portal-navigation.css';document.head.appendChild(css)}
  const app=document.getElementById('profileApp');if(!app)return;
  const existingShell=app.closest('.profile-platform-shell');
  if(existingShell){existingShell.classList.add('portal-shell');let side=existingShell.querySelector('aside');if(side)side.classList.add('portal-side')}
  if(!document.querySelector('script[src^="portal-navigation.js"]')){const script=document.createElement('script');script.src='portal-navigation.js?v=20260918-1235';document.head.appendChild(script)}
})();
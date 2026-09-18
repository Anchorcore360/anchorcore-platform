(function(){
  const accessLabel=v=>({operative:'Operative',supervisor:'Supervisor',manager:'Manager',operations_manager:'Operations Manager'}[String(v||'').toLowerCase()]||'Operative');
  const fieldStyle='width:100%;height:38px;border:1px solid #b8c1cc;border-radius:7px;background:#fff;padding:0 10px;font:inherit;font-size:13px;font-weight:700;color:#18202a';

  function hideTopEdit(){const top=document.getElementById('editProfileBtn');if(top)top.style.display='none'}

  function renderSystemAccessCard(){
    const grid=document.getElementById('detailsGrid');if(!grid||typeof learner==='undefined'||!learner?.id)return;
    let card=document.getElementById('systemAccessDetail');
    if(!card){card=document.createElement('div');card.className='detail';card.id='systemAccessDetail';const surname=[...grid.querySelectorAll('.detail')].find(x=>(x.querySelector('span')?.textContent||'').trim().toLowerCase()==='surname');if(surname)surname.insertAdjacentElement('afterend',card);else grid.prepend(card)}
    card.innerHTML='<span>System access</span><strong><span style="display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:#edf2f7;color:#344054;font-size:10px;font-weight:850">'+accessLabel(learner.organisational_access_role||learner.portal_access_role||'operative')+'</span></strong>';
  }

  function editableControl(label,value){
    const safe=String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
    if(label==='Account status')return '<select data-profile-field="account_status" style="'+fieldStyle+'"><option value="active" '+(value==='active'?'selected':'')+'>Active</option><option value="archived" '+(value==='archived'?'selected':'')+'>Archived</option></select>';
    if(label==='System access'){const current=String(value||'operative');return '<select data-profile-field="system_role" style="'+fieldStyle+'"><option value="operative" '+(current==='operative'?'selected':'')+'>Operative</option><option value="supervisor" '+(current==='supervisor'?'selected':'')+'>Supervisor</option><option value="manager" '+(current==='manager'?'selected':'')+'>Manager</option><option value="operations_manager" '+(current==='operations_manager'?'selected':'')+'>Operations Manager</option></select>'}
    if(label==='Job title'){const current=String(value||'');const titles=['Senior Training Lead','Training Lead','Trainer','Assessor','IQA','Lead IQA','Operations Director','Operations Manager','Manager','Supervisor','Engineer','Fibre Supervisor','Fibre Engineer','Civils Supervisor','Civils Operative','Administrator','Finance Administrator','HR Administrator','Stores Operative'];const vals=[...new Set([current,...titles].filter(Boolean))].sort((a,b)=>a.localeCompare(b));return '<select data-profile-field="job_title" style="'+fieldStyle+'"><option value="">Select job title</option>'+vals.map(v=>'<option value="'+v.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'" '+(current===v?'selected':'')+'>'+v.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>').join('')+'</select>'} const map={'Forename':['forename','text'],'Surname':['surname','text'],'Email':['email','email'],'Employee number':['employee_number','text'],'Date of birth':['date_of_birth','date'],'Organisation':['organisation','text']};
    const config=map[label];if(!config)return null;
    return '<input data-profile-field="'+config[0]+'" type="'+config[1]+'" value="'+safe+'" style="'+fieldStyle+'">';
  }

  function enterInlineEdit(){
    const grid=document.getElementById('detailsGrid'),edit=document.getElementById('editProfileBtn2');if(!grid||!edit)return;
    const values={Forename:learner.forename||'',Surname:learner.surname||'',Email:learner.email||'','Employee number':learner.employee_number||'','Date of birth':learner.date_of_birth||'','Job title':learner.job_title||'',Organisation:learner.organisation||'','Account status':learner.account_status||'active','System access':learner.organisational_access_role||learner.portal_access_role||'operative'};
    grid.querySelectorAll('.detail').forEach(card=>{const label=(card.querySelector('span')?.textContent||'').trim();const control=editableControl(label,values[label]);if(control){const value=card.querySelector('strong');if(value)value.outerHTML=control}}); const academyCard=document.getElementById('academyRoleDetail');if(academyCard){const current=typeof academyRole==='function'?academyRole():'none',admin=typeof academyAdmin==='function'&&academyAdmin();academyCard.innerHTML='<span>Academy role</span><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><select data-profile-field="academy_role" style="'+fieldStyle+'"><option value="none" '+(current==='none'?'selected':'')+'>None</option><option value="trainee_assessor" '+(current==='trainee_assessor'?'selected':'')+'>Trainee Assessor</option><option value="assessor" '+(current==='assessor'?'selected':'')+'>Assessor</option><option value="iqa" '+(current==='iqa'?'selected':'')+'>IQA</option><option value="lead_iqa" '+(current==='lead_iqa'?'selected':'')+'>Lead IQA</option></select><select data-profile-field="academy_admin" style="'+fieldStyle+'"><option value="no" '+(!admin?'selected':'')+'>Admin: No</option><option value="yes" '+(admin?'selected':'')+'>Admin: Yes</option></select></div>'}
    edit.textContent='Save Changes';edit.className='btn dark small';edit.onclick=saveInlineEdit;
    let cancel=document.getElementById('cancelInlineProfileEdit');if(!cancel){cancel=document.createElement('button');cancel.id='cancelInlineProfileEdit';cancel.type='button';cancel.className='btn secondary small';cancel.textContent='Cancel';edit.insertAdjacentElement('beforebegin',cancel)}cancel.onclick=()=>render();
  }

  async function saveInlineEdit(){
    const edit=document.getElementById('editProfileBtn2'),msgId='inlineProfileSaveMsg';if(!edit)return;
    const get=name=>document.querySelector('[data-profile-field="'+name+'"]')?.value?.trim()||null;
    const role=get('system_role')||'operative',forename=get('forename')||'',surname=get('surname')||'';
    edit.disabled=true;edit.textContent='Saving…';
    let msg=document.getElementById(msgId);if(!msg){msg=document.createElement('span');msg.id=msgId;msg.style.cssText='font-size:11px;color:#667085;margin-right:8px';edit.insertAdjacentElement('beforebegin',msg)}
    const patch={forename,surname,full_name:(forename+' '+surname).trim(),email:(get('email')||'').toLowerCase()||null,employee_number:get('employee_number'),date_of_birth:get('date_of_birth'),job_title:get('job_title'),organisation:get('organisation'),account_status:get('account_status')||'active',organisational_access_role:role,portal_access_role:role,updated_at:new Date().toISOString()};
    const {data,error}=await db.from('profiles').update(patch).eq('id',learner.id).select('*').single();
    if(error){msg.textContent=error.message||'Unable to save profile.';msg.style.color='#b42318';edit.disabled=false;edit.textContent='Save Changes';return}
    learner=data;const academySel=get('academy_role'),academyAdminSel=get('academy_admin');if(academySel!==null&&typeof academyHierarchy!=='undefined'){const managed=[...academyHierarchy,'academy_admin'];const off=await db.from('profile_academy_roles').update({active:false}).eq('profile_id',learner.id).in('role_code',managed);if(off.error){msg.textContent=off.error.message;msg.style.color='#b42318';edit.disabled=false;edit.textContent='Save Changes';return}const wanted=[];if(academySel&&academySel!=='none'){const idx=academyHierarchy.indexOf(academySel);for(let i=0;i<=idx;i++)wanted.push(academyHierarchy[i])}if(academyAdminSel==='yes')wanted.push('academy_admin');if(wanted.length){const tm=await db.from('academy_training_team').upsert({profile_id:learner.id,active:true},{onConflict:'profile_id'});if(tm.error){msg.textContent=tm.error.message;msg.style.color='#b42318';edit.disabled=false;edit.textContent='Save Changes';return}for(const role_code of wanted){const rr=await db.from('profile_academy_roles').upsert({profile_id:learner.id,role_code,active:true,granted_by:trainer.id},{onConflict:'profile_id,role_code'});if(rr.error){msg.textContent=rr.error.message;msg.style.color='#b42318';edit.disabled=false;edit.textContent='Save Changes';return}}}else{await db.from('academy_training_team').update({active:false}).eq('profile_id',learner.id)}}msg.textContent='Saved';msg.style.color='#176b37';await refresh();
  }

  function wireInlineEditor(){
    const edit=document.getElementById('editProfileBtn2');if(!edit)return;
    const oldGroup=document.getElementById('profileAccessHeaderActions');if(oldGroup){oldGroup.parentElement.insertBefore(edit,oldGroup);oldGroup.remove()}
    edit.textContent='Edit Profile';edit.className='btn secondary small';edit.disabled=false;edit.title='Edit all displayed profile details';edit.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();enterInlineEdit()};
    document.getElementById('cancelInlineProfileEdit')?.remove();document.getElementById('inlineProfileSaveMsg')?.remove();
  }

  async function enhancePersonProfile(){
    hideTopEdit();
    if(typeof learner==='undefined'||!learner?.id||typeof db==='undefined')return;
    const eyebrow=document.querySelector('.profile-topbar .eyebrow');if(eyebrow)eyebrow.textContent='Person Record';
    const backLink=document.querySelector('.profile-topbar .text-btn');if(backLink){backLink.href='manage-people.html';backLink.textContent='← Back to Manage People'}
    const jobTitleValue=document.getElementById('jobTitle');if(jobTitleValue)jobTitleValue.textContent=learner.job_title||'Not set';
    let accessSpan=document.getElementById('systemRoleHeader');if(!accessSpan){const meta=document.querySelector('.profile-meta');if(meta){accessSpan=document.createElement('span');accessSpan.id='systemRoleHeader';accessSpan.innerHTML='<strong>System Role:</strong> <span id="systemRoleValue"></span>';const emailSpan=[...meta.children].find(x=>x.textContent.trim().startsWith('Email:'));if(emailSpan)meta.insertBefore(accessSpan,emailSpan);else meta.appendChild(accessSpan)}}
    const systemRoleValue=document.getElementById('systemRoleValue');if(systemRoleValue)systemRoleValue.textContent=accessLabel(learner.organisational_access_role||learner.portal_access_role||'operative');
    renderSystemAccessCard();wireInlineEditor();
    let complianceSpan=document.getElementById('primaryComplianceRoleHeader');if(!complianceSpan){const meta=document.querySelector('.profile-meta');if(meta){complianceSpan=document.createElement('span');complianceSpan.id='primaryComplianceRoleHeader';complianceSpan.innerHTML='<strong>Primary Compliance Role:</strong> <span id="primaryComplianceRoleValue">Loading…</span>';const emailSpan=[...meta.children].find(x=>x.textContent.trim().startsWith('Email:'));if(emailSpan)meta.insertBefore(complianceSpan,emailSpan);else meta.appendChild(complianceSpan)}}
    const roleValue=document.getElementById('primaryComplianceRoleValue');if(roleValue){try{const{data,error}=await db.from('profile_job_roles').select('job_role_id,is_primary,job_roles(name,division)').eq('profile_id',learner.id).order('is_primary',{ascending:false}).limit(1);if(error)throw error;const role=data?.[0]?.job_roles;roleValue.textContent=role?.name||'Not Assigned'}catch(e){roleValue.textContent='Not Assigned'}}
    const qr=document.querySelector('.qr-slot');if(qr){const small=qr.querySelector('small');if(small)small.textContent='Person ID / verification'}
  }

  if(typeof render==='function'){const previousRender=render;render=async function(){const result=await previousRender.apply(this,arguments);await enhancePersonProfile();return result};setTimeout(enhancePersonProfile,0);setTimeout(enhancePersonProfile,350)}else{window.addEventListener('load',()=>setTimeout(enhancePersonProfile,250))}
})();
(function(){
  const accessLabel=v=>({operative:'Operative',operator:'Operative',supervisor:'Supervisor',manager:'Manager',rrt_subcontractor_manager:'RRT Subcontractor Manager',rrt_subcontractor_operator:'RRT Subcontractor Operator',external:'External - No Access',health_safety:'Health & Safety',operations_manager:'Operations Manager',administrator:'Administrator',academy:'Academy Staff',academy_staff:'Academy Staff'}[String(v||'').toLowerCase()]||'No Portal Access');
  const fieldStyle='width:100%;height:38px;border:1px solid #b8c1cc;border-radius:7px;background:#fff;padding:0 10px;font:inherit;font-size:13px;font-weight:700;color:#18202a';

  function hideTopEdit(){const top=document.getElementById('editProfileBtn');if(top)top.style.display='none'}

  function renderSystemAccessCard(){
    const grid=document.getElementById('detailsGrid');if(!grid||typeof learner==='undefined'||!learner?.id)return;
    const systemCards=[...grid.querySelectorAll('.detail')].filter(x=>(x.querySelector('span')?.textContent||'').trim().toLowerCase()==='system access');let card=systemCards[0]||document.getElementById('systemAccessDetail');
    systemCards.slice(1).forEach(x=>x.remove());
    if(!card){card=document.createElement('div');card.className='detail';const surname=[...grid.querySelectorAll('.detail')].find(x=>(x.querySelector('span')?.textContent||'').trim().toLowerCase()==='surname');if(surname)surname.insertAdjacentElement('afterend',card);else grid.prepend(card)}
    card.id='systemAccessDetail';card.innerHTML='<span>System access</span><strong><span style="display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:#edf2f7;color:#344054;font-size:10px;font-weight:850">'+accessLabel(learner.organisational_access_role||learner.portal_access_role||'operative')+'</span></strong>';
  }

  function editableControl(label,value){
    const safe=String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
    if(label==='Account status'||label==='System access')return null;
    if(label==='Organisation')return '<select data-profile-field="company_id" style="'+fieldStyle+'"><option value="">Select company</option></select>';
    if(label==='Job title'){const current=String(value||'');const titles=['Senior Training Lead','Training Lead','Trainer','Assessor','IQA','Lead IQA','Operations Director','Operations Manager','Manager','Supervisor','Engineer','Fibre Supervisor','Fibre Engineer','Civils Supervisor','Civils Operative','Administrator','Finance Administrator','HR Administrator','Stores Operative'];const vals=[...new Set([current,...titles].filter(Boolean))].sort((a,b)=>a.localeCompare(b));return '<select data-profile-field="job_title" style="'+fieldStyle+'"><option value="">Select job title</option>'+vals.map(v=>'<option value="'+v.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'" '+(current===v?'selected':'')+'>'+v.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>').join('')+'</select>'} const map={'Forename':['forename','text'],'Surname':['surname','text'],'Email':['email','email'],'Employee number':['employee_number','text'],'Date of birth':['date_of_birth','date'],'Organisation':['organisation','text']};
    const config=map[label];if(!config)return null;
    return '<input data-profile-field="'+config[0]+'" type="'+config[1]+'" value="'+safe+'" style="'+fieldStyle+'">';
  }

  function enterInlineEdit(){
    const grid=document.getElementById('detailsGrid'),edit=document.getElementById('editProfileBtn2');if(!grid||!edit)return;
    const values={Forename:learner.forename||'',Surname:learner.surname||'',Email:learner.email||'','Employee number':learner.employee_number||'','Date of birth':learner.date_of_birth||'','Job title':learner.job_title||'',Organisation:learner.organisation||''};
    grid.querySelectorAll('.detail').forEach(card=>{const label=(card.querySelector('span')?.textContent||'').trim();const control=editableControl(label,values[label]);if(control){const value=card.querySelector('strong');if(value)value.outerHTML=control}}); const academyCard=document.getElementById('academyRoleDetail');if(academyCard)academyCard.remove();
    const companySelect=document.querySelector('[data-profile-field="company_id"]');if(companySelect){companySelect.innerHTML='<option value="">Loading companies…</option>';db.from('external_customers').select('id,company_name,is_internal_rrt').eq('active',true).is('archived_at',null).order('company_name').then(({data,error})=>{if(error){companySelect.innerHTML='<option value="">Unable to load companies</option>';return}const currentId=(typeof personRecord!=='undefined'&&personRecord?.default_company_id)||'';companySelect.innerHTML='<option value="">Select company</option>'+data.map(x=>'<option value="'+x.id+'" '+(x.id===currentId?'selected':'')+'>'+String(x.company_name||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')+(x.is_internal_rrt?' — RRT':'')+'</option>').join('')})}
    edit.textContent='Save Changes';edit.className='btn dark small';edit.onclick=saveInlineEdit;
    let cancel=document.getElementById('cancelInlineProfileEdit');if(!cancel){cancel=document.createElement('button');cancel.id='cancelInlineProfileEdit';cancel.type='button';cancel.className='btn secondary small';cancel.textContent='Cancel';edit.insertAdjacentElement('beforebegin',cancel)}cancel.onclick=()=>render();
  }

  async function saveInlineEdit(){
    const edit=document.getElementById('editProfileBtn2'),msgId='inlineProfileSaveMsg';if(!edit)return;
    const get=name=>document.querySelector('[data-profile-field="'+name+'"]')?.value?.trim()||null;
    const forename=get('forename')||'',surname=get('surname')||'',companyId=get('company_id');
    edit.disabled=true;edit.textContent='Saving…';
    let msg=document.getElementById(msgId);if(!msg){msg=document.createElement('span');msg.id=msgId;msg.style.cssText='font-size:11px;color:#667085;margin-right:8px';edit.insertAdjacentElement('beforebegin',msg)}
    const patch={forename,surname,full_name:(forename+' '+surname).trim(),email:(get('email')||'').toLowerCase()||null,employee_number:get('employee_number'),date_of_birth:get('date_of_birth'),job_title:get('job_title'),organisation:get('organisation'),updated_at:new Date().toISOString()};
    let data,error;if(typeof personRecord!=='undefined'&&personRecord&&!personRecord.profile_id){let companyName=null;if(companyId){const companyResult=await db.from('external_customers').select('company_name').eq('id',companyId).maybeSingle();if(companyResult.error){error=companyResult.error}else companyName=companyResult.data?.company_name||null}const personPatch={forename,surname,full_name:patch.full_name,email:patch.email,employee_number:patch.employee_number,job_title:patch.job_title,default_company_id:companyId,updated_at:patch.updated_at};const result=await db.from('people').update(personPatch).eq('id',personRecord.id).select('*').single();data=result.data;error=error||result.error;if(!error){personRecord=data;learner={...learner,...data,organisation:companyName||''}}}else{const result=await db.from('profiles').update(patch).eq('id',learner.id).select('*').single();data=result.data;error=result.error;if(!error)learner=data}
    if(error){msg.textContent=error.message||'Unable to save profile.';msg.style.color='#b42318';edit.disabled=false;edit.textContent='Save Changes';return}
    msg.textContent='Saved';msg.style.color='#176b37';await refresh();
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
    const duplicateAccess=document.getElementById('systemRoleHeader');if(duplicateAccess)duplicateAccess.remove();
    renderSystemAccessCard();wireInlineEditor();
    let complianceSpan=document.getElementById('primaryComplianceRoleHeader');if(!complianceSpan){const meta=document.querySelector('.profile-meta');if(meta){complianceSpan=document.createElement('span');complianceSpan.id='primaryComplianceRoleHeader';complianceSpan.innerHTML='<strong>Primary Compliance Role:</strong> <span id="primaryComplianceRoleValue">Loading…</span>';const emailSpan=[...meta.children].find(x=>x.textContent.trim().startsWith('Email:'));if(emailSpan)meta.insertBefore(complianceSpan,emailSpan);else meta.appendChild(complianceSpan)}}
    const roleValue=document.getElementById('primaryComplianceRoleValue');if(roleValue){try{const sourceIsPerson=typeof personRecord!=='undefined'&&personRecord&&!personRecord.profile_id;const roleQuery=sourceIsPerson?db.from('person_job_roles').select('job_role_id,is_primary,job_roles(name,division)').eq('person_id',personRecord.id):db.from('profile_job_roles').select('job_role_id,is_primary,job_roles(name,division)').eq('profile_id',learner.id);const{data,error}=await roleQuery.order('is_primary',{ascending:false}).limit(1);if(error)throw error;const role=data?.[0]?.job_roles;roleValue.textContent=role?.name||'Not Assigned'}catch(e){roleValue.textContent='Not Assigned'}}
    const qr=document.querySelector('.qr-slot');if(qr){const small=qr.querySelector('small');if(small)small.textContent='Person ID / verification'}
  }

  if(typeof render==='function'){const previousRender=render;render=async function(){const result=await previousRender.apply(this,arguments);await enhancePersonProfile();return result};setTimeout(enhancePersonProfile,0);setTimeout(enhancePersonProfile,350)}else{window.addEventListener('load',()=>setTimeout(enhancePersonProfile,250))}
})();
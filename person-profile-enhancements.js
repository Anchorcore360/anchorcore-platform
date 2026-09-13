(function(){
  const accessLabel=v=>({operative:'Operative',supervisor:'Supervisor',manager:'Manager',operations_manager:'Operations Manager'}[String(v||'').toLowerCase()]||'Operative');
  function hideTopEdit(){const top=document.getElementById('editProfileBtn');if(top)top.style.display='none';}
  function renderSystemAccessControl(){
    document.getElementById('systemAccessDetail')?.remove();
    if(typeof learner==='undefined'||!learner?.id)return;
    const edit=document.getElementById('editProfileBtn2'),head=edit?.closest('.panel-head-row');if(!edit||!head)return;
    let group=document.getElementById('profileAccessHeaderActions');
    if(!group){
      group=document.createElement('div');group.id='profileAccessHeaderActions';group.style.cssText='display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end';
      head.appendChild(group);group.appendChild(edit);
    }
    let label=document.getElementById('profileSystemRoleLabel');
    if(!label){label=document.createElement('span');label.id='profileSystemRoleLabel';label.textContent='System Role';label.style.cssText='font-size:11px;font-weight:750;color:#667085';group.insertBefore(label,edit)}
    let badge=document.getElementById('profileSystemRoleBadge');
    if(!badge){badge=document.createElement('span');badge.id='profileSystemRoleBadge';badge.style.cssText='display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:#edf2f7;color:#344054;font-size:10px;font-weight:850;white-space:nowrap';group.insertBefore(badge,edit)}
    badge.textContent=accessLabel(learner.organisational_access_role||learner.portal_access_role||'operative');
    edit.textContent='Edit Profile';
    edit.title='Edit personal details, job title, reporting and system access';
  }
  async function enhancePersonProfile(){
    hideTopEdit();
    if(typeof learner==='undefined'||!learner?.id||typeof db==='undefined')return;
    const eyebrow=document.querySelector('.profile-topbar .eyebrow');
    if(eyebrow)eyebrow.textContent='Person Record';
    const backLink=document.querySelector('.profile-topbar .text-btn');
    if(backLink){backLink.href='manage-people.html';backLink.textContent='← Back to Manage People'}
    const details=document.getElementById('editProfileBtn2');
    if(details){details.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();location.href=`manage-person.html?id=${encodeURIComponent(learner.id)}`};details.textContent='Edit Profile'}
    const jobTitleValue=document.getElementById('jobTitle');if(jobTitleValue)jobTitleValue.textContent=learner.job_title||'Not set';let accessSpan=document.getElementById('systemRoleHeader');if(!accessSpan){const meta=document.querySelector('.profile-meta');if(meta){accessSpan=document.createElement('span');accessSpan.id='systemRoleHeader';accessSpan.innerHTML='<strong>System Role:</strong> <span id="systemRoleValue"></span>';const emailSpan=[...meta.children].find(x=>x.textContent.trim().startsWith('Email:'));if(emailSpan)meta.insertBefore(accessSpan,emailSpan);else meta.appendChild(accessSpan)}}const systemRoleValue=document.getElementById('systemRoleValue');if(systemRoleValue)systemRoleValue.textContent=accessLabel(learner.organisational_access_role||learner.portal_access_role||'operative');renderSystemAccessControl()
    let complianceSpan=document.getElementById('primaryComplianceRoleHeader');
    if(!complianceSpan){const meta=document.querySelector('.profile-meta');if(meta){complianceSpan=document.createElement('span');complianceSpan.id='primaryComplianceRoleHeader';complianceSpan.innerHTML='<strong>Primary Compliance Role:</strong> <span id="primaryComplianceRoleValue">Loading…</span>';const emailSpan=[...meta.children].find(x=>x.textContent.trim().startsWith('Email:'));if(emailSpan)meta.insertBefore(complianceSpan,emailSpan);else meta.appendChild(complianceSpan)}}
    const roleValue=document.getElementById('primaryComplianceRoleValue');
    if(roleValue){try{const{data,error}=await db.from('profile_job_roles').select('job_role_id,is_primary,job_roles(name,division)').eq('profile_id',learner.id).order('is_primary',{ascending:false}).limit(1);if(error)throw error;const role=data?.[0]?.job_roles;roleValue.textContent=role?.name||'Not Assigned'}catch(e){roleValue.textContent='Not Assigned'}}
    const qr=document.querySelector('.qr-slot');if(qr){const small=qr.querySelector('small');if(small)small.textContent='Person ID / verification'}
  }
  if(typeof render==='function'){const previousRender=render;render=async function(){const result=await previousRender.apply(this,arguments);await enhancePersonProfile();return result};setTimeout(enhancePersonProfile,0);setTimeout(enhancePersonProfile,350)}else{window.addEventListener('load',()=>setTimeout(enhancePersonProfile,250))}
})();
(function(){
  const accessLabel=v=>({operative:'Operative',supervisor:'Supervisor',manager:'Manager',operations_manager:'Operations Manager'}[String(v||'').toLowerCase()]||'Operative');
  async function enhancePersonProfile(){
    if(typeof learner==='undefined'||!learner?.id||typeof db==='undefined')return;
    const eyebrow=document.querySelector('.profile-topbar .eyebrow');
    if(eyebrow)eyebrow.textContent='Person Record';
    const backLink=document.querySelector('.profile-topbar .text-btn');
    if(backLink){backLink.href='manage-people.html';backLink.textContent='← Back to Manage People'}
    ['editProfileBtn','editProfileBtn2'].forEach(btnId=>{const btn=document.getElementById(btnId);if(btn){btn.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();location.href=`manage-person.html?id=${encodeURIComponent(learner.id)}`};btn.textContent=btnId==='editProfileBtn'?'Edit Profile':'Edit Profile'}});
    const accessValue=document.getElementById('jobTitle');
    if(accessValue){
      const label=accessValue.parentElement?.querySelector('strong');
      if(label)label.textContent='Access Level:';
      accessValue.textContent=accessLabel(learner.organisational_access_role||learner.portal_access_role||'operative');
    }
    let complianceSpan=document.getElementById('primaryComplianceRoleHeader');
    if(!complianceSpan){
      const meta=document.querySelector('.profile-meta');
      if(meta){
        complianceSpan=document.createElement('span');
        complianceSpan.id='primaryComplianceRoleHeader';
        complianceSpan.innerHTML='<strong>Primary Compliance Role:</strong> <span id="primaryComplianceRoleValue">Loading…</span>';
        const emailSpan=[...meta.children].find(x=>x.textContent.trim().startsWith('Email:'));
        if(emailSpan)meta.insertBefore(complianceSpan,emailSpan);else meta.appendChild(complianceSpan);
      }
    }
    const roleValue=document.getElementById('primaryComplianceRoleValue');
    if(roleValue){
      try{
        const {data,error}=await db.from('profile_job_roles').select('job_role_id,is_primary,job_roles(name,division)').eq('profile_id',learner.id).order('is_primary',{ascending:false}).limit(1);
        if(error)throw error;
        const role=data?.[0]?.job_roles;
        roleValue.textContent=role?.name||'Not Assigned';
      }catch(e){roleValue.textContent='Not Assigned'}
    }
    const qr=document.querySelector('.qr-slot');
    if(qr){
      const small=qr.querySelector('small');
      if(small)small.textContent='Person ID / verification';
    }
  }
  if(typeof render==='function'){
    const previousRender=render;
    render=async function(){const result=await previousRender.apply(this,arguments);await enhancePersonProfile();return result};
  }else{
    window.addEventListener('load',()=>setTimeout(enhancePersonProfile,250));
  }
})();

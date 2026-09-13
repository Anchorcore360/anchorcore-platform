(function(){
  const accessLabel=v=>({operative:'Operative',supervisor:'Supervisor',manager:'Manager',operations_manager:'Operations Manager'}[String(v||'').toLowerCase()]||'Operative');
  function hideTopEdit(){const top=document.getElementById('editProfileBtn');if(top)top.style.display='none';}
  function renderSystemAccessControl(){
    const grid=document.getElementById('detailsGrid');if(!grid||typeof learner==='undefined'||!learner?.id||typeof db==='undefined')return;
    const current=String(learner.organisational_access_role||learner.portal_access_role||'operative').toLowerCase();
    let card=document.getElementById('systemAccessDetail');
    if(!card){
      card=document.createElement('div');card.className='detail';card.id='systemAccessDetail';
      const jobCard=[...grid.querySelectorAll('.detail')].find(x=>(x.querySelector('span')?.textContent||'').trim().toLowerCase()==='job title');
      if(jobCard)jobCard.insertAdjacentElement('afterend',card);else grid.appendChild(card);
    }
    card.innerHTML='<span>System access</span><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><select id="systemAccessSelect" aria-label="System access role" style="height:36px;min-width:170px;border:1px solid #cfd5dd;border-radius:7px;background:#fff;padding:0 9px;font:inherit;font-size:12px;font-weight:750"><option value="operative">Operative</option><option value="supervisor">Supervisor</option><option value="manager">Manager</option><option value="operations_manager">Operations Manager</option></select><button type="button" class="btn dark small" id="saveSystemAccess">Save</button></div><small id="systemAccessMsg" style="display:block;margin-top:6px;color:#667085">Controls what this person can see and manage.</small>';
    const select=card.querySelector('#systemAccessSelect'),button=card.querySelector('#saveSystemAccess'),msg=card.querySelector('#systemAccessMsg');select.value=current;
    button.onclick=async()=>{
      const role=select.value,allowed=['operative','supervisor','manager','operations_manager'];if(!allowed.includes(role))return;
      button.disabled=true;msg.textContent='Saving access…';
      const {data,error}=await db.from('profiles').update({organisational_access_role:role,portal_access_role:role,updated_at:new Date().toISOString()}).eq('id',learner.id).select('id,organisational_access_role,portal_access_role').single();
      if(error){msg.textContent=error.message||'Unable to update access.';msg.style.color='#b42318';button.disabled=false;return}
      learner.organisational_access_role=data.organisational_access_role;learner.portal_access_role=data.portal_access_role;msg.textContent='Access updated. Refreshing profile…';msg.style.color='#176b37';setTimeout(()=>location.reload(),500);
    };
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
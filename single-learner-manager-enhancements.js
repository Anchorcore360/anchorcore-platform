(function(){
  let people=[];
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  async function loadPeople(){const {data}=await db.from('profiles').select('id,full_name,email,employee_number,account_status').order('full_name');people=(data||[]).filter(p=>String(p.account_status||'active').toLowerCase()==='active')}
  function options(){return '<option value="">Select manager</option>'+people.map(p=>`<option value="${p.id}">${esc(p.full_name||p.email||p.employee_number||'Manager')}</option>`).join('')}
  async function install(){
    const form=document.getElementById('addLearnerForm');if(!form||document.getElementById('newPrimaryManager'))return;
    await loadPeople();
    const grid=form.querySelector('div[style*="grid-template-columns"]');if(!grid)return;
    const manager1=document.createElement('label');manager1.innerHTML='Line Manager (Primary)<select id="newPrimaryManager">'+options()+'</select>';
    const manager2=document.createElement('label');manager2.innerHTML='Secondary Manager/Supervisor<select id="newSecondaryManager">'+options()+'</select>';
    const photo=document.createElement('label');photo.innerHTML='Profile Picture<input id="newProfilePhoto" type="file" accept="image/*"><span id="newProfilePhotoName" style="display:block;margin-top:6px;font-size:12px;color:#667085"></span>';
    grid.append(manager1,manager2,photo);
    document.getElementById('newProfilePhoto').onchange=e=>{document.getElementById('newProfilePhotoName').textContent=e.target.files?.[0]?.name||''};
    form.addEventListener('reset',()=>setTimeout(()=>{document.getElementById('newPrimaryManager').value='';document.getElementById('newSecondaryManager').value='';document.getElementById('newProfilePhotoName').textContent=''},0));
    form.addEventListener('submit',async()=>{
      sessionStorage.setItem('rrta_new_primary_manager',document.getElementById('newPrimaryManager').value||'');
      sessionStorage.setItem('rrta_new_secondary_manager',document.getElementById('newSecondaryManager').value||'');
      const f=document.getElementById('newProfilePhoto').files?.[0];if(f){const reader=new FileReader();reader.onload=()=>sessionStorage.setItem('rrta_new_profile_photo',JSON.stringify({name:f.name,type:f.type,data:reader.result}));reader.readAsDataURL(f)}else sessionStorage.removeItem('rrta_new_profile_photo');
    },true);
  }
  const originalInvoke=window.supabase;
  async function postCreateHook(){
    const primary=sessionStorage.getItem('rrta_new_primary_manager'),secondary=sessionStorage.getItem('rrta_new_secondary_manager'),photoRaw=sessionStorage.getItem('rrta_new_profile_photo');
    if(!primary&&!secondary&&!photoRaw)return;
    setTimeout(async()=>{
      try{
        const email=document.getElementById('newEmail')?.value?.trim()?.toLowerCase();if(!email)return;
        const {data:learner}=await db.from('profiles').select('id').eq('email',email).maybeSingle();if(!learner?.id)return;
        const update={};if(primary)update.manager_1_id=primary;if(secondary)update.manager_2_id=secondary;if(Object.keys(update).length)await db.from('profiles').update(update).eq('id',learner.id);
        if(photoRaw){const p=JSON.parse(photoRaw),b64=p.data.split(',')[1],bin=atob(b64),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);const safe=p.name.replace(/[^a-zA-Z0-9._-]+/g,'_');const path=`${learner.id}/${Date.now()}-${safe}`;const {error}=await db.storage.from('learner-photos').upload(path,new Blob([bytes],{type:p.type||'image/jpeg'}));if(!error)await db.from('profiles').update({photo_url:path}).eq('id',learner.id)}
      }catch(_){}finally{sessionStorage.removeItem('rrta_new_primary_manager');sessionStorage.removeItem('rrta_new_secondary_manager');sessionStorage.removeItem('rrta_new_profile_photo')}
    },1200);
  }
  document.addEventListener('DOMContentLoaded',install);setTimeout(install,400);
  document.addEventListener('click',e=>{if(e.target?.id==='saveLearnerBtn')setTimeout(postCreateHook,700)});
})();
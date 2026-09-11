(function(){
  const css=document.createElement('style');
  css.textContent='.edit-overlay{position:fixed;inset:0;background:rgba(20,25,30,.46);display:none;align-items:center;justify-content:center;padding:24px;z-index:1000}.edit-overlay.open{display:flex}.edit-card{width:min(760px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:14px;border:1px solid #d9dee5;box-shadow:0 20px 60px rgba(0,0,0,.18);padding:22px}.edit-head{display:flex;justify-content:space-between;gap:12px;align-items:start}.edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.edit-grid label{font-size:12px;font-weight:800}.edit-grid input,.edit-grid select{width:100%;margin-top:5px;padding:10px 11px;border:1px solid #cfd5dd;border-radius:8px;font:inherit}.edit-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}.edit-photo-row{display:grid;grid-template-columns:110px 1fr;gap:16px;align-items:center;margin-top:16px;padding:14px;border:1px solid #e2e6ea;border-radius:10px;background:#fafbfc}.edit-photo-preview{width:105px;height:125px;border:1px dashed #bdc5cf;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#fff;color:#667085;font-size:12px;text-align:center}.edit-photo-preview img{width:100%;height:100%;object-fit:cover}.edit-photo-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.edit-photo-actions .small{font-size:12px}@media(max-width:650px){.edit-grid{grid-template-columns:1fr}.edit-photo-row{grid-template-columns:1fr}.edit-photo-preview{width:120px;height:140px}}';
  document.head.appendChild(css);
  let companies=[];
  let chosenPhoto=null;
  let chosenPreviewUrl=null;
  function waitForLearner(){return new Promise(resolve=>{const t=()=>{try{if(typeof learner!=='undefined'&&learner&&typeof db!=='undefined')return resolve()}catch(e){}setTimeout(t,120)};t()})}
  function e(v=''){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]))}
  async function currentPhotoUrl(){if(!learner.photo_path)return null;try{return await signed(learner.photo_path)}catch{return null}}
  async function drawPhoto(){
    const box=document.getElementById('editPhotoPreview');if(!box)return;
    if(chosenPreviewUrl){box.innerHTML=`<img src="${chosenPreviewUrl}" alt="New profile photo preview">`;return}
    const url=await currentPhotoUrl();box.innerHTML=url?`<img src="${url}" alt="Current profile photo">`:'No profile photo';
    const dl=document.getElementById('downloadExternalPhoto');if(dl)dl.style.display=learner.photo_path?'inline-flex':'none';
  }
  async function init(){
    await waitForLearner();
    const {data,error}=await db.from('external_customers').select('id,company_name').eq('active',true).order('company_name');
    if(!error)companies=data||[];
    const head=document.querySelector('.head');
    if(!head||document.getElementById('editExternalLearnerBtn'))return;
    const actionCol=head.lastElementChild;
    const edit=document.createElement('button');
    edit.id='editExternalLearnerBtn';edit.className='btn dark';edit.textContent='Edit details';edit.style.marginTop='8px';edit.style.width='100%';
    actionCol.appendChild(edit);
    const overlay=document.createElement('div');overlay.className='edit-overlay';overlay.id='externalLearnerEditOverlay';
    overlay.innerHTML=`<div class="edit-card"><div class="edit-head"><div><div class="eyebrow">External learner</div><h2 style="margin:4px 0 0">Edit details</h2></div><button type="button" class="small" id="closeExternalEdit">Close</button></div><div class="edit-photo-row"><div class="edit-photo-preview" id="editPhotoPreview">No profile photo</div><div><strong>Profile / card-order photo</strong><p class="muted" style="margin:4px 0 0;font-size:13px">Upload or replace the learner photo here. The stored original can also be downloaded again when needed for a card order or other authorised use.</p><input id="editPhotoFile" type="file" accept="image/*" style="display:none"><div class="edit-photo-actions"><button type="button" class="small" id="chooseExternalPhoto">Choose / replace photo</button><button type="button" class="small" id="downloadExternalPhoto" style="display:none">Download current photo</button></div><div id="editPhotoName" class="muted" style="font-size:12px;margin-top:7px"></div></div></div><div class="edit-grid"><label>Forename<input id="editForename"></label><label>Surname<input id="editSurname"></label><label>Date of birth<input id="editDob" type="date"></label><label>Company<select id="editCompany"><option value="">No company linked</option>${companies.map(c=>`<option value="${c.id}">${e(c.company_name)}</option>`).join('')}</select></label><label>Email<input id="editEmail" type="email"></label><label>Phone<input id="editPhone"></label></div><div class="edit-actions"><button type="button" class="btn secondary" id="cancelExternalEdit">Cancel</button><button type="button" class="btn dark" id="saveExternalEdit">Save changes</button></div></div>`;
    document.body.appendChild(overlay);
    function clearChosen(){if(chosenPreviewUrl)URL.revokeObjectURL(chosenPreviewUrl);chosenPreviewUrl=null;chosenPhoto=null;const f=document.getElementById('editPhotoFile');if(f)f.value='';const n=document.getElementById('editPhotoName');if(n)n.textContent=''}
    function fill(){editForename.value=learner.forename||'';editSurname.value=learner.surname||'';editDob.value=learner.date_of_birth||'';editEmail.value=learner.email||'';editPhone.value=learner.phone||'';editCompany.value=learner.customer_id||'';clearChosen();drawPhoto()}
    function close(){overlay.classList.remove('open');clearChosen()}
    edit.onclick=()=>{fill();overlay.classList.add('open')};closeExternalEdit.onclick=close;cancelExternalEdit.onclick=close;overlay.addEventListener('click',ev=>{if(ev.target===overlay)close()});
    chooseExternalPhoto.onclick=()=>editPhotoFile.click();
    editPhotoFile.onchange=()=>{const f=editPhotoFile.files?.[0];if(!f)return;chosenPhoto=f;if(chosenPreviewUrl)URL.revokeObjectURL(chosenPreviewUrl);chosenPreviewUrl=URL.createObjectURL(f);editPhotoName.textContent=`Selected: ${f.name}`;drawPhoto()};
    downloadExternalPhoto.onclick=async()=>{
      if(!learner.photo_path)return alert('There is no saved profile photo to download.');
      const btn=downloadExternalPhoto;btn.disabled=true;btn.textContent='Preparing…';
      try{
        const url=await signed(learner.photo_path);const response=await fetch(url);if(!response.ok)throw Error('Unable to download the stored photo.');const blob=await response.blob();const objectUrl=URL.createObjectURL(blob);const a=document.createElement('a');a.href=objectUrl;const ext=(learner.photo_path.split('.').pop()||'jpg').split('?')[0];a.download=`${(learner.full_name||'external-learner').replace(/[^a-z0-9]+/gi,'_')}_profile_photo.${ext}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
      }catch(err){alert(err.message||'Unable to download photo.')}finally{btn.disabled=false;btn.textContent='Download current photo'}
    };
    saveExternalEdit.onclick=async()=>{
      const btn=saveExternalEdit;btn.disabled=true;btn.textContent='Saving…';
      try{
        let photoPath=learner.photo_path||null;
        if(chosenPhoto){
          const safe=chosenPhoto.name.replace(/[^a-zA-Z0-9._-]+/g,'_');
          const path=`${learner.id}/photos/${Date.now()}-${safe}`;
          const {error:uploadError}=await db.storage.from('external-delegate-files').upload(path,chosenPhoto);
          if(uploadError)throw uploadError;
          photoPath=path;
        }
        const company=companies.find(c=>c.id===editCompany.value)||null;
        const payload={forename:editForename.value.trim()||null,surname:editSurname.value.trim()||null,full_name:[editForename.value.trim(),editSurname.value.trim()].filter(Boolean).join(' ')||learner.full_name,date_of_birth:editDob.value||null,customer_id:company?.id||null,company_name:company?.company_name||null,email:editEmail.value.trim()||null,phone:editPhone.value.trim()||null,photo_path:photoPath,updated_at:new Date().toISOString()};
        const {data,error}=await db.from('external_delegates').update(payload).eq('id',learner.id).select('*').single();
        if(error)throw error;
        learner=data;close();await render();setTimeout(init,50);
      }catch(err){alert(err.message||'Unable to save changes.')}finally{btn.disabled=false;btn.textContent='Save changes'}
    };
  }
  new MutationObserver(()=>{init().catch(()=>{})}).observe(document.body,{childList:true,subtree:true});
  init().catch(()=>{});
})();
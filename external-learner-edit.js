(function(){
  const css=document.createElement('style');
  css.textContent='.edit-overlay{position:fixed;inset:0;background:rgba(20,25,30,.46);display:none;align-items:center;justify-content:center;padding:24px;z-index:1000}.edit-overlay.open{display:flex}.edit-card{width:min(760px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:14px;border:1px solid #d9dee5;box-shadow:0 20px 60px rgba(0,0,0,.18);padding:22px}.edit-head{display:flex;justify-content:space-between;gap:12px;align-items:start}.edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.edit-grid label{font-size:12px;font-weight:800}.edit-grid input,.edit-grid select{width:100%;margin-top:5px;padding:10px 11px;border:1px solid #cfd5dd;border-radius:8px;font:inherit}.edit-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}@media(max-width:650px){.edit-grid{grid-template-columns:1fr}}';
  document.head.appendChild(css);
  let companies=[];
  function waitForLearner(){return new Promise(resolve=>{const t=()=>{try{if(typeof learner!=='undefined'&&learner&&typeof db!=='undefined')return resolve()}catch(e){}setTimeout(t,120)};t()})}
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
    overlay.innerHTML=`<div class="edit-card"><div class="edit-head"><div><div class="eyebrow">External learner</div><h2 style="margin:4px 0 0">Edit details</h2></div><button type="button" class="small" id="closeExternalEdit">Close</button></div><div class="edit-grid"><label>Forename<input id="editForename"></label><label>Surname<input id="editSurname"></label><label>Date of birth<input id="editDob" type="date"></label><label>Company<select id="editCompany"><option value="">No company linked</option>${companies.map(c=>`<option value="${c.id}">${String(c.company_name||'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]))}</option>`).join('')}</select></label><label>Email<input id="editEmail" type="email"></label><label>Phone<input id="editPhone"></label></div><div class="edit-actions"><button type="button" class="btn secondary" id="cancelExternalEdit">Cancel</button><button type="button" class="btn dark" id="saveExternalEdit">Save changes</button></div></div>`;
    document.body.appendChild(overlay);
    function fill(){editForename.value=learner.forename||'';editSurname.value=learner.surname||'';editDob.value=learner.date_of_birth||'';editEmail.value=learner.email||'';editPhone.value=learner.phone||'';editCompany.value=learner.customer_id||''}
    function close(){overlay.classList.remove('open')}
    edit.onclick=()=>{fill();overlay.classList.add('open')};closeExternalEdit.onclick=close;cancelExternalEdit.onclick=close;overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
    saveExternalEdit.onclick=async()=>{
      const btn=saveExternalEdit;btn.disabled=true;btn.textContent='Saving…';
      const company=companies.find(c=>c.id===editCompany.value)||null;
      const payload={forename:editForename.value.trim()||null,surname:editSurname.value.trim()||null,full_name:[editForename.value.trim(),editSurname.value.trim()].filter(Boolean).join(' ')||learner.full_name,date_of_birth:editDob.value||null,customer_id:company?.id||null,company_name:company?.company_name||null,email:editEmail.value.trim()||null,phone:editPhone.value.trim()||null,updated_at:new Date().toISOString()};
      const {data,error}=await db.from('external_delegates').update(payload).eq('id',learner.id).select('*').single();
      btn.disabled=false;btn.textContent='Save changes';
      if(error)return alert(error.message);
      learner=data;close();await render();setTimeout(init,50);
    };
  }
  new MutationObserver(()=>{init().catch(()=>{})}).observe(document.body,{childList:true,subtree:true});
  init().catch(()=>{});
})();
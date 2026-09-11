(function(){
  const style=document.createElement('style');
  style.textContent=`
    .bulk-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .bulk-panel{margin-bottom:18px}
    .bulk-drop{border:1px dashed #b8c1ca;border-radius:10px;padding:18px;background:#fafbfc;margin-top:12px}
    .bulk-drop input{display:block;margin-top:8px}
    .bulk-help{font-size:12px;color:#667085;line-height:1.5;margin-top:8px}
    .bulk-preview{margin-top:14px;overflow:auto;max-height:360px}
    .bulk-preview table{width:100%;border-collapse:collapse;font-size:12px}
    .bulk-preview th,.bulk-preview td{padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;white-space:nowrap}
    .bulk-summary{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;font-size:13px}
    .bulk-result-ok{color:#176b37;font-weight:700}.bulk-result-bad{color:#b42318;font-weight:700}.bulk-result-warn{color:#8a6100;font-weight:700}
    .new-photo-wrap{display:flex;align-items:center;gap:12px}.new-photo-preview{width:58px;height:68px;border:1px dashed #b8c1ca;border-radius:8px;background:#f7f8fa;display:grid;place-items:center;overflow:hidden;color:#667085;font-size:10px;text-align:center}.new-photo-preview img{width:100%;height:100%;object-fit:cover}.new-photo-wrap input{max-width:240px}
  `;
  document.head.appendChild(style);

  function loadXlsx(){
    if(window.XLSX)return Promise.resolve();
    return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=resolve;s.onerror=()=>reject(new Error('Unable to load spreadsheet reader.'));document.head.appendChild(s)})
  }
  function val(row,names){for(const n of names){const k=Object.keys(row).find(x=>x.trim().toLowerCase()===n);if(k!=null&&row[k]!=null)return String(row[k]).trim()}return ''}
  function randomPassword(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#';let s='';crypto.getRandomValues(new Uint32Array(14)).forEach(n=>s+=chars[n%chars.length]);return s}
  function normalise(row){return {forename:val(row,['forename','first name','firstname']),surname:val(row,['surname','last name','lastname']),email:val(row,['email','email address','work email']).toLowerCase(),employee_number:val(row,['employee number','employee no','employee no.','payroll number']),job_title:val(row,['job title','role']),organisation:val(row,['organisation','organization','company']),manager:val(row,['line manager','manager','line manager name']),manager_email:val(row,['line manager email','manager email']).toLowerCase(),password:val(row,['temporary password','password'])||randomPassword()}}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  let rows=[],people=[];

  function managerFor(r){
    const byEmail=r.manager_email&&people.find(p=>String(p.email||'').toLowerCase()===r.manager_email);
    if(byEmail)return byEmail;
    const needle=String(r.manager||'').trim().toLowerCase();if(!needle)return null;
    return people.find(p=>String(p.employee_number||'').trim().toLowerCase()===needle)||people.find(p=>String(p.full_name||'').trim().toLowerCase()===needle)||null;
  }
  function managerLabel(r){const m=managerFor(r);if(m)return m.full_name||m.email||m.employee_number||'Matched';if(r.manager||r.manager_email)return 'Not Matched';return '—'}
  async function loadPeople(){const {data}=await db.from('profiles').select('id,full_name,email,employee_number,account_status,job_title,organisation').order('full_name');people=(data||[]).filter(p=>String(p.account_status||'active').toLowerCase()==='active')}

  async function installSingleLearnerEnhancements(){
    const form=document.getElementById('addLearnerForm');if(!form||document.getElementById('newManager1'))return;
    await loadPeople();
    const grid=form.querySelector('div[style*="grid-template-columns"]');if(!grid)return;
    const managerLabel=document.createElement('label');managerLabel.innerHTML=`Line Manager (Primary)<select id="newManager1"><option value="">Select Line Manager</option>${people.map(p=>`<option value="${p.id}">${esc(p.full_name||p.email||'Profile')}${p.job_title?' · '+esc(p.job_title):''}</option>`).join('')}</select>`;
    const photoLabel=document.createElement('label');photoLabel.innerHTML=`Profile Picture<div class="new-photo-wrap"><div class="new-photo-preview" id="newPhotoPreview">Optional</div><input id="newProfilePhoto" type="file" accept="image/jpeg,image/png,image/webp"></div>`;
    grid.appendChild(managerLabel);grid.appendChild(photoLabel);
    const managerSelect=document.getElementById('newManager1');managerSelect.style.cssText='width:100%;padding:12px 14px;border:1px solid #cfd4da;border-radius:8px;background:#fff;font:inherit;margin-top:6px';
    const photo=document.getElementById('newProfilePhoto');photo.onchange=()=>{const f=photo.files?.[0],box=document.getElementById('newPhotoPreview');if(!f){box.innerHTML='Optional';return}if(!f.type.startsWith('image/')){photo.value='';box.innerHTML='Optional';return alert('Please choose an image file.')}const url=URL.createObjectURL(f);box.innerHTML=`<img src="${url}" alt="Profile Preview">`};
    form.addEventListener('submit',handleEnhancedSingleCreate,true);
  }

  async function handleEnhancedSingleCreate(e){
    e.preventDefault();e.stopImmediatePropagation();
    const btn=document.getElementById('saveLearnerBtn'),msg=document.getElementById('learnerFormMessage');
    const forename=document.getElementById('newForename').value.trim(),surname=document.getElementById('newSurname').value.trim();
    const payload={forename,surname,full_name:`${forename} ${surname}`.trim(),email:document.getElementById('newEmail').value.trim().toLowerCase(),employee_number:document.getElementById('newEmployeeNumber').value.trim(),job_title:document.getElementById('newJobTitle').value.trim(),organisation:document.getElementById('newOrganisation').value.trim(),password:document.getElementById('newPassword').value};
    const managerId=document.getElementById('newManager1')?.value||null,photo=document.getElementById('newProfilePhoto')?.files?.[0]||null;
    btn.disabled=true;btn.textContent='Creating...';msg.classList.add('hidden');
    try{
      const {data,error}=await db.functions.invoke('create-learner',{body:payload});if(error)throw new Error(error.message||'Unable to create learner.');if(data?.error)throw new Error(data.error);
      const learnerId=data?.user?.id;if(!learnerId)throw new Error('Learner account was created but the learner ID was not returned.');
      if(managerId){const {error:me}=await db.from('profiles').update({manager_1_id:managerId}).eq('id',learnerId);if(me)throw new Error(`Learner created, but Line Manager could not be saved: ${me.message}`)}
      if(photo){
        const ext=(photo.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';const path=`${learnerId}/profile-${Date.now()}.${ext}`;
        const {error:ue}=await db.storage.from('learner-photos').upload(path,photo,{upsert:false,contentType:photo.type||undefined});if(ue)throw new Error(`Learner created, but profile picture could not be uploaded: ${ue.message}`);
        const {error:pe}=await db.from('profiles').update({photo_path:path}).eq('id',learnerId);if(pe)throw new Error(`Profile picture uploaded, but could not be linked to the learner: ${pe.message}`);
      }
      formResetAfterCreate();if(typeof loadLearnerData==='function')await loadLearnerData();alert('Learner created successfully.');
    }catch(err){msg.textContent=err.message||'Unable to create learner.';msg.style.color='#b20d1c';msg.classList.remove('hidden')}
    finally{btn.disabled=false;btn.textContent='Create Learner'}
  }
  function formResetAfterCreate(){document.getElementById('addLearnerForm')?.reset();const p=document.getElementById('newPhotoPreview');if(p)p.innerHTML='Optional';document.getElementById('addLearnerPanel')?.classList.add('hidden')}

  function install(){
    const view=document.getElementById('view-learners');if(!view)return;
    installSingleLearnerEnhancements().catch(()=>{});
    if(document.getElementById('bulkLearnerBtn'))return;
    const head=view.querySelector('.page-head');const addBtn=document.getElementById('addLearnerBtn');if(!head||!addBtn)return;
    let actions=head.querySelector('.bulk-actions');if(!actions){actions=document.createElement('div');actions.className='bulk-actions';addBtn.parentNode.insertBefore(actions,addBtn);actions.appendChild(addBtn)}
    const bulk=document.createElement('button');bulk.id='bulkLearnerBtn';bulk.type='button';bulk.className='btn secondary';bulk.textContent='Bulk Upload';actions.appendChild(bulk);
    const panel=document.createElement('div');panel.id='bulkLearnerPanel';panel.className='panel bulk-panel hidden';panel.innerHTML=`<div class="panel-head"><div><h2>Bulk Upload Learners</h2><p class="muted">Upload an Excel or CSV file to create multiple learner accounts at once.</p></div><button class="btn secondary" type="button" id="downloadLearnerTemplate">Download Template</button></div><div class="bulk-drop"><strong>Spreadsheet Columns</strong><div class="bulk-help">Required: Forename, Surname, Email Address. Optional: Employee Number, Job Title, Organisation, <strong>Line Manager</strong>, Line Manager Email, Temporary Password. The manager must already exist in RRTA for the system to link them automatically. Use the manager's email for the most reliable match.</div><input id="bulkLearnerFile" type="file" accept=".xlsx,.xls,.csv"></div><div id="bulkPreview" class="bulk-preview"></div><div class="bulk-actions" style="margin-top:14px"><button class="btn dark hidden" id="runBulkUpload" type="button">Create Learners</button><button class="btn secondary" id="cancelBulkUpload" type="button">Cancel</button></div><div id="bulkMessage" class="bulk-help"></div>`;
    const addPanel=document.getElementById('addLearnerPanel');view.insertBefore(panel,addPanel||view.children[1]);
    bulk.onclick=async()=>{document.getElementById('addLearnerPanel')?.classList.add('hidden');panel.classList.toggle('hidden');if(!panel.classList.contains('hidden'))await loadPeople()};
    document.getElementById('cancelBulkUpload').onclick=()=>{panel.classList.add('hidden');rows=[]};
    document.getElementById('bulkLearnerFile').onchange=parseFile;
    document.getElementById('runBulkUpload').onclick=uploadRows;
    document.getElementById('downloadLearnerTemplate').onclick=downloadTemplate;
  }
  async function downloadTemplate(){await loadXlsx();const sample=[{'Forename':'Jane','Surname':'Smith','Email Address':'jane.smith@example.com','Employee Number':'123','Job Title':'Cabler','Organisation':'RRT','Line Manager':'John Irvine','Line Manager Email':'john.irvine@rapidresponsetelecoms.com','Temporary Password':''}];const ws=XLSX.utils.json_to_sheet(sample);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Learners');XLSX.writeFile(wb,'RRTA_Learner_Bulk_Upload_Template.xlsx')}
  async function parseFile(e){const file=e.target.files?.[0];if(!file)return;const msg=document.getElementById('bulkMessage');msg.textContent='Reading spreadsheet…';try{await Promise.all([loadXlsx(),loadPeople()]);const data=await file.arrayBuffer();const wb=XLSX.read(data,{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];rows=XLSX.utils.sheet_to_json(ws,{defval:''}).map(normalise).filter(r=>r.forename||r.surname||r.email);renderPreview();msg.textContent=`${rows.length} row${rows.length===1?'':'s'} ready to review.`}catch(err){rows=[];msg.textContent=err.message||'Unable to read spreadsheet.';document.getElementById('runBulkUpload').classList.add('hidden')}}
  function renderPreview(){const box=document.getElementById('bulkPreview'),btn=document.getElementById('runBulkUpload');if(!rows.length){box.innerHTML='';btn.classList.add('hidden');return}box.innerHTML=`<table><thead><tr><th>Forename</th><th>Surname</th><th>Email</th><th>Employee No.</th><th>Job Title</th><th>Organisation</th><th>Line Manager</th><th>Validation</th></tr></thead><tbody>${rows.map(r=>{const errors=[];if(!r.forename)errors.push('Forename');if(!r.surname)errors.push('Surname');if(!r.email||!r.email.includes('@'))errors.push('Email');const unresolved=(r.manager||r.manager_email)&&!managerFor(r);return `<tr><td>${esc(r.forename)}</td><td>${esc(r.surname)}</td><td>${esc(r.email)}</td><td>${esc(r.employee_number)}</td><td>${esc(r.job_title)}</td><td>${esc(r.organisation)}</td><td class="${unresolved?'bulk-result-warn':''}">${esc(managerLabel(r))}</td><td class="${errors.length?'bulk-result-bad':unresolved?'bulk-result-warn':'bulk-result-ok'}">${errors.length?'Missing/invalid '+errors.join(', '):unresolved?'Ready · manager not matched':'Ready'}</td></tr>`}).join('')}</tbody></table>`;btn.classList.toggle('hidden',rows.some(r=>!r.forename||!r.surname||!r.email||!r.email.includes('@')))}
  async function uploadRows(){const btn=document.getElementById('runBulkUpload'),msg=document.getElementById('bulkMessage');btn.disabled=true;let ok=0,bad=0;const results=[];for(let i=0;i<rows.length;i++){const r=rows[i],manager=managerFor(r);msg.textContent=`Creating learner ${i+1} of ${rows.length}: ${r.forename} ${r.surname}…`;try{const {data,error}=await db.functions.invoke('create-learner',{body:r});if(error)throw new Error(error.message||'Unable to create learner');if(data?.error)throw new Error(data.error);const learnerId=data?.user?.id;if(learnerId&&manager?.id){const {error:me}=await db.from('profiles').update({manager_1_id:manager.id}).eq('id',learnerId);if(me)throw new Error(`Learner created, but manager could not be linked: ${me.message}`)}ok++;results.push({...r,result:manager?'Created · manager linked':(r.manager||r.manager_email?'Created · manager not matched':'Created')})}catch(err){bad++;results.push({...r,result:err.message||'Failed'})}}
    msg.innerHTML=`<div class="bulk-summary"><span class="bulk-result-ok">${ok} created</span><span class="bulk-result-bad">${bad} failed</span></div>`;
    document.getElementById('bulkPreview').innerHTML=`<table><thead><tr><th>Learner</th><th>Email</th><th>Line Manager</th><th>Temporary Password</th><th>Result</th></tr></thead><tbody>${results.map(r=>`<tr><td>${esc(r.forename+' '+r.surname)}</td><td>${esc(r.email)}</td><td>${esc(managerLabel(r))}</td><td>${esc(r.password)}</td><td class="${r.result.startsWith('Created')?'bulk-result-ok':'bulk-result-bad'}">${esc(r.result)}</td></tr>`).join('')}</tbody></table>`;
    btn.disabled=false;btn.classList.add('hidden');if(typeof loadLearnerData==='function')await loadLearnerData();
  }
  document.addEventListener('DOMContentLoaded',install);setTimeout(install,300);
})();
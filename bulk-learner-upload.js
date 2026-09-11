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
    .bulk-result-ok{color:#176b37;font-weight:700}.bulk-result-bad{color:#b42318;font-weight:700}
  `;
  document.head.appendChild(style);

  function loadXlsx(){
    if(window.XLSX)return Promise.resolve();
    return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=resolve;s.onerror=()=>reject(new Error('Unable to load spreadsheet reader.'));document.head.appendChild(s)})
  }
  function val(row,names){for(const n of names){const k=Object.keys(row).find(x=>x.trim().toLowerCase()===n);if(k!=null&&row[k]!=null)return String(row[k]).trim()}return ''}
  function randomPassword(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#';let s='';crypto.getRandomValues(new Uint32Array(14)).forEach(n=>s+=chars[n%chars.length]);return s}
  function normalise(row){return {forename:val(row,['forename','first name','firstname']),surname:val(row,['surname','last name','lastname']),email:val(row,['email','email address','work email']).toLowerCase(),employee_number:val(row,['employee number','employee no','employee no.','payroll number']),job_title:val(row,['job title','role']),organisation:val(row,['organisation','organization','company']),password:val(row,['temporary password','password'])||randomPassword()}}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  let rows=[];

  function install(){
    const view=document.getElementById('view-learners');if(!view||document.getElementById('bulkLearnerBtn'))return;
    const head=view.querySelector('.page-head');const addBtn=document.getElementById('addLearnerBtn');if(!head||!addBtn)return;
    let actions=head.querySelector('.bulk-actions');if(!actions){actions=document.createElement('div');actions.className='bulk-actions';addBtn.parentNode.insertBefore(actions,addBtn);actions.appendChild(addBtn)}
    const bulk=document.createElement('button');bulk.id='bulkLearnerBtn';bulk.type='button';bulk.className='btn secondary';bulk.textContent='Bulk Upload';actions.appendChild(bulk);
    const panel=document.createElement('div');panel.id='bulkLearnerPanel';panel.className='panel bulk-panel hidden';panel.innerHTML=`<div class="panel-head"><div><h2>Bulk Upload Learners</h2><p class="muted">Upload an Excel or CSV file to create multiple learner accounts at once.</p></div><button class="btn secondary" type="button" id="downloadLearnerTemplate">Download Template</button></div><div class="bulk-drop"><strong>Spreadsheet Columns</strong><div class="bulk-help">Required: Forename, Surname, Email Address. Optional: Employee Number, Job Title, Organisation, Temporary Password. If no password is supplied, the system generates one for that learner.</div><input id="bulkLearnerFile" type="file" accept=".xlsx,.xls,.csv"></div><div id="bulkPreview" class="bulk-preview"></div><div class="bulk-actions" style="margin-top:14px"><button class="btn dark hidden" id="runBulkUpload" type="button">Create Learners</button><button class="btn secondary" id="cancelBulkUpload" type="button">Cancel</button></div><div id="bulkMessage" class="bulk-help"></div>`;
    const addPanel=document.getElementById('addLearnerPanel');view.insertBefore(panel,addPanel||view.children[1]);
    bulk.onclick=()=>{document.getElementById('addLearnerPanel')?.classList.add('hidden');panel.classList.toggle('hidden')};
    document.getElementById('cancelBulkUpload').onclick=()=>{panel.classList.add('hidden');rows=[]};
    document.getElementById('bulkLearnerFile').onchange=parseFile;
    document.getElementById('runBulkUpload').onclick=uploadRows;
    document.getElementById('downloadLearnerTemplate').onclick=downloadTemplate;
  }
  async function downloadTemplate(){await loadXlsx();const sample=[{'Forename':'Jane','Surname':'Smith','Email Address':'jane.smith@example.com','Employee Number':'123','Job Title':'Cabler','Organisation':'RRT','Temporary Password':''}];const ws=XLSX.utils.json_to_sheet(sample);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Learners');XLSX.writeFile(wb,'RRTA_Learner_Bulk_Upload_Template.xlsx')}
  async function parseFile(e){const file=e.target.files?.[0];if(!file)return;const msg=document.getElementById('bulkMessage');msg.textContent='Reading spreadsheet…';try{await loadXlsx();const data=await file.arrayBuffer();const wb=XLSX.read(data,{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];rows=XLSX.utils.sheet_to_json(ws,{defval:''}).map(normalise).filter(r=>r.forename||r.surname||r.email);renderPreview();msg.textContent=`${rows.length} row${rows.length===1?'':'s'} ready to review.`}catch(err){rows=[];msg.textContent=err.message||'Unable to read spreadsheet.';document.getElementById('runBulkUpload').classList.add('hidden')}}
  function renderPreview(){const box=document.getElementById('bulkPreview'),btn=document.getElementById('runBulkUpload');if(!rows.length){box.innerHTML='';btn.classList.add('hidden');return}box.innerHTML=`<table><thead><tr><th>Forename</th><th>Surname</th><th>Email</th><th>Employee No.</th><th>Job Title</th><th>Organisation</th><th>Validation</th></tr></thead><tbody>${rows.map((r,i)=>{const errors=[];if(!r.forename)errors.push('Forename');if(!r.surname)errors.push('Surname');if(!r.email||!r.email.includes('@'))errors.push('Email');return `<tr><td>${esc(r.forename)}</td><td>${esc(r.surname)}</td><td>${esc(r.email)}</td><td>${esc(r.employee_number)}</td><td>${esc(r.job_title)}</td><td>${esc(r.organisation)}</td><td class="${errors.length?'bulk-result-bad':'bulk-result-ok'}">${errors.length?'Missing/invalid '+errors.join(', '):'Ready'}</td></tr>`}).join('')}</tbody></table>`;btn.classList.toggle('hidden',rows.some(r=>!r.forename||!r.surname||!r.email||!r.email.includes('@')))}
  async function uploadRows(){const btn=document.getElementById('runBulkUpload'),msg=document.getElementById('bulkMessage');btn.disabled=true;let ok=0,bad=0;const results=[];for(let i=0;i<rows.length;i++){const r=rows[i];msg.textContent=`Creating learner ${i+1} of ${rows.length}: ${r.forename} ${r.surname}…`;try{const {data,error}=await db.functions.invoke('create-learner',{body:r});if(error)throw new Error(error.message||'Unable to create learner');if(data?.error)throw new Error(data.error);ok++;results.push({...r,result:'Created'})}catch(err){bad++;results.push({...r,result:err.message||'Failed'})}}
    msg.innerHTML=`<div class="bulk-summary"><span class="bulk-result-ok">${ok} created</span><span class="bulk-result-bad">${bad} failed</span></div>`;
    document.getElementById('bulkPreview').innerHTML=`<table><thead><tr><th>Learner</th><th>Email</th><th>Temporary Password</th><th>Result</th></tr></thead><tbody>${results.map(r=>`<tr><td>${esc(r.forename+' '+r.surname)}</td><td>${esc(r.email)}</td><td>${esc(r.password)}</td><td class="${r.result==='Created'?'bulk-result-ok':'bulk-result-bad'}">${esc(r.result)}</td></tr>`).join('')}</tbody></table>`;
    btn.disabled=false;btn.classList.add('hidden');if(typeof loadLearnerData==='function')await loadLearnerData();
  }
  document.addEventListener('DOMContentLoaded',install);setTimeout(install,300);
})();
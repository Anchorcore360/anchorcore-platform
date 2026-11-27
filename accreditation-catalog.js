let accreditationCatalog=[];

async function loadAccreditationCatalog(){
  if(accreditationCatalog.length)return accreditationCatalog;
  const {data,error}=await db.from('accreditation_catalog')
    .select('id,module_code,description,deliverable_by_rrta,active,source')
    .eq('active',true)
    .order('module_code');
  if(error)throw error;
  accreditationCatalog=window.RRTAQualificationMaster?window.RRTAQualificationMaster.options(data||[]):(data||[]).map(x=>({...x,catalogId:x.id}));
  return accreditationCatalog;
}

function catalogOptionText(item){
  return item.label||`${item.module_code} — ${item.description}`;
}

function catalogOptions(selectedId=null,filter=''){
 const q=String(filter||'').trim().toLowerCase(),groups=new Map();
 for(const item of accreditationCatalog){
 const category=item.entry?.category||'Other qualifications';
 const label=category.replace(/^\d+\s*/,'');
 const hay=[item.module_code,item.description,item.label,category,...(item.entry?.aliases||[])].join(' ').toLowerCase();
 if(q&&!q.split(/\s+/).every(word=>hay.includes(word))&&String(item.id)!==String(selectedId))continue;
 if(!groups.has(label))groups.set(label,[]);groups.get(label).push(item);
 }
 return '<option value="">Select accreditation / course…</option>'+[...groups].map(([label,rows])=>'<optgroup label="'+esc(label)+'">'+rows.map(item=>'<option value="'+esc(item.id)+'" '+(String(selectedId)===String(item.id)?'selected':'')+'>'+esc(catalogOptionText(item))+'</option>').join('')+'</optgroup>').join('');
}

function findExistingCatalogItem(existing){
  if(!existing)return null;
  const matched=accreditationCatalog.find(x=>x.entry&&window.RRTAQualificationMaster.matches(x.entry,existing.accreditation_name));
  if(matched)return matched;
  const legacy={id:'legacy:'+existing.id,catalogId:existing.accreditation_catalog_id??null,module_code:existing.accreditation_name||'Uncatalogued',description:existing.accreditation_name||'Uncatalogued',label:(existing.accreditation_name||'Uncatalogued')+' (existing record)'};
  accreditationCatalog=accreditationCatalog.filter(x=>x.id!==legacy.id);accreditationCatalog.push(legacy);return legacy;
}

function accreditationDbStatus(expiry){
  const state=accreditationStatus(expiry);
  if(state.cls==='expired')return 'expired';
  if(state.cls==='expiring')return 'expiring';
  return 'current';
}

function cleanEvidenceName(name){return String(name||'Certificate').split('/').pop().replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i,'').replace(/^\d{13}-/,'').replace(/_/g,' ')}
function profileEvidenceFiles(existing,current){
 const matching=a=>String(a.id)===String(existing.id)||(existing.accreditation_catalog_id!=null&&String(a.accreditation_catalog_id)===String(existing.accreditation_catalog_id))|| (current?.entry&&window.RRTAQualificationMaster.matches(current.entry,a.accreditation_name))||String(a.accreditation_name||'').trim().toLowerCase()===String(existing.accreditation_name||'').trim().toLowerCase();
 const records=[existing,...accreditations.filter(a=>String(a.id)!==String(existing.id)&&matching(a))].sort((a,b)=>String(a.id)===String(existing.id)?-1:String(b.id)===String(existing.id)?1:String(b.issue_date||'').localeCompare(String(a.issue_date||'')));
 const today=new Date().toISOString().slice(0,10),eligible=records.filter(a=>!a.superseded_by&&(!a.issue_date||a.issue_date<=today)&&a.expiry_date&&a.expiry_date>=today),primary=eligible.filter(a=>a.primary_selected_at).sort((a,b)=>String(b.primary_selected_at).localeCompare(String(a.primary_selected_at)))[0]||eligible.sort((a,b)=>String(b.issue_date||'').localeCompare(String(a.issue_date||''))||String(b.created_at||'').localeCompare(String(a.created_at||''))||String(b.id).localeCompare(String(a.id)))[0]||records.filter(a=>!a.superseded_by&&(!a.issue_date||a.issue_date<=today)).sort((a,b)=>String(b.issue_date||'').localeCompare(String(a.issue_date||''))||String(b.created_at||'').localeCompare(String(a.created_at||''))||String(b.id).localeCompare(String(a.id)))[0];
 const files=[];for(const a of records){if(a.certificate_url)files.push({a,path:a.certificate_url,name:cleanEvidenceName(a.certificate_url),kind:a===primary?'Primary certificate':'Previous / legacy certificate',main:true});for(const d of a.supporting_documents||[])if(d.path)files.push({a,path:d.path,name:cleanEvidenceName(d.name||d.path),kind:d.kind||'Additional evidence'})}
 return {records,files,primary}
}
function mountProfileEvidence(existing,current){
 const host=document.getElementById('profileAccEvidence');if(!host)return;
 const {records,files,primary}=profileEvidenceFiles(existing,current);const today=new Date().toISOString().slice(0,10);const canPrimary=f=>f.main&&f.a!==primary&&!f.a.superseded_by&&f.a.issue_date&&f.a.issue_date<=today&&f.a.expiry_date&&f.a.expiry_date>=today;
 host.innerHTML='<div style="font-weight:700;margin-bottom:6px">Files ('+files.length+')</div>'+(files.length?'<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#eef0f3"><th>Document</th><th>Type</th><th>Expiry</th><th>Actions</th></tr></thead><tbody>'+files.map((f,j)=>'<tr><td style="overflow-wrap:anywhere">'+esc(f.name)+'</td><td>'+esc(f.kind)+'</td><td>'+esc(fmt(f.a.expiry_date))+'</td><td style="white-space:nowrap"><button type="button" class="mini-btn" data-evidence-index="'+j+'" data-evidence-mode="view">View</button> <button type="button" class="mini-btn" data-evidence-index="'+j+'" data-evidence-mode="download">Download</button> '+(canPrimary(f)?'<button type="button" class="mini-btn" data-primary-index="'+j+'">Set as primary</button>':'')+'</td></tr>').join('')+'</tbody></table></div>':'<p class="muted">No files linked.</p>')+'<details style="margin-top:10px"><summary style="cursor:pointer;font-weight:700">+ Add supporting document</summary><div class="form-grid" style="margin-top:8px"><label>Accreditation record<select id="profileEvidenceTarget">'+records.map(a=>'<option value="'+esc(a.id)+'" '+(String(a.id)===String(existing.id)?'selected':'')+'>'+esc((String(a.id)===String(existing.id)?'Selected':'Previous')+' · '+(a.certificate_number||'No number')+' · '+(a.expiry_date?fmt(a.expiry_date):'No expiry'))+'</option>').join('')+'</select></label><label>Document type<select id="profileEvidenceKind">'+['Additional evidence','Legacy evidence','Certificate','Card front','Card back'].map(k=>'<option>'+k+'</option>').join('')+'</select></label><label style="grid-column:1/-1">File<input type="file" id="profileEvidenceFile" accept=".pdf,.jpg,.jpeg,.png,.webp"></label></div><button class="btn secondary small" type="button" id="profileEvidenceUpload">Attach file</button><p class="muted" id="profileEvidenceFeedback" role="status"></p></details>';
 host.querySelectorAll('th,td').forEach(c=>{c.style.padding='5px 6px';c.style.textAlign='left';c.style.borderBottom='1px solid #dfe3e7'});
 host.querySelectorAll('[data-evidence-index]').forEach(b=>b.onclick=async()=>{const f=files[Number(b.dataset.evidenceIndex)],w=window.open('about:blank','_blank');if(w)w.opener=null;try{const result=await db.storage.from('learner-documents').createSignedUrl(f.path,300,b.dataset.evidenceMode==='download'?{download:f.name}:{});if(result.error||!result.data?.signedUrl)throw Error(result.error?.message||'File unavailable');if(w)w.location.href=result.data.signedUrl;else alert('Allow pop-ups to open evidence.')}catch(e){if(w)w.close();alert(e.message)}});
 host.querySelectorAll('[data-primary-index]').forEach(b=>b.onclick=async()=>{const f=files[Number(b.dataset.primaryIndex)];if(!canPrimary(f)||!confirm('Set this in-date certificate as primary? Unsaved edits will be discarded.'))return;b.disabled=true;try{const result=await db.rpc('select_primary_accreditation',{p_id:f.a.id});if(result.error)throw result.error;document.getElementById('modalRoot').innerHTML='';await refresh();const a=accreditations.find(a=>String(a.id)===String(f.a.id));if(a)await openAccModal(a)}catch(e){alert(e.message);b.disabled=false}});
 const add=host.querySelector('#profileEvidenceUpload');add.onclick=async()=>{const a=records.find(a=>String(a.id)===host.querySelector('#profileEvidenceTarget').value),f=host.querySelector('#profileEvidenceFile').files[0],kind=host.querySelector('#profileEvidenceKind').value,msg=host.querySelector('#profileEvidenceFeedback');if(!a||!f){msg.textContent='Choose an accreditation and file.';return}if(!/\.(pdf|jpe?g|png|webp)$/i.test(f.name)||f.size>20*1024*1024){msg.textContent='Choose a PDF or image up to 20 MB.';return}
 if(!confirm('Attach this supporting document now? This saves the file independently of other edits.'))return;
 const owner=a.learner_id||a.person_id;if(!owner){msg.textContent='Accreditation owner not found.';return}const path=owner+'/accreditations/'+a.id+'/'+crypto.randomUUID()+'-'+f.name.replace(/[^a-zA-Z0-9._-]/g,'_'),bucket=db.storage.from('learner-documents');let stored=false;add.disabled=true;const submit=host.closest('form')?.querySelector('[type=submit]');if(submit)submit.disabled=true;msg.textContent='Uploading…';
 try{const up=await bucket.upload(path,f,{upsert:false});if(up.error)throw up.error;stored=true;const result=await db.rpc('append_accreditation_document',{p_id:a.id,p_path:path,p_kind:kind,p_name:f.name});if(result.error)throw result.error;stored=false;a.supporting_documents=[...(a.supporting_documents||[]),{path,name:f.name,kind}];mountProfileEvidence(existing,current);const feedback=host.querySelector('#profileEvidenceFeedback');if(feedback)feedback.textContent='Supporting document saved.';void renderAccreditationRecords().catch(console.warn)}catch(e){if(stored)await bucket.remove([path]);msg.textContent=e.message||'Unable to attach document';add.disabled=false}finally{if(submit)submit.disabled=false}};
}

openAccModal=async function(existing=null){
  try{await loadAccreditationCatalog();}
  catch(err){alert(err.message||'Unable to load accreditation catalogue.');return;}
  const current=findExistingCatalogItem(existing);
  modal(existing?'Edit accreditation':'Add accreditation',`<div class="form-grid compact-accreditation-editor">
    <label style="grid-column:1/-1">Search course / accreditation
      <input id="catalogSearch" type="search" placeholder="Search by code, name or category (e.g. NRSWA)">
    </label>
    <label style="grid-column:1/-1">Accreditation / course
      <select id="catalogSelect" name="catalog_id" required>${catalogOptions(current?.id||null)}</select>
    </label>
    <label style="grid-column:1/-1">Description
      <textarea id="catalogDescription" rows="1" readonly placeholder="Select an accreditation above to see the full description.">${esc(current?.description||'')}</textarea>
    </label>
    <label>Awarding body<input name="awarding" value="${esc(existing?.awarding_body||'')}"></label>
    <label>Certificate number<input name="number" value="${esc(existing?.certificate_number||'')}"></label>
    <label>Issue date<input type="date" name="issue" value="${existing?.issue_date||''}"></label>
    <label>Expiry date<input type="date" name="expiry" value="${existing?.expiry_date||''}"></label>
    ${existing?'<div id="profileAccEvidence" style="grid-column:1/-1"></div>':'<label style="grid-column:1/-1">Evidence / certificate file<input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.webp"></label>'}
  </div>`,async f=>{
    const catalogId=String(f.get('catalog_id')||'');
    const selected=accreditationCatalog.find(x=>String(x.id)===catalogId);
    if(!selected)throw new Error('Please select an accreditation or course from the catalogue.');
    let path=existing?.certificate_url||null;
    let uploadedNewFile=false;
    const file=f.get('file');
    if(file&&file.size){
      path=`${learnerId}/accreditations/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
      const {error}=await db.storage.from('learner-documents').upload(path,file);
      if(error)throw error;
      uploadedNewFile=true;
    }
    const payload={
      learner_id:learnerId,
      accreditation_catalog_id:existing&&String(current?.id)===catalogId?existing.accreditation_catalog_id??null:selected.catalogId??null,
      accreditation_name:existing&&String(current?.id)===catalogId?existing.accreditation_name:selected.module_code,
      awarding_body:f.get('awarding').trim()||null,
      certificate_number:f.get('number').trim()||null,
      status:accreditationDbStatus(f.get('expiry')||null),
      issue_date:f.get('issue')||null,
      expiry_date:f.get('expiry')||null,
      certificate_url:path
    };
    const q=existing?db.from('accreditations').update(payload).eq('id',existing.id):db.from('accreditations').insert(payload);
    const {error}=await q;
    if(error){
      if(uploadedNewFile&&path)await db.storage.from('learner-documents').remove([path]);
      throw error;
    }
  });

  const select=document.getElementById('catalogSelect');
  const description=document.getElementById('catalogDescription');
  const search=document.getElementById('catalogSearch');
  const updateDescription=()=>{
    const selected=accreditationCatalog.find(x=>String(x.id)===String(select.value));
    description.value=selected?.description||'';
  };
  select.addEventListener('change',updateDescription);
  search.addEventListener('input',()=>{
    const selected=select.value;
    select.innerHTML=catalogOptions(selected,search.value);
    if(selected&&[...select.options].some(o=>o.value===selected))select.value=selected;
    updateDescription();
  });
  const selectLabel=select.closest('label'),searchLabel=search.closest('label');if(selectLabel&&searchLabel){searchLabel.after(selectLabel);selectLabel.style.order='-1';searchLabel.style.order='-2'}
  updateDescription();
  if(existing)mountProfileEvidence(existing,current);
};

document.querySelectorAll('[data-open-modal="accreditation"]').forEach(btn=>btn.onclick=()=>openAccModal());

// Accreditations always use the compact list layout.
(function installAccreditationListLayout(){
  const list=document.getElementById('accreditationList');
  if(list)list.classList.remove('accreditation-grid');
  document.getElementById('accreditationViewToggle')?.remove();
  try{localStorage.removeItem('rrtaAccreditationView')}catch(e){}
})();

// NOPS catalogue integration enabled.

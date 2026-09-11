let accreditationCatalog=[];

async function loadAccreditationCatalog(){
  if(accreditationCatalog.length)return accreditationCatalog;
  const {data,error}=await db.from('accreditation_catalog')
    .select('id,module_code,description,deliverable_by_rrta,active')
    .eq('active',true)
    .order('module_code');
  if(error)throw error;
  accreditationCatalog=data||[];
  return accreditationCatalog;
}

function catalogOptionText(item){
  return `${item.module_code} — ${item.description}`;
}

function catalogOptions(selectedId=null,filter=''){
  const q=String(filter||'').trim().toLowerCase();
  const list=accreditationCatalog.filter(item=>{
    if(!q)return true;
    return `${item.module_code} ${item.description}`.toLowerCase().includes(q);
  });
  return '<option value="">Select accreditation / course…</option>'+list.map(item=>`<option value="${item.id}" ${String(selectedId)===String(item.id)?'selected':''}>${esc(catalogOptionText(item))}</option>`).join('');
}

function findExistingCatalogItem(existing){
  if(!existing)return null;
  if(existing.accreditation_catalog_id){
    const linked=accreditationCatalog.find(x=>String(x.id)===String(existing.accreditation_catalog_id));
    if(linked)return linked;
  }
  return accreditationCatalog.find(x=>String(x.module_code).toLowerCase()===String(existing.accreditation_name||'').toLowerCase())||null;
}

openAccModal=async function(existing=null){
  try{await loadAccreditationCatalog();}
  catch(err){alert(err.message||'Unable to load accreditation catalogue.');return;}
  const current=findExistingCatalogItem(existing);
  modal(existing?'Edit accreditation':'Add accreditation',`<div class="form-grid">
    <label style="grid-column:1/-1">Search course / accreditation
      <input id="catalogSearch" type="search" placeholder="Type code or description, e.g. SA006 or confined space">
    </label>
    <label style="grid-column:1/-1">Accreditation / course
      <select id="catalogSelect" name="catalog_id" required>${catalogOptions(current?.id||null)}</select>
    </label>
    <label style="grid-column:1/-1">Description
      <textarea id="catalogDescription" rows="3" readonly placeholder="Select an accreditation above to see the full description.">${esc(current?.description||'')}</textarea>
    </label>
    <label>Awarding body<input name="awarding" value="${esc(existing?.awarding_body||'')}"></label>
    <label>Certificate number<input name="number" value="${esc(existing?.certificate_number||'')}"></label>
    <label>Issue date<input type="date" name="issue" value="${existing?.issue_date||''}"></label>
    <label>Expiry date<input type="date" name="expiry" value="${existing?.expiry_date||''}"></label>
    <label style="grid-column:1/-1">Evidence / certificate file<input type="file" name="file"></label>
  </div>`,async f=>{
    const catalogId=Number(f.get('catalog_id'));
    const selected=accreditationCatalog.find(x=>Number(x.id)===catalogId);
    if(!selected)throw new Error('Please select an accreditation or course from the catalogue.');
    let path=existing?.certificate_url||null;
    const file=f.get('file');
    if(file&&file.size){
      path=`${learnerId}/accreditations/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
      const {error}=await db.storage.from('learner-documents').upload(path,file);
      if(error)throw error;
    }
    const payload={
      learner_id:learnerId,
      accreditation_catalog_id:selected.id,
      accreditation_name:selected.module_code,
      awarding_body:f.get('awarding').trim()||null,
      certificate_number:f.get('number').trim()||null,
      status:accreditationStatus(f.get('expiry')||null).label.toLowerCase(),
      issue_date:f.get('issue')||null,
      expiry_date:f.get('expiry')||null,
      certificate_url:path
    };
    const q=existing?db.from('accreditations').update(payload).eq('id',existing.id):db.from('accreditations').insert(payload);
    const {error}=await q;
    if(error)throw error;
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
  updateDescription();
};

document.querySelectorAll('[data-open-modal="accreditation"]').forEach(btn=>btn.onclick=()=>openAccModal());

// NOPS catalogue integration enabled.

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

function accreditationDbStatus(expiry){
  const state=accreditationStatus(expiry);
  if(state.cls==='expired')return 'expired';
  if(state.cls==='expiring')return 'expiring';
  return 'current';
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
      accreditation_catalog_id:selected.id,
      accreditation_name:selected.module_code,
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
  updateDescription();
};

document.querySelectorAll('[data-open-modal="accreditation"]').forEach(btn=>btn.onclick=()=>openAccModal());

// Accreditation list / grid view toggle.
(function installAccreditationViewToggle(){
  const list=document.getElementById('accreditationList');
  const tab=document.getElementById('tab-accreditations');
  if(!list||!tab||document.getElementById('accreditationViewToggle'))return;

  const style=document.createElement('style');
  style.textContent=`
    .accreditation-head-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .accreditation-view-toggle{display:inline-flex;align-items:center;padding:3px;border:1px solid #d7dce2;border-radius:9px;background:#f5f7f9}
    .accreditation-view-btn{width:34px;height:30px;border:0;border-radius:6px;background:transparent;color:#667085;display:grid;place-items:center;cursor:pointer;transition:background .16s ease,color .16s ease,transform .16s ease}
    .accreditation-view-btn:hover{transform:translateY(-1px);color:#182028}
    .accreditation-view-btn.active{background:#252b31;color:#fff;box-shadow:0 2px 7px rgba(0,0,0,.14)}
    .accreditation-view-btn svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    #accreditationList.accreditation-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;align-items:stretch}
    #accreditationList.accreditation-grid>.record{min-width:0;min-height:180px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;padding:16px;background:#fbfcfd;border-radius:12px;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
    #accreditationList.accreditation-grid>.record:hover{transform:translateY(-2px);border-color:#c8cfd7;box-shadow:0 8px 20px rgba(18,24,33,.07)}
    #accreditationList.accreditation-grid>.record>div:first-child{min-width:0}
    #accreditationList.accreditation-grid>.record>div:first-child>strong{font-size:16px;display:block;margin-bottom:7px}
    #accreditationList.accreditation-grid>.record small{line-height:1.5;overflow-wrap:anywhere}
    #accreditationList.accreditation-grid>.record>div:last-child{width:100%;align-items:center!important;justify-content:space-between;gap:8px!important;margin-top:auto}
    #accreditationList.accreditation-grid .download-link{display:inline-flex;align-items:center;margin-top:7px;font-weight:700}
    #accreditationList.accreditation-grid .action-wrap{margin-left:auto}
    #accreditationList.accreditation-grid>.empty{grid-column:1/-1}
    @media(max-width:1180px){#accreditationList.accreditation-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
    @media(max-width:900px){#accreditationList.accreditation-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:600px){#accreditationList.accreditation-grid{grid-template-columns:1fr}.accreditation-head-actions{width:100%;justify-content:space-between}}
  `;
  document.head.appendChild(style);

  const heading=tab.querySelector('.panel-head-row');
  const addButton=heading?.querySelector('[data-open-modal="accreditation"]');
  if(!heading||!addButton)return;
  const actionsWrap=document.createElement('div');
  actionsWrap.className='accreditation-head-actions';
  const toggle=document.createElement('div');
  toggle.id='accreditationViewToggle';
  toggle.className='accreditation-view-toggle';
  toggle.setAttribute('role','group');
  toggle.setAttribute('aria-label','Accreditation view');
  toggle.innerHTML=`
    <button type="button" class="accreditation-view-btn" data-accreditation-view="list" title="List View" aria-label="List View"><svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg></button>
    <button type="button" class="accreditation-view-btn" data-accreditation-view="grid" title="Grid View" aria-label="Grid View"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></button>`;
  addButton.replaceWith(actionsWrap);
  actionsWrap.append(toggle,addButton);

  const saved=localStorage.getItem('rrtaAccreditationView')||'grid';
  const apply=view=>{
    const mode=view==='list'?'list':'grid';
    list.classList.toggle('accreditation-grid',mode==='grid');
    toggle.querySelectorAll('[data-accreditation-view]').forEach(btn=>btn.classList.toggle('active',btn.dataset.accreditationView===mode));
    localStorage.setItem('rrtaAccreditationView',mode);
  };
  toggle.querySelectorAll('[data-accreditation-view]').forEach(btn=>btn.addEventListener('click',()=>apply(btn.dataset.accreditationView)));
  apply(saved);
})();

// NOPS catalogue integration enabled.

(()=>{
  const CATEGORY_ORDER=['All','Profile','Accreditations','Training','Bookings','Requests','Notes'];
  const HIDDEN_FIELDS=new Set(['id','learner_id','profile_id','created_at','updated_at','archived_at','reviewed_at','submitted_at','assigned_at','completed_at','photo_path','verification_token','certificate_url','file_url','file_path','evidence_path']);
  const FIELD_LABELS={
    full_name:'Name',forename:'Forename',surname:'Surname',email:'Email',phone:'Phone Number',date_of_birth:'Date Of Birth',
    organisation:'Organisation',employee_number:'Employee Number',job_title:'Job Title',account_status:'Account Status',permission_level:'Permission Level',
    manager_1_id:'Primary Manager',manager_2_id:'Second Manager',manager_3_id:'Third Manager',job_role_id:'Job Role',is_primary:'Primary Role',
    accreditation_name:'Accreditation',awarding_body:'Awarding Body',certificate_number:'Certificate Number',issue_date:'Issue Date',expiry_date:'Expiry Date',status:'Status',
    completion_status:'Training Status',training_date:'Training Date',end_date:'End Date',trainer_name:'Trainer',location:'Location',course_title:'Course',booking_reference:'Booking Reference',
    attendance_status:'Attendance Status',outcome:'Outcome',qualification_name:'Qualification',reviewer_note:'Reviewer Note',learner_note:'Learner Note',review_note:'Review Note',
    field_name:'Requested Field',current_value:'Current Value',requested_value:'Requested Value',due_date:'Due Date',score:'Score',passed:'Passed',note:'Note',note_type:'Note Type',
    joining_instructions_sent_at:'Joining Instructions Sent',confirmation_sent_at:'Confirmation Sent',company_name:'Company',client_name:'Client',delegate_count:'Delegate Count'
  };
  let historyRows=[];
  let historyLoaded=false;
  let activeFilter='All';

  function prettyField(k){return FIELD_LABELS[k]||String(k||'').replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase())}
  function displayValue(key,value){
    if(value===null||value===undefined||value==='')return 'Not Set';
    if(key&&key.startsWith('manager_')&&typeof managerDisplayName==='function')return managerDisplayName(value);
    if(key==='job_role_id'&&typeof jobRoleById==='function')return jobRoleById(value)?.name||String(value);
    if(key==='course_id'&&Array.isArray(courses)){const c=courses.find(x=>String(x.id)===String(value));if(c)return c.title||c.code||String(value)}
    if(typeof value==='boolean')return value?'Yes':'No';
    if(/date|_at$/.test(key||'')){const d=new Date(value);if(!Number.isNaN(d.getTime()))return d.toLocaleString('en-GB',{dateStyle:'medium',timeStyle:key?.endsWith('_at')?'short':undefined})}
    return String(value);
  }
  function entityTitle(row){
    const d=row.new_data||row.old_data||{};
    const action=row.action||'Update';
    const entity=row.entity_type||'';
    if(entity==='profiles')return `${action} · Profile`;
    if(entity==='accreditations')return `${action} · ${d.accreditation_name||'Accreditation'}`;
    if(entity==='training_records')return `${action} · ${d.course_title||d.booking_reference||'Training Record'}`;
    if(entity==='assignments')return `${action} · Course Assignment`;
    if(entity==='assessment_attempts')return `${action} · Assessment Result`;
    if(entity==='certificates')return `${action} · Certificate ${d.certificate_number||''}`.trim();
    if(entity==='learner_documents')return `${action} · ${d.title||d.file_name||'Document'}`;
    if(entity==='evidence_review_requests')return `${action} · Evidence Review — ${d.qualification_name||'Qualification'}`;
    if(entity==='profile_change_requests')return `${action} · Profile Change Request`;
    if(entity==='learner_notes')return `${action} · Note`;
    if(entity==='profile_job_roles')return `${action} · Job Role Assignment`;
    if(entity==='booking_attendees')return `${action} · Booking Attendance`;
    if(entity==='bookings')return `${action} · Booking ${d.booking_reference||''}`.trim();
    return `${action} · ${entity.replace(/_/g,' ')}`;
  }
  function detailsHtml(row){
    if(row.action==='Insert'){
      const d=row.new_data||{};
      const useful=Object.keys(d).filter(k=>!HIDDEN_FIELDS.has(k)&&d[k]!==null&&d[k]!==''&&k!=='record').slice(0,5);
      if(!useful.length)return '<div class="history-note">Record Added</div>';
      return useful.map(k=>`<div class="history-change"><span>${esc(prettyField(k))}</span><strong>${esc(displayValue(k,d[k]))}</strong></div>`).join('');
    }
    if(row.action==='Delete'){
      const d=row.old_data||{};
      const name=d.accreditation_name||d.course_title||d.title||d.qualification_name||d.note_type||'Record';
      return `<div class="history-note">Removed: <strong>${esc(name)}</strong></div>`;
    }
    const before=row.old_data||{},after=row.new_data||{};
    const fields=(row.changed_fields||[]).filter(k=>!HIDDEN_FIELDS.has(k));
    if(!fields.length)return '<div class="history-note">Record Updated</div>';
    return fields.slice(0,8).map(k=>`<div class="history-change"><span>${esc(prettyField(k))}</span><div><del>${esc(displayValue(k,before[k]))}</del><b>→</b><strong>${esc(displayValue(k,after[k]))}</strong></div></div>`).join('');
  }
  function renderHistory(){
    const list=document.getElementById('historyList');
    const count=document.getElementById('historyCount');
    if(!list)return;
    const rows=activeFilter==='All'?historyRows:historyRows.filter(r=>r.category===activeFilter);
    if(count)count.textContent=`${rows.length} ${rows.length===1?'event':'events'}`;
    document.querySelectorAll('[data-history-filter]').forEach(b=>b.classList.toggle('active',b.dataset.historyFilter===activeFilter));
    if(!rows.length){list.innerHTML='<div class="empty">No history has been recorded in this category yet.</div>';return}
    list.innerHTML=rows.map(row=>{
      const when=new Date(row.created_at).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'});
      return `<article class="history-event"><div class="history-dot"></div><div class="history-body"><div class="history-head"><div><span class="history-category">${esc(row.category)}</span><strong>${esc(entityTitle(row))}</strong></div><time>${esc(when)}</time></div><div class="history-meta">Changed by <strong>${esc(row.actor_name||'System')}</strong>${row.reason?` · ${esc(row.reason)}`:''}</div><div class="history-details">${detailsHtml(row)}</div></div></article>`;
    }).join('');
  }
  async function loadHistory(){
    const list=document.getElementById('historyList');
    if(list)list.innerHTML='<div class="empty">Loading History…</div>';
    const {data,error}=await db.from('learner_history').select('id,category,action,entity_type,entity_id,changed_fields,old_data,new_data,actor_name,reason,created_at').eq('learner_id',learnerId).order('created_at',{ascending:false}).limit(500);
    if(error){if(list)list.innerHTML=`<div class="empty">Unable to load history: ${esc(error.message)}</div>`;return}
    historyRows=data||[];historyLoaded=true;renderHistory();
  }
  function showHistory(){
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    document.getElementById('historyTabBtn')?.classList.add('active');
    document.getElementById('tab-history')?.classList.add('active');
    if(!historyLoaded)loadHistory();
  }
  function install(){
    const nav=document.querySelector('nav.tabs');
    if(!nav||document.getElementById('historyTabBtn'))return;
    const notesBtn=nav.querySelector('[data-tab="notes"]');
    if(notesBtn)notesBtn.textContent='Notes';
    const btn=document.createElement('button');
    btn.className='tab-btn';btn.id='historyTabBtn';btn.type='button';btn.textContent='History';btn.onclick=showHistory;
    nav.appendChild(btn);
    const panel=document.createElement('section');panel.id='tab-history';panel.className='tab-panel';
    panel.innerHTML=`<article class="panel-card"><div class="panel-head-row history-title-row"><div><h2>History</h2><p class="muted">A read-only audit trail of changes to this person's record. History is recorded from 12 September 2026 onward.</p></div><span id="historyCount" class="history-count">0 events</span></div><div class="history-filters">${CATEGORY_ORDER.map(x=>`<button type="button" class="history-filter ${x==='All'?'active':''}" data-history-filter="${x}">${x}</button>`).join('')}</div><div id="historyList" class="history-timeline"><div class="empty">Open History to load the audit trail.</div></div></article>`;
    nav.insertAdjacentElement('afterend',panel);
    panel.querySelectorAll('[data-history-filter]').forEach(b=>b.onclick=()=>{activeFilter=b.dataset.historyFilter;renderHistory()});
    const style=document.createElement('style');
    style.textContent=`.history-title-row{align-items:flex-start}.history-count{white-space:nowrap;border:1px solid #d9dee5;border-radius:999px;padding:6px 10px;color:#667085;font-size:12px;font-weight:800}.history-filters{display:flex;flex-wrap:wrap;gap:7px;margin:16px 0 20px}.history-filter{border:1px solid #d6dce3;background:#fff;border-radius:999px;padding:7px 11px;font-size:12px;font-weight:750;cursor:pointer}.history-filter.active{background:#252b31;color:#fff;border-color:#252b31}.history-timeline{position:relative;display:grid;gap:0}.history-event{display:grid;grid-template-columns:22px 1fr;gap:12px;position:relative;padding-bottom:18px}.history-event:not(:last-child):before{content:'';position:absolute;left:7px;top:17px;bottom:0;width:2px;background:#e5e9ee}.history-dot{width:16px;height:16px;border:4px solid #fff;border-radius:50%;background:#9d0b1a;box-shadow:0 0 0 1px #d4dae1;margin-top:4px;z-index:1}.history-body{border:1px solid #e1e6eb;background:#fbfcfd;border-radius:10px;padding:13px 15px}.history-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.history-head>div{display:grid;gap:4px}.history-head time{font-size:12px;color:#667085;white-space:nowrap}.history-category{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9d0b1a;font-weight:850}.history-meta{font-size:12px;color:#667085;margin-top:5px}.history-details{display:grid;gap:7px;margin-top:10px}.history-change{display:grid;grid-template-columns:minmax(130px,180px) 1fr;gap:12px;font-size:12px;padding-top:7px;border-top:1px solid #edf0f3}.history-change>span{color:#667085;font-weight:750}.history-change>div{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.history-change del{color:#8b4a50}.history-change b{color:#98a2b3}.history-change strong{color:#344054}.history-note{font-size:12px;color:#475467;padding-top:6px}@media(max-width:700px){.history-head{display:block}.history-head time{display:block;margin-top:5px}.history-change{grid-template-columns:1fr}}`;
    document.head.appendChild(style);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();

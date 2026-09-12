let rrtaCoursesLoaded=false;
let rrtaCourseGroups=[];
let rrtaActiveCourseFilter='all';

function courseDisplayCategory(category){return category==='RRTA'?'RRTA Online Courses':(category||'RRTA Online Courses')}
function courseStoredCategory(display){return display==='RRTA Online Courses'?'RRTA':display}

function installCourseSubmenu(){
  const coursesNav=document.querySelector('.side-link[data-view="courses"]');
  if(!coursesNav||document.getElementById('courseSubmenuWrap'))return;
  const wrap=document.createElement('div');
  wrap.id='courseSubmenuWrap';
  wrap.style.cssText='position:relative';
  coursesNav.parentNode.insertBefore(wrap,coursesNav);
  wrap.appendChild(coursesNav);
  const menu=document.createElement('div');
  menu.id='courseSubmenu';
  menu.style.cssText='display:none;margin:2px 0 8px 30px;border-left:1px solid rgba(255,255,255,.14);padding-left:8px';
  const items=['Smart Awards','SWQR','EUSR','First Aid','RRTA Online Courses'];
  menu.innerHTML=items.map(x=>`<button type="button" data-course-sub="${escapeHtml(x)}" style="display:block;width:100%;border:0;background:transparent;color:#cfd5da;text-align:left;padding:8px 9px;border-radius:6px;font-size:13px;cursor:pointer">${escapeHtml(x)}</button>`).join('');
  wrap.appendChild(menu);
  const show=()=>menu.style.display='block',hide=()=>menu.style.display='none';
  wrap.addEventListener('mouseenter',show);wrap.addEventListener('mouseleave',hide);
  coursesNav.addEventListener('focus',show);
  menu.querySelectorAll('[data-course-sub]').forEach(btn=>btn.addEventListener('click',()=>{
    rrtaActiveCourseFilter=btn.dataset.courseSub;
    coursesNav.click();
    setTimeout(()=>loadRrtaCourseCatalogue(true,rrtaActiveCourseFilter),0);
  }));
}

async function loadRrtaCourseCatalogue(force=false,requestedFilter=null){
  const view=document.getElementById('view-courses');
  if(!view)return;
  if(requestedFilter)rrtaActiveCourseFilter=requestedFilter;
  if(rrtaCoursesLoaded&&!force){renderRrtaCatalogue(view);return;}
  view.innerHTML=`<div class="page-head"><div><div class="eyebrow">Courses</div><h1>Course filing cabinet</h1><p>Course PowerPoints, specifications and joining instructions used by Rapid Response Training Academy.</p></div></div><div class="panel"><p class="muted">Loading course files…</p></div>`;
  try{
    const {data,error}=await db.from('courses').select('id,course_code,title,description,category,duration_days,specification_path,powerpoint_path,joining_instructions_path,active').eq('active',true).order('category').order('title');
    if(error)throw error;
    const courses=data||[];
    const groups=['Smart Awards','SWQR','EUSR','First Aid','RRTA Online Courses'];
    rrtaCourseGroups=groups.map(g=>[g,courses.filter(c=>courseDisplayCategory(c.category)===g)]).filter(([,items])=>items.length);
    rrtaCoursesLoaded=true;
    renderRrtaCatalogue(view);
  }catch(e){
    view.innerHTML=`<div class="page-head"><div><div class="eyebrow">Courses</div><h1>Course filing cabinet</h1></div></div><div class="panel"><p class="error">Unable to load courses: ${escapeHtml(e.message||'Unknown error')}</p></div>`;
  }
}

function renderRrtaCatalogue(view){
  const allCount=rrtaCourseGroups.reduce((n,[,items])=>n+items.length,0);
  const filtered=rrtaActiveCourseFilter==='all'?rrtaCourseGroups:rrtaCourseGroups.filter(([g])=>g===rrtaActiveCourseFilter);
  view.innerHTML=`<div class="page-head"><div><div class="eyebrow">Courses</div><h1>Course filing cabinet</h1><p>${allCount} current RRTA courses. Open a course to store and view its PowerPoint, specification and joining instructions.</p></div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px"><button class="mini-btn course-filter" data-course-filter="all">All courses</button>${['Smart Awards','SWQR','EUSR','First Aid','RRTA Online Courses'].map(g=>`<button class="mini-btn course-filter" data-course-filter="${escapeHtml(g)}">${escapeHtml(g)}</button>`).join('')}</div>
    <div id="courseCatalogueGroups">${filtered.map(([group,items])=>renderCourseGroup(group,items)).join('')||'<div class="panel"><p class="muted">No courses in this section yet.</p></div>'}</div>`;
  view.querySelectorAll('[data-course-id]').forEach(el=>el.addEventListener('click',()=>location.href=`course-detail.html?id=${encodeURIComponent(el.dataset.courseId)}`));
  view.querySelectorAll('.course-filter').forEach(btn=>btn.addEventListener('click',()=>{rrtaActiveCourseFilter=btn.dataset.courseFilter;renderRrtaCatalogue(view);}));
}

function renderCourseGroup(group,items){
  return `<section style="margin-bottom:24px"><div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:10px"><div><div class="eyebrow">${escapeHtml(group)}</div><h2 style="margin:4px 0">${escapeHtml(group)}</h2></div><span class="muted">${items.length} course${items.length===1?'':'s'}</span></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px">${items.map(c=>{
    const files=[c.powerpoint_path?'PowerPoint':'',c.specification_path?'Specification':'',c.joining_instructions_path?'Joining instructions':''].filter(Boolean);
    return `<button type="button" data-course-id="${c.id}" class="course-admin-card" style="text-align:left;cursor:pointer;width:100%;font:inherit"><div class="course-top"><div><span class="status live">ACTIVE</span></div><span class="delivery">${c.duration_days?`${Number(c.duration_days)} day${Number(c.duration_days)===1?'':'s'}`:'Duration TBC'}</span></div><h2 style="margin-top:10px">${escapeHtml(c.course_code||'Course')} — ${escapeHtml(c.title||'')}</h2><p>${escapeHtml(c.description||'Course file')}</p><div class="course-facts">${files.length?files.map(f=>`<span>${escapeHtml(f)} uploaded</span>`).join(''):'<span>Files to be added</span>'}</div><div style="margin-top:12px;color:#9d0b1a;font-weight:800;font-size:13px">Open course file →</div></button>`}).join('')}</div></section>`;
}

const coursesNav=document.querySelector('.side-link[data-view="courses"]');
if(coursesNav)coursesNav.addEventListener('click',()=>setTimeout(()=>loadRrtaCourseCatalogue(),0));
installCourseSubmenu();
if(document.getElementById('view-courses')?.classList.contains('active'))loadRrtaCourseCatalogue();

(function(){if(window.__rrtaUnifiedNavLoader)return;window.__rrtaUnifiedNavLoader=true;const s=document.createElement('script');s.src='trainer-navigation.js';document.head.appendChild(s)})();

(function(){
  function fixDuplicateNavIcons(){
    document.querySelectorAll('#trainerSidebar .nav-parent').forEach(el=>{
      const old=el.querySelector(':scope > .side-icon');
      const modern=el.querySelector(':scope > .rrta-nav-icon');
      if(old&&modern)old.remove();
    });
    document.querySelectorAll('#trainerSidebar .nav-subitem').forEach(el=>{
      const icons=el.querySelectorAll(':scope > .rrta-nav-icon');
      icons.forEach((node,i)=>{if(i>0)node.remove()});
    });
  }
  fixDuplicateNavIcons();
  new MutationObserver(fixDuplicateNavIcons).observe(document.documentElement,{childList:true,subtree:true});

  let rrtaLearnerPage=1;
  let rrtaLearnerRows=10;
  let rrtaExpandedLearner=null;

  const style=document.createElement('style');
  style.textContent=`
    #view-learners .panel{padding:0;overflow:hidden}
    #view-learners .panel>.panel-head{padding:18px 20px 6px}
    #view-learners .learner-tools{grid-template-columns:minmax(260px,1.4fr) minmax(160px,.65fr) minmax(180px,.75fr);gap:10px;padding:0 20px 14px;margin:0}
    #view-learners .learner-tools input,#view-learners .learner-tools select{height:42px;padding:8px 11px;border-radius:7px;font-size:13px}
    .atlas-wrap{border-top:1px solid var(--rrta-line);overflow:auto}.atlas-table{width:100%;border-collapse:collapse;min-width:930px}.atlas-table th{background:var(--rrta-surface-2);color:var(--rrta-text);font-size:11px;text-align:left;padding:11px 12px;border-right:1px solid var(--rrta-line);border-bottom:1px solid var(--rrta-line);white-space:nowrap}.atlas-table td{font-size:12px;padding:10px 12px;border-right:1px solid var(--rrta-line);border-bottom:1px solid var(--rrta-line);color:var(--rrta-text);vertical-align:middle}.atlas-table tr:hover>td{background:color-mix(in srgb,var(--rrta-surface-2) 65%,transparent)}.atlas-expand{width:31px;height:31px;border:1px solid var(--rrta-line);background:var(--rrta-surface);color:var(--rrta-text);border-radius:7px;cursor:pointer;font-size:16px;display:grid;place-items:center}.atlas-status{display:inline-flex;border-radius:999px;padding:5px 8px;font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.04em;background:rgba(34,160,107,.11);color:var(--rrta-good)}.atlas-status.archived{background:rgba(207,54,72,.11);color:var(--rrta-danger)}.atlas-detail td{padding:0!important;background:var(--rrta-surface-2)!important}.atlas-detail-card{padding:16px 18px;display:grid;grid-template-columns:repeat(5,minmax(120px,1fr)) auto;gap:14px;align-items:center;animation:viewIn .2s ease both}.atlas-detail-item span{display:block;color:var(--rrta-muted);font-size:9px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}.atlas-detail-item strong{font-size:12px;font-weight:750}.atlas-detail-actions{display:flex;gap:7px;justify-content:flex-end}.atlas-detail-actions a{white-space:nowrap}.atlas-footer{display:flex;align-items:center;gap:12px;justify-content:space-between;padding:11px 12px;background:var(--rrta-surface-2);border-top:1px solid var(--rrta-line);font-size:11px;color:var(--rrta-muted)}.atlas-footer-left{display:flex;align-items:center;gap:8px}.atlas-footer select{height:34px;border:1px solid var(--rrta-line);background:var(--rrta-surface);color:var(--rrta-text);border-radius:7px;padding:0 8px}.atlas-pages{display:flex;gap:5px;align-items:center}.atlas-pages button{min-width:34px;height:34px;border:1px solid var(--rrta-line);background:var(--rrta-surface);color:var(--rrta-text);border-radius:7px;font-weight:750;cursor:pointer}.atlas-pages button.active{background:var(--rrta-red);border-color:var(--rrta-red);color:#fff}.atlas-pages button:disabled{opacity:.45;cursor:not-allowed}
    @media(max-width:1100px){.atlas-detail-card{grid-template-columns:repeat(2,minmax(140px,1fr))}.atlas-detail-actions{justify-content:flex-start}}
  `;
  document.head.appendChild(style);

  function learnerName(l){const bits=(l.full_name||'').trim().split(/\s+/);return {first:l.forename||bits[0]||'—',last:l.surname||bits.slice(1).join(' ')||'—'}}
  function pageButtons(totalPages){
    const pages=[];const start=Math.max(1,Math.min(rrtaLearnerPage-2,totalPages-4));const end=Math.min(totalPages,start+4);
    for(let p=start;p<=end;p++)pages.push(`<button data-atlas-page="${p}" class="${p===rrtaLearnerPage?'active':''}">${p}</button>`);
    return pages.join('');
  }
  async function openLearnerDetail(id){
    rrtaExpandedLearner=rrtaExpandedLearner===id?null:id;
    renderLearnerResults();
    if(rrtaExpandedLearner!==id)return;
    const target=document.querySelector(`[data-detail-body="${id}"]`);if(!target)return;
    const {data,error}=await db.from('profiles').select('phone,date_of_birth,manager_1_id,manager_2_id,manager_3_id').eq('id',id).single();
    if(error){target.innerHTML='<div class="atlas-detail-item"><strong>Unable to load extra details.</strong></div>';return}
    const managerIds=[data.manager_1_id,data.manager_2_id,data.manager_3_id].filter(Boolean);
    let managers=[];if(managerIds.length){const m=await db.from('profiles').select('id,full_name').in('id',managerIds);managers=m.data||[]}
    const row=filteredLearners.find(x=>x.id===id)||{};
    target.innerHTML=`<div class="atlas-detail-item"><span>Phone</span><strong>${escapeHtml(data.phone||'Not Recorded')}</strong></div><div class="atlas-detail-item"><span>Date Of Birth</span><strong>${escapeHtml(data.date_of_birth?new Date(data.date_of_birth+'T00:00:00').toLocaleDateString('en-GB'):'Not Recorded')}</strong></div><div class="atlas-detail-item"><span>Employee Number</span><strong>${escapeHtml(row.employee_number||'Not Recorded')}</strong></div><div class="atlas-detail-item"><span>Organisation</span><strong>${escapeHtml(row.organisation||'Not Recorded')}</strong></div><div class="atlas-detail-item"><span>Managers</span><strong>${escapeHtml(managers.length?managers.map(x=>x.full_name).join(', '):'Not Assigned')}</strong></div><div class="atlas-detail-actions"><a class="btn secondary" href="learner-compliance.html?id=${encodeURIComponent(id)}">Compliance</a><a class="btn dark" href="learner-profile.html?id=${encodeURIComponent(id)}">Open Profile</a></div>`;
  }

  function atlasRender(){
    const box=document.getElementById('learnerResults');if(!box)return;
    const total=filteredLearners.length;
    const totalPages=Math.max(1,Math.ceil(total/rrtaLearnerRows));
    if(rrtaLearnerPage>totalPages)rrtaLearnerPage=totalPages;
    const start=(rrtaLearnerPage-1)*rrtaLearnerRows;
    const rows=filteredLearners.slice(start,start+rrtaLearnerRows);
    if(!total){box.innerHTML='<div class="empty-state"><strong>No Learners Found</strong>Try changing your search or filter selections.</div>';return}
    box.innerHTML=`<div class="atlas-wrap"><table class="atlas-table"><thead><tr><th></th><th>Name</th><th>Job Title</th><th>Organisation</th><th>Employee No.</th><th>Email</th><th>Status</th></tr></thead><tbody>${rows.map(l=>{const n=learnerName(l),open=rrtaExpandedLearner===l.id;return `<tr><td><button class="atlas-expand" data-atlas-expand="${l.id}" aria-label="${open?'Collapse':'Expand'} ${escapeHtml(l.full_name||'learner')}">${open?'−':'+'}</button></td><td><strong>${escapeHtml(n.first)} ${escapeHtml(n.last)}</strong></td><td>${escapeHtml(l.job_title||'—')}</td><td>${escapeHtml(l.organisation||'—')}</td><td>${escapeHtml(l.employee_number||'—')}</td><td>${escapeHtml(l.email||'—')}</td><td><span class="atlas-status ${String(l.account_status||'active').toLowerCase()==='active'?'':'archived'}">${escapeHtml(l.account_status||'Active')}</span></td></tr>${open?`<tr class="atlas-detail"><td colspan="7"><div class="atlas-detail-card" data-detail-body="${l.id}"><div class="atlas-detail-item"><strong>Loading details…</strong></div></div></td></tr>`:''}`}).join('')}</tbody></table></div><div class="atlas-footer"><div class="atlas-footer-left"><select id="atlasRows"><option value="10" ${rrtaLearnerRows===10?'selected':''}>10 rows</option><option value="25" ${rrtaLearnerRows===25?'selected':''}>25 rows</option><option value="50" ${rrtaLearnerRows===50?'selected':''}>50 rows</option></select><span>Displaying ${start+1} - ${Math.min(start+rrtaLearnerRows,total)} of ${total} learners</span></div><div class="atlas-pages"><button data-atlas-page="1" ${rrtaLearnerPage===1?'disabled':''}>First</button><button data-atlas-page="${Math.max(1,rrtaLearnerPage-1)}" ${rrtaLearnerPage===1?'disabled':''}>‹</button>${pageButtons(totalPages)}<button data-atlas-page="${Math.min(totalPages,rrtaLearnerPage+1)}" ${rrtaLearnerPage===totalPages?'disabled':''}>›</button><button data-atlas-page="${totalPages}" ${rrtaLearnerPage===totalPages?'disabled':''}>Last</button></div></div>`;
    box.querySelectorAll('[data-atlas-page]').forEach(b=>b.addEventListener('click',()=>{rrtaLearnerPage=Number(b.dataset.atlasPage)||1;rrtaExpandedLearner=null;atlasRender()}));
    box.querySelector('#atlasRows')?.addEventListener('change',e=>{rrtaLearnerRows=Number(e.target.value)||10;rrtaLearnerPage=1;rrtaExpandedLearner=null;atlasRender()});
    box.querySelectorAll('[data-atlas-expand]').forEach(b=>b.addEventListener('click',()=>openLearnerDetail(b.dataset.atlasExpand)));
    if(rrtaExpandedLearner)openLearnerDetail(rrtaExpandedLearner).catch(()=>{});
  }

  try{renderLearnerResults=atlasRender}catch(e){window.renderLearnerResults=atlasRender}
  ['learnerSearch','learnerStatus','learnerOrganisation'].forEach(id=>document.getElementById(id)?.addEventListener('input',()=>{rrtaLearnerPage=1;rrtaExpandedLearner=null},true));
})();

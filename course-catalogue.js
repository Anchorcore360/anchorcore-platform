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

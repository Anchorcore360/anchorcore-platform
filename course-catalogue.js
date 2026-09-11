let rrtaCoursesLoaded=false;

async function loadRrtaCourseCatalogue(force=false){
  const view=document.getElementById('view-courses');
  if(!view)return;
  if(rrtaCoursesLoaded&&!force)return;
  view.innerHTML=`<div class="page-head"><div><div class="eyebrow">Courses</div><h1>Course catalogue</h1><p>Courses currently delivered by Rapid Response Training Academy.</p></div></div><div class="panel"><p class="muted">Loading course catalogue…</p></div>`;
  try{
    const {data,error}=await db.from('courses').select('id,course_code,title,description,category,duration_days,specification_path,pass_mark,question_count,active').eq('active',true).order('category').order('title');
    if(error)throw error;
    const courses=data||[];
    const groups=['Smart Awards','SWQR','EUSR','First Aid','RRTA'];
    const grouped=groups.map(g=>[g,courses.filter(c=>(c.category||'RRTA')===g)]).filter(([,items])=>items.length);
    view.innerHTML=`<div class="page-head"><div><div class="eyebrow">Courses</div><h1>Course catalogue</h1><p>${courses.length} courses currently delivered by Rapid Response Training Academy. Click a course to view its details and specification.</p></div></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px">${groups.map(g=>`<button class="mini-btn course-filter" data-course-filter="${escapeHtml(g)}">${escapeHtml(g)}</button>`).join('')}<button class="mini-btn course-filter" data-course-filter="all">All courses</button></div>
      <div id="courseCatalogueGroups">${grouped.map(([group,items])=>renderCourseGroup(group,items)).join('')}</div>`;
    document.querySelectorAll('[data-course-id]').forEach(el=>el.addEventListener('click',()=>location.href=`course-detail.html?id=${encodeURIComponent(el.dataset.courseId)}`));
    document.querySelectorAll('.course-filter').forEach(btn=>btn.addEventListener('click',()=>{
      const f=btn.dataset.courseFilter;
      const filtered=f==='all'?grouped:grouped.filter(([g])=>g===f);
      document.getElementById('courseCatalogueGroups').innerHTML=filtered.map(([group,items])=>renderCourseGroup(group,items)).join('');
      document.querySelectorAll('[data-course-id]').forEach(el=>el.addEventListener('click',()=>location.href=`course-detail.html?id=${encodeURIComponent(el.dataset.courseId)}`));
    }));
    rrtaCoursesLoaded=true;
  }catch(e){
    view.innerHTML=`<div class="page-head"><div><div class="eyebrow">Courses</div><h1>Course catalogue</h1></div></div><div class="panel"><p class="error">Unable to load courses: ${escapeHtml(e.message||'Unknown error')}</p></div>`;
  }
}

function renderCourseGroup(group,items){
  return `<section style="margin-bottom:24px"><div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:10px"><div><div class="eyebrow">${escapeHtml(group)}</div><h2 style="margin:4px 0">${escapeHtml(group)} courses</h2></div><span class="muted">${items.length} course${items.length===1?'':'s'}</span></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px">${items.map(c=>`<button type="button" data-course-id="${c.id}" class="course-admin-card" style="text-align:left;cursor:pointer;width:100%;font:inherit"><div class="course-top"><div><span class="status live">LIVE</span></div><span class="delivery">${c.duration_days?`${Number(c.duration_days)} day${Number(c.duration_days)===1?'':'s'}`:'Duration TBC'}</span></div><h2 style="margin-top:10px">${escapeHtml(c.course_code||'Course')} — ${escapeHtml(c.title||'')}</h2><p>${escapeHtml(c.description||'Course specification to be added.')}</p><div class="course-facts"><span>${c.specification_path?'Specification uploaded':'Specification pending'}</span>${c.question_count?`<span>${c.question_count} question assessment</span>`:''}${c.pass_mark?`<span>${c.pass_mark}% pass mark</span>`:''}</div><div style="margin-top:12px;color:#9d0b1a;font-weight:800;font-size:13px">View course →</div></button>`).join('')}</div></section>`;
}

const coursesNav=document.querySelector('.side-link[data-view="courses"]');
if(coursesNav)coursesNav.addEventListener('click',()=>setTimeout(()=>loadRrtaCourseCatalogue(),0));

// If the Courses view is already active when this script loads, replace the static starter card.
if(document.getElementById('view-courses')?.classList.contains('active'))loadRrtaCourseCatalogue();

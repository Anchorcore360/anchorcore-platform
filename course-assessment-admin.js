(function(){
  const app=document.getElementById('courseApp');
  if(!app)return;
  let learners=[],assignments=[],attempts=[],user=null;
  const fmt=d=>d?new Date(d).toLocaleDateString('en-GB'):'—';
  const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  async function waitForCourse(){return new Promise(resolve=>{const t=()=>{try{if(typeof course!=='undefined'&&course)return resolve()}catch(_){}setTimeout(t,120)};t()})}
  async function load(){
    await waitForCourse();
    if(course.course_code!=='RRTA-CS001')return;
    const {data:u}=await db.auth.getUser();user=u?.user||null;
    const [l,a,r]=await Promise.all([
      db.from('profiles').select('id,full_name,forename,surname,email,employee_number,organisation,account_status').eq('role','learner').order('surname').order('forename'),
      db.from('assignments').select('*').eq('course_id',course.id).order('assigned_at',{ascending:false}),
      db.from('assessment_attempts').select('*').eq('course_id',course.id).order('completed_at',{ascending:false})
    ]);
    if(l.error||a.error||r.error)return;
    learners=(l.data||[]).filter(x=>String(x.account_status||'active').toLowerCase()==='active');assignments=a.data||[];attempts=r.data||[];
    renderPanel();
  }
  function latestAttempt(learnerId){return attempts.find(x=>x.learner_id===learnerId)||null}
  function statusText(a){const r=latestAttempt(a.learner_id);if(r)return r.passed?`Passed · ${r.score}/20`:`Refer · ${r.score}/20`;return String(a.status||'assigned').replace('_',' ')}
  function renderPanel(){
    let box=document.getElementById('embeddedAssessmentPanel');
    if(!box){box=document.createElement('section');box.id='embeddedAssessmentPanel';box.style.cssText='margin-top:22px;border-top:1px solid #e1e5e9;padding-top:22px';app.appendChild(box)}
    box.innerHTML=`<div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap"><div><div class="eyebrow">In-House Assessment</div><h2 style="margin:5px 0 6px">Embedded Test</h2><p class="muted" style="margin:0">Assign this course to an RRT employee and track their assessment result from this course file.</p></div><a class="btn secondary" style="text-decoration:none" href="customer-service-assessment.html?preview=1" target="_blank">Preview Test</a></div><div class="course-meta" style="margin-top:14px"><span>60-Question Bank</span><span>20 Random Questions</span><span>20 Minutes</span><span>80% Pass Mark</span></div><div style="display:grid;grid-template-columns:minmax(260px,1fr) 180px auto;gap:10px;align-items:end;margin-top:16px"><label style="font-size:12px;font-weight:800">Employee<select id="assessmentLearner" style="width:100%;margin-top:5px"><option value="">Select Employee</option>${learners.map(l=>`<option value="${l.id}">${e(l.full_name||`${l.forename||''} ${l.surname||''}`.trim())}${l.employee_number?' · '+e(l.employee_number):''}</option>`).join('')}</select></label><label style="font-size:12px;font-weight:800">Due Date<input id="assessmentDue" type="date" style="width:100%;margin-top:5px"></label><button id="assignAssessmentBtn" class="btn dark">Assign Course</button></div><div style="margin-top:18px"><h3 style="margin-bottom:8px">Assigned Employees</h3>${assignments.length?`<div style="overflow:auto"><table class="table"><thead><tr><th>Employee</th><th>Assigned</th><th>Due</th><th>Status / Latest Result</th><th></th></tr></thead><tbody>${assignments.map(a=>{const l=learners.find(x=>x.id===a.learner_id);return `<tr><td><strong>${e(l?.full_name||'Employee')}</strong><br><small>${e(l?.email||'')}</small></td><td>${fmt(a.assigned_at)}</td><td>${a.due_date?fmt(a.due_date):'—'}</td><td>${e(statusText(a))}</td><td><button class="mini-btn red" data-remove-assignment="${a.id}">Remove</button></td></tr>`}).join('')}</tbody></table></div>`:'<div class="notice">No employees have been assigned this course yet.</div>'}</div>`;
    document.getElementById('assignAssessmentBtn').onclick=assign;
    box.querySelectorAll('[data-remove-assignment]').forEach(b=>b.onclick=()=>removeAssignment(b.dataset.removeAssignment));
  }
  async function assign(){const learnerId=document.getElementById('assessmentLearner').value,due=document.getElementById('assessmentDue').value||null;if(!learnerId)return alert('Select an employee first.');if(assignments.some(a=>a.learner_id===learnerId))return alert('This employee is already assigned to this course.');const payload={learner_id:learnerId,course_id:course.id,assigned_by:user?.id||null,due_date:due,status:'assigned'};const {data,error}=await db.from('assignments').insert(payload).select('*').single();if(error)return alert(error.message);assignments.unshift(data);renderPanel()}
  async function removeAssignment(id){if(!confirm('Remove this course assignment?'))return;const {error}=await db.from('assignments').delete().eq('id',id);if(error)return alert(error.message);assignments=assignments.filter(x=>String(x.id)!==String(id));renderPanel()}
  const observer=new MutationObserver(()=>{if(course?.course_code==='RRTA-CS001'&&!document.getElementById('embeddedAssessmentPanel'))load().catch(()=>{})});observer.observe(app,{childList:true,subtree:true});
  load().catch(()=>{});
})();
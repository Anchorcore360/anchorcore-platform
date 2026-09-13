(function(){
  const fmtDate=v=>v?new Date(v+'T00:00:00').toLocaleDateString('en-GB'):'—';
  const escHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let bookedCourses=[];

  async function loadBookedCourses(){
    if(typeof db==='undefined'||typeof learnerId==='undefined'||!learnerId)return;
    const attendeeRes=await db.from('booking_attendees').select('booking_id,attendance_status,outcome').eq('profile_id',learnerId);
    if(attendeeRes.error)throw attendeeRes.error;
    const attendeeRows=attendeeRes.data||[];
    const ids=[...new Set(attendeeRows.map(x=>x.booking_id).filter(Boolean))];
    if(!ids.length){bookedCourses=[];return;}
    const bookingRes=await db.from('bookings').select('id,booking_reference,course_title,start_date,end_date,start_time,end_time,location,location_address,location_postcode,status').in('id',ids).order('start_date',{ascending:true});
    if(bookingRes.error)throw bookingRes.error;
    const attendeeByBooking=new Map(attendeeRows.map(x=>[x.booking_id,x]));
    bookedCourses=(bookingRes.data||[]).map(b=>({...b,attendee:attendeeByBooking.get(b.id)||{}}));
  }

  function ensureBookedTab(){
    const tabs=document.querySelector('.tabs');
    const overviewBtn=tabs?.querySelector('[data-tab="overview"]');
    if(!tabs||!overviewBtn)return;
    overviewBtn.textContent='Learning';
    if(!tabs.querySelector('[data-tab="bookings"]')){
      const b=document.createElement('button');
      b.className='tab-btn';b.dataset.tab='bookings';b.textContent='Booked Courses';
      overviewBtn.insertAdjacentElement('afterend',b);
    }
    if(!tabs.querySelector('[data-tab="compliance"]')){
      const b=document.createElement('button');
      b.className='tab-btn';b.dataset.tab='compliance';b.textContent='Compliance';
      const acc=tabs.querySelector('[data-tab="accreditations"]');
      if(acc)acc.insertAdjacentElement('beforebegin',b);else tabs.appendChild(b);
    }
    ['assignments','assessments','certificates','training'].forEach(name=>tabs.querySelector(`[data-tab="${name}"]`)?.remove());
    const acc=tabs.querySelector('[data-tab="accreditations"]');if(acc)acc.textContent='Accreditations & Certificates';
    const notes=tabs.querySelector('[data-tab="notes"]');if(notes)notes.textContent='Notes';
  }

  function ensurePanels(){
    const app=document.getElementById('profileApp');if(!app)return;
    if(!document.getElementById('tab-bookings')){
      const p=document.createElement('section');p.id='tab-bookings';p.className='tab-panel';
      p.innerHTML='<article class="panel-card"><div class="panel-head-row"><div><h2>Booked Courses</h2><p class="muted">Upcoming and previous course bookings linked to this person.</p></div></div><div id="bookedCoursesList" class="record-list"></div></article>';
      document.getElementById('tab-overview')?.insertAdjacentElement('afterend',p);
    }
    if(!document.getElementById('tab-compliance')){
      const p=document.createElement('section');p.id='tab-compliance';p.className='tab-panel';
      p.innerHTML='<div id="complianceProfileHost"></div>';
      document.getElementById('tab-accreditations')?.insertAdjacentElement('beforebegin',p);
    }
  }

  function renderLearningHome(){
    const overview=document.getElementById('tab-overview');if(!overview)return;
    const stats=overview.querySelector('.profile-grid');
    if(stats){
      const today=new Date();today.setHours(0,0,0,0);
      const upcoming=bookedCourses.filter(b=>b.start_date&&new Date(b.start_date+'T00:00:00')>=today).length;
      stats.innerHTML=`<div class="metric"><span>Upcoming Bookings</span><strong>${upcoming}</strong></div><div class="metric"><span>Assigned Learning</span><strong>${(typeof assignments!=='undefined'?assignments:[]).filter(x=>x.status!=='completed').length}</strong></div><div class="metric"><span>Accreditations</span><strong>${typeof accreditations!=='undefined'?accreditations.length:0}</strong></div><div class="metric"><span>Completed Assessments</span><strong>${typeof attempts!=='undefined'?attempts.length:0}</strong></div>`;
    }
    let learning=document.getElementById('learningHome');
    if(!learning){
      learning=document.createElement('div');learning.id='learningHome';learning.className='two-col';
      if(stats)stats.insertAdjacentElement('afterend',learning);else overview.prepend(learning);
    }
    const upcomingRows=bookedCourses.filter(b=>!b.start_date||new Date(b.start_date+'T23:59:59')>=new Date()).slice(0,4);
    const assigned=(typeof assignments!=='undefined'?assignments:[]).filter(x=>x.status!=='completed').slice(0,4);
    const courseName=id=>typeof courses!=='undefined'?(courses.find(c=>String(c.id)===String(id))?.title||`Course ${id}`):`Course ${id}`;
    learning.innerHTML=`<article class="panel-card"><div class="panel-head-row"><div><h2>Upcoming Booked Courses</h2><p class="muted">Training already booked for this person.</p></div></div><div class="record-list">${upcomingRows.length?upcomingRows.map(b=>`<div class="record"><div><strong>${escHtml(b.course_title||'Booked course')}</strong><small>${fmtDate(b.start_date)}${b.end_date&&b.end_date!==b.start_date?' – '+fmtDate(b.end_date):''} · ${escHtml(b.location||b.location_address||'Location TBC')}</small></div><strong>${escHtml(b.status||'booked')}</strong></div>`).join(''):'<div class="empty">No upcoming booked courses.</div>'}</div></article><article class="panel-card"><div class="panel-head-row"><div><h2>Assigned Learning</h2><p class="muted">Online or internal learning currently assigned.</p></div></div><div class="record-list">${assigned.length?assigned.map(a=>`<div class="record"><div><strong>${escHtml(courseName(a.course_id))}</strong><small>Due ${fmtDate(a.due_date)} · Assigned ${fmtDate(a.assigned_at)}</small></div><strong>${escHtml(a.status||'assigned')}</strong></div>`).join(''):'<div class="empty">No learning currently assigned.</div>'}</div></article>`;
    const oldTwo=[...overview.querySelectorAll(':scope > .two-col')].filter(x=>x.id!=='learningHome');
    oldTwo.forEach(x=>x.style.marginTop='16px');
  }

  function moveComplianceManagement(){
    const host=document.getElementById('complianceProfileHost');if(!host)return;
    const manager=document.getElementById('managerPanel');
    const roles=document.getElementById('jobRolePanel');
    const snapshot=document.getElementById('complianceSnapshot');
    if(manager&&manager.parentElement!==host)host.appendChild(manager);
    if(roles&&roles.parentElement!==host)host.appendChild(roles);
    let snapshotCard=document.getElementById('profileComplianceCard');
    if(!snapshotCard&&snapshot){
      snapshotCard=snapshot.closest('.panel-card');
      if(snapshotCard){snapshotCard.id='profileComplianceCard';const h=snapshotCard.querySelector('h2');if(h)h.textContent='Compliance Requirements';}
    }
    if(snapshotCard&&snapshotCard.parentElement!==host)host.appendChild(snapshotCard);
    if(manager)manager.querySelector('h2').textContent='Management & Reporting';
    if(roles)roles.querySelector('h2').textContent='Compliance Job Roles';
  }

  function mergeCertificatesIntoAccreditations(){
    const panel=document.getElementById('tab-accreditations');if(!panel)return;
    let certBlock=document.getElementById('profileCertificateBlock');
    if(!certBlock){
      certBlock=document.createElement('article');certBlock.id='profileCertificateBlock';certBlock.className='panel-card';certBlock.style.marginTop='16px';
      certBlock.innerHTML='<div class="panel-head-row"><div><h2>Course Certificates</h2><p class="muted">Certificates created from completed course activity.</p></div></div><div id="profileCertificateList" class="record-list"></div>';
      panel.appendChild(certBlock);
    }
    const source=document.getElementById('certificateList'),target=document.getElementById('profileCertificateList');
    if(source&&target)target.innerHTML=source.innerHTML;
  }

  function renderBookedCourses(){
    const box=document.getElementById('bookedCoursesList');if(!box)return;
    if(!bookedCourses.length){box.innerHTML='<div class="empty">No course bookings are linked to this person yet.</div>';return;}
    box.innerHTML=bookedCourses.map(b=>{const a=b.attendee||{};const address=[b.location,b.location_address,b.location_postcode].filter(Boolean).join(' · ');return `<div class="record"><div><strong>${escHtml(b.course_title||'Booked course')}</strong><small>${fmtDate(b.start_date)}${b.end_date&&b.end_date!==b.start_date?' – '+fmtDate(b.end_date):''}${address?' · '+escHtml(address):''}${b.booking_reference?' · '+escHtml(b.booking_reference):''}</small></div><div style="text-align:right"><strong>${escHtml(b.status||'booked')}</strong>${a.attendance_status?`<small>${escHtml(a.attendance_status)}${a.outcome?' · '+escHtml(a.outcome):''}</small>`:''}</div></div>`}).join('');
  }

  function wireTabs(){
    document.querySelectorAll('.tabs [data-tab]').forEach(btn=>{
      if(btn.dataset.solidProfileWired)return;btn.dataset.solidProfileWired='1';
      btn.addEventListener('click',()=>{document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));btn.classList.add('active');document.getElementById('tab-'+btn.dataset.tab)?.classList.add('active')});
    });
  }

  async function apply(){
    try{await loadBookedCourses()}catch(e){bookedCourses=[];console.warn('Booked courses unavailable',e)}
    ensureBookedTab();ensurePanels();renderLearningHome();moveComplianceManagement();mergeCertificatesIntoAccreditations();renderBookedCourses();wireTabs();
    document.getElementById('tab-assignments')?.classList.remove('active');
    document.getElementById('tab-assessments')?.classList.remove('active');
    document.getElementById('tab-certificates')?.classList.remove('active');
    document.getElementById('tab-training')?.classList.remove('active');
  }

  const start=()=>setTimeout(apply,180);
  window.addEventListener('load',start);
  if(document.readyState==='complete'||document.readyState==='interactive')start();
  if(typeof render==='function'){
    const prior=render;
    render=async function(){const r=await prior.apply(this,arguments);setTimeout(apply,80);return r};
  }
})();

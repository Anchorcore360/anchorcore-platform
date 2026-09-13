(function(){
  const fmtDate=v=>v?new Date(v+'T00:00:00').toLocaleDateString('en-GB'):'—';
  const escHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));
  let bookedCourses=[];

  const actionIcons={
    openVerificationBtn:{label:'Open Live Check',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.7"/></svg>'},
    downloadAccPdfBtn:{label:'Download Accreditation PDF',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11"/><path d="m8 10 4 4 4-4"/><path d="M5 18v2h14v-2"/></svg>'},
    editProfileBtn:{label:'Edit Profile',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>'}
  };

  function injectQuickActionStyles(){
    if(document.getElementById('profileQuickActionStyles'))return;
    const s=document.createElement('style');s.id='profileQuickActionStyles';s.textContent=`
      .profile-hero{position:relative}
      .profile-quick-actions{position:absolute;top:50%;right:194px;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;align-items:center;z-index:12;padding:0;background:transparent;border:0;border-radius:0;box-shadow:none}
      .profile-icon-action{position:relative;width:38px;height:38px;min-width:38px;padding:0!important;border:1px solid #d8dde4!important;border-radius:9px!important;background:#fff!important;color:#26313d!important;display:grid!important;place-items:center!important;cursor:pointer;box-shadow:none!important}
      .profile-icon-action:hover{background:#f6f7f8!important;border-color:#bdc5cf!important;color:#9d0b1a!important}
      .profile-icon-action svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
      .profile-icon-action::after{content:attr(data-tooltip);position:absolute;right:0;top:46px;white-space:nowrap;background:#18202a;color:#fff;font-size:11px;font-weight:700;padding:7px 9px;border-radius:7px;opacity:0;visibility:hidden;transform:translateY(-2px);transition:.15s;pointer-events:none;z-index:50}
      .profile-icon-action:hover::after,.profile-icon-action:focus-visible::after{opacity:1;visibility:visible;transform:translateY(0)}
      .profile-topbar #verificationActions{display:none!important}
      @media(max-width:900px){.profile-quick-actions{position:static;transform:none;flex-direction:row;margin:0 0 14px auto;width:max-content}.profile-hero{padding-top:18px}}
    `;document.head.appendChild(s);
  }

  function compactTopActions(){
    injectQuickActionStyles();
    const hero=document.querySelector('.profile-hero');if(!hero)return false;
    let dock=document.getElementById('profileQuickActions');
    if(!dock){dock=document.createElement('div');dock.id='profileQuickActions';dock.className='profile-quick-actions';dock.setAttribute('aria-label','Profile quick actions');hero.appendChild(dock)}
    Object.entries(actionIcons).forEach(([id,cfg])=>{
      const btn=document.getElementById(id);if(!btn)return;
      if(btn.parentElement!==dock)dock.appendChild(btn);
      if(btn.dataset.profileCompacted==='1')return;
      btn.dataset.profileCompacted='1';
      btn.className='profile-icon-action';
      btn.innerHTML=cfg.svg;
      btn.title=cfg.label;
      btn.setAttribute('aria-label',cfg.label);
      btn.dataset.tooltip=cfg.label;
    });
    const verificationWrap=document.getElementById('verificationActions');if(verificationWrap&&!verificationWrap.children.length)verificationWrap.remove();
    return true;
  }

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
    if(!tabs.querySelector('[data-tab="bookings"]')){const b=document.createElement('button');b.className='tab-btn';b.dataset.tab='bookings';b.textContent='Booked Courses';overviewBtn.insertAdjacentElement('afterend',b)}
    if(!tabs.querySelector('[data-tab="compliance"]')){const b=document.createElement('button');b.className='tab-btn';b.dataset.tab='compliance';b.textContent='Compliance';const acc=tabs.querySelector('[data-tab="accreditations"]');if(acc)acc.insertAdjacentElement('beforebegin',b);else tabs.appendChild(b)}
    ['assignments','assessments','certificates','training'].forEach(name=>tabs.querySelector(`[data-tab="${name}"]`)?.remove());
    const acc=tabs.querySelector('[data-tab="accreditations"]');if(acc)acc.textContent='Accreditations & Certificates';
    const notes=tabs.querySelector('[data-tab="notes"]');if(notes)notes.textContent='Notes';
  }

  function ensurePanels(){
    if(!document.getElementById('tab-bookings')){const p=document.createElement('section');p.id='tab-bookings';p.className='tab-panel';p.innerHTML='<article class="panel-card"><div class="panel-head-row"><div><h2>Booked Courses</h2><p class="muted">Upcoming and previous course bookings linked to this person.</p></div></div><div id="bookedCoursesList" class="record-list"></div></article>';document.getElementById('tab-overview')?.insertAdjacentElement('afterend',p)}
    if(!document.getElementById('tab-compliance')){const p=document.createElement('section');p.id='tab-compliance';p.className='tab-panel';p.innerHTML='<div id="complianceProfileHost"></div>';document.getElementById('tab-accreditations')?.insertAdjacentElement('beforebegin',p)}
  }

  function setMetric(id,label,value){const valueEl=document.getElementById(id);if(!valueEl)return;const card=valueEl.closest('.metric');const labelEl=card?.querySelector('span');if(labelEl)labelEl.textContent=label;valueEl.textContent=value}

  function renderLearningHome(){
    const overview=document.getElementById('tab-overview');if(!overview)return;
    const stats=overview.querySelector('.profile-grid');const today=new Date();today.setHours(0,0,0,0);
    const upcoming=bookedCourses.filter(b=>b.start_date&&new Date(b.start_date+'T00:00:00')>=today).length;
    const assignedOpen=(typeof assignments!=='undefined'?assignments:[]).filter(x=>x.status!=='completed').length;
    setMetric('statAccreditations','Upcoming Bookings',upcoming);setMetric('statAssignments','Assigned Learning',assignedOpen);setMetric('statAttempts','Completed Assessments',typeof attempts!=='undefined'?attempts.length:0);setMetric('statCertificates','Accreditations',typeof accreditations!=='undefined'?accreditations.length:0);
    let learning=document.getElementById('learningHome');if(!learning){learning=document.createElement('div');learning.id='learningHome';learning.className='two-col';if(stats)stats.insertAdjacentElement('afterend',learning);else overview.prepend(learning)}
    const upcomingRows=bookedCourses.filter(b=>!b.start_date||new Date(b.start_date+'T23:59:59')>=new Date()).slice(0,4);const assigned=(typeof assignments!=='undefined'?assignments:[]).filter(x=>x.status!=='completed').slice(0,4);const courseName=id=>typeof courses!=='undefined'?(courses.find(c=>String(c.id)===String(id))?.title||`Course ${id}`):`Course ${id}`;
    learning.innerHTML=`<article class="panel-card"><div class="panel-head-row"><div><h2>Upcoming Booked Courses</h2><p class="muted">Training already booked for this person.</p></div></div><div class="record-list">${upcomingRows.length?upcomingRows.map(b=>`<div class="record"><div><strong>${escHtml(b.course_title||'Booked course')}</strong><small>${fmtDate(b.start_date)}${b.end_date&&b.end_date!==b.start_date?' – '+fmtDate(b.end_date):''} · ${escHtml(b.location||b.location_address||'Location TBC')}</small></div><strong>${escHtml(b.status||'booked')}</strong></div>`).join(''):'<div class="empty">No upcoming booked courses.</div>'}</div></article><article class="panel-card"><div class="panel-head-row"><div><h2>Assigned Learning</h2><p class="muted">Online or internal learning currently assigned.</p></div></div><div class="record-list">${assigned.length?assigned.map(a=>`<div class="record"><div><strong>${escHtml(courseName(a.course_id))}</strong><small>Due ${fmtDate(a.due_date)} · Assigned ${fmtDate(a.assigned_at)}</small></div><strong>${escHtml(a.status||'assigned')}</strong></div>`).join(''):'<div class="empty">No learning currently assigned.</div>'}</div></article>`;
  }

  function moveComplianceManagement(){
    const host=document.getElementById('complianceProfileHost');if(!host)return;const manager=document.getElementById('managerPanel'),roles=document.getElementById('jobRolePanel'),snapshot=document.getElementById('complianceSnapshot');if(manager&&manager.parentElement!==host)host.appendChild(manager);if(roles&&roles.parentElement!==host)host.appendChild(roles);let snapshotCard=document.getElementById('profileComplianceCard');if(!snapshotCard&&snapshot){snapshotCard=snapshot.closest('.panel-card');if(snapshotCard){snapshotCard.id='profileComplianceCard';const h=snapshotCard.querySelector('h2');if(h)h.textContent='Compliance Requirements'}}if(snapshotCard&&snapshotCard.parentElement!==host)host.appendChild(snapshotCard);if(manager)manager.querySelector('h2').textContent='Management & Reporting';if(roles)roles.querySelector('h2').textContent='Compliance Job Roles';
  }

  function mergeCertificatesIntoAccreditations(){const panel=document.getElementById('tab-accreditations');if(!panel)return;let certBlock=document.getElementById('profileCertificateBlock');if(!certBlock){certBlock=document.createElement('article');certBlock.id='profileCertificateBlock';certBlock.className='panel-card';certBlock.style.marginTop='16px';certBlock.innerHTML='<div class="panel-head-row"><div><h2>Course Certificates</h2><p class="muted">Certificates created from completed course activity.</p></div></div><div id="profileCertificateList" class="record-list"></div>';panel.appendChild(certBlock)}const source=document.getElementById('certificateList'),target=document.getElementById('profileCertificateList');if(source&&target)target.innerHTML=source.innerHTML}

  function renderBookedCourses(){const box=document.getElementById('bookedCoursesList');if(!box)return;if(!bookedCourses.length){box.innerHTML='<div class="empty">No course bookings are linked to this person yet.</div>';return}box.innerHTML=bookedCourses.map(b=>{const a=b.attendee||{};const address=[b.location,b.location_address,b.location_postcode].filter(Boolean).join(' · ');return `<div class="record"><div><strong>${escHtml(b.course_title||'Booked course')}</strong><small>${fmtDate(b.start_date)}${b.end_date&&b.end_date!==b.start_date?' – '+fmtDate(b.end_date):''}${address?' · '+escHtml(address):''}${b.booking_reference?' · '+escHtml(b.booking_reference):''}</small></div><div style="text-align:right"><strong>${escHtml(b.status||'booked')}</strong>${a.attendance_status?`<small>${escHtml(a.attendance_status)}${a.outcome?' · '+escHtml(a.outcome):''}</small>`:''}</div></div>`}).join('')}

  function wireTabs(){document.querySelectorAll('.tabs [data-tab]').forEach(btn=>{if(btn.dataset.solidProfileWired)return;btn.dataset.solidProfileWired='1';btn.addEventListener('click',()=>{document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));btn.classList.add('active');document.getElementById('tab-'+btn.dataset.tab)?.classList.add('active')})})}

  async function apply(){try{await loadBookedCourses()}catch(e){bookedCourses=[];console.warn('Booked courses unavailable',e)}ensureBookedTab();ensurePanels();renderLearningHome();moveComplianceManagement();mergeCertificatesIntoAccreditations();renderBookedCourses();wireTabs();compactTopActions()}

  const start=()=>{setTimeout(apply,180);setTimeout(compactTopActions,700);setTimeout(compactTopActions,1600)};window.addEventListener('load',start);if(document.readyState==='complete'||document.readyState==='interactive')start();if(typeof render==='function'){const prior=render;render=async function(){const r=await prior.apply(this,arguments);setTimeout(apply,80);return r}}
})();
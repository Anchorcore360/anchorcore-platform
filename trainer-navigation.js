(function(){
  if(window.__rrtaTrainerNavigationLoaded)return;
  window.__rrtaTrainerNavigationLoaded=true;

  const icons={
    dashboard:'<svg viewBox="0 0 24 24"><path d="M3 13h7V3H3zM14 21h7V11h-7zM3 21h7v-4H3zM14 7h7V3h-7z"/></svg>',
    people:'<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    courses:'<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    training:'<svg viewBox="0 0 24 24"><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 14h3M13 14h3M8 18h3"/></svg>',
    compliance:'<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    tools:'<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    company:'<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 10h2M13 10h2M9 14h2M13 14h2"/></svg>',
    calendar:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    bookings:'<svg viewBox="0 0 24 24"><path d="M6 2h9l3 3v17H6z"/><path d="M9 10h6M9 14h6M9 18h4"/></svg>',
    assess:'<svg viewBox="0 0 24 24"><path d="M9 11l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>',
    matrix:'<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM4 10h16M10 4v16"/></svg>',
    teams:'<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 21a6 6 0 0 1 12 0M13 21a5 5 0 0 1 9 0"/></svg>',
    review:'<svg viewBox="0 0 24 24"><path d="M4 4h16v14H7l-3 3z"/><path d="M8 9h8M8 13h5"/></svg>',
    upload:'<svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 14v6h14v-6"/></svg>',
    settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A7 7 0 0 0 15 6l-.3-2.6h-4L10.4 6A7 7 0 0 0 8.8 7L6.4 6l-2 3.4L6.5 11a7 7 0 0 0 0 2l-2.1 1.5 2 3.4 2.4-1a7 7 0 0 0 1.6 1l.3 2.6h4L15 18a7 7 0 0 0 1.6-1l2.4 1 2-3.4-2.1-1.5c.1-.4.1-.7.1-1.1z"/></svg>'
  };
  const icon=n=>`<span class="rrta-nav-icon">${icons[n]||icons.tools}</span>`;
  const path=(location.pathname.split('/').pop()||'trainer.html').toLowerCase();
  const is=(...names)=>names.includes(path);

  function closeAll(){document.querySelectorAll('.nav-group.open,.rrta-nav-group.open').forEach(g=>g.classList.remove('open'));document.getElementById('portalShell')?.classList.remove('nav-wide')}

  function patchTrainerHome(){
    const side=document.getElementById('trainerSidebar');if(!side)return false;
    const training=side.querySelector('[data-group="training"]');
    if(training){
      const course=training.querySelector('[data-view="courses"]');
      if(course)course.remove();
      if(!side.querySelector('[data-standalone-courses]')){
        const btn=document.createElement('button');btn.className='side-link';btn.dataset.view='courses';btn.dataset.standaloneCourses='1';btn.innerHTML=icon('courses')+'<span>Courses</span>';
        training.insertAdjacentElement('beforebegin',btn);
        btn.addEventListener('click',()=>{document.querySelectorAll('.trainer-view').forEach(v=>v.classList.remove('active'));document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));document.getElementById('view-courses')?.classList.add('active');btn.classList.add('active');location.hash='courses';closeAll()});
      }
    }
    const map={
      'Manage Learners':'user','External Customers':'company','Training Schedule':'calendar','Booked Courses':'bookings','Assessments':'assess',
      'Operatives':'user','Job Role Matrix':'matrix','Manage Teams':'teams','Reviews & Requests':'review','Bulk Learner Upload':'upload','Bulk Accreditation Upload':'upload'
    };
    side.querySelectorAll('.nav-subitem').forEach(el=>{if(!el.querySelector('.rrta-nav-icon'))el.insertAdjacentHTML('afterbegin',icon(map[el.textContent.trim()]||'tools'));el.addEventListener('click',()=>setTimeout(closeAll,0))});
    side.querySelectorAll('.nav-parent').forEach(el=>{const label=el.querySelector('.nav-label')?.textContent.trim();if(!el.querySelector('.rrta-nav-icon'))el.insertAdjacentHTML('afterbegin',icon(label==='People'?'people':label==='Training'?'training':label==='Compliance'?'compliance':'tools'))});
    side.querySelectorAll('[data-view="learners"],[data-view="courses"]').forEach(el=>el.addEventListener('click',()=>setTimeout(closeAll,0)));
    document.addEventListener('click',e=>{if(!e.target.closest('#trainerSidebar .nav-group'))closeAll()});
    return true;
  }

  function standaloneMarkup(){
    const active=(hrefs)=>hrefs.some(x=>path===x)?' active':'';
    return `<div class="rrta-side-brand"><img src="rrta-logo.png" alt="RRTA"></div><div class="sidebar-section-label">Workspace</div>
      <a class="rrta-side-link${active(['trainer.html'])}" href="trainer.html">${icon('dashboard')}<span>Dashboard</span></a>
      <div class="rrta-nav-group"><button class="rrta-nav-parent" type="button">${icon('people')}<span>People</span><b>›</b></button><div class="rrta-flyout"><a href="trainer.html#learners">${icon('user')}Manage Learners</a><a href="external-customers.html">${icon('company')}External Customers</a></div></div>
      <a class="rrta-side-link" href="trainer.html#courses">${icon('courses')}<span>Courses</span></a>
      <div class="rrta-nav-group"><button class="rrta-nav-parent" type="button">${icon('training')}<span>Training</span><b>›</b></button><div class="rrta-flyout"><a class="${active(['training-schedule.html'])}" href="training-schedule.html">${icon('calendar')}Training Schedule</a><a class="${active(['booked-courses.html'])}" href="booked-courses.html">${icon('bookings')}Booked Courses</a><a class="${active(['customer-service-assessment.html'])}" href="customer-service-assessment.html">${icon('assess')}Assessments</a></div></div>
      <div class="rrta-nav-group"><button class="rrta-nav-parent" type="button">${icon('compliance')}<span>Compliance</span><b>›</b></button><div class="rrta-flyout"><a class="${active(['compliance-operatives.html'])}" href="compliance-operatives.html">${icon('user')}Operatives</a><a class="${active(['compliance.html'])}" href="compliance.html">${icon('matrix')}Job Role Matrix</a><a class="${active(['compliance-teams.html'])}" href="compliance-teams.html">${icon('teams')}Manage Teams</a><a class="${active(['requests-review.html','evidence-review.html'])}" href="requests-review.html">${icon('review')}Reviews & Requests</a></div></div>
      <div class="rrta-nav-group"><button class="rrta-nav-parent" type="button">${icon('tools')}<span>Tools & Uploads</span><b>›</b></button><div class="rrta-flyout"><a class="${active(['bulk-learner-upload.html'])}" href="bulk-learner-upload.html">${icon('upload')}Bulk Learner Upload</a><a class="${active(['bulk-accreditation-upload.html'])}" href="bulk-accreditation-upload.html">${icon('upload')}Bulk Accreditation Upload</a></div></div>
      <div class="rrta-standalone-account"><a class="rrta-side-link" href="trainer.html">${icon('settings')}<span>Settings</span></a></div>`;
  }

  function injectStyles(){if(document.getElementById('rrtaUnifiedNavStyles'))return;const s=document.createElement('style');s.id='rrtaUnifiedNavStyles';s.textContent=`
  .rrta-nav-icon{width:19px;height:19px;flex:0 0 19px;display:inline-grid;place-items:center}.rrta-nav-icon svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  #trainerSidebar .nav-subitem{display:flex!important;align-items:center!important;gap:10px!important}.rrta-side-brand{height:66px;display:flex;align-items:center;padding:4px 10px 14px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:10px}.rrta-side-brand img{width:154px!important;max-height:50px!important;object-fit:contain;filter:brightness(0) invert(1);margin:0!important}
  .side.rrta-unified-side{position:sticky;top:0;height:100vh;width:248px;box-sizing:border-box;background:linear-gradient(180deg,#151a22,#1e2530)!important;color:#d8dee7!important;padding:16px 12px 14px!important;overflow:visible!important;z-index:30;box-shadow:8px 0 30px rgba(0,0,0,.08)}
  .shell.rrta-unified-shell{grid-template-columns:248px minmax(0,1fr)!important}.side.rrta-unified-side .sidebar-section-label{padding:14px 12px 6px;color:#7e8997;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
  .rrta-side-link,.rrta-nav-parent{position:relative;width:100%;box-sizing:border-box;border:0;background:transparent;color:#c7ced8!important;display:flex!important;align-items:center;gap:12px;padding:11px 12px!important;border-radius:10px!important;margin:2px 0!important;text-decoration:none!important;text-align:left;font-weight:680;transition:.2s ease}.rrta-side-link:hover,.rrta-nav-parent:hover{background:rgba(255,255,255,.075)!important;color:#fff!important;transform:translateX(2px)}.rrta-side-link.active{background:linear-gradient(90deg,rgba(178,15,34,.98),rgba(120,17,31,.82))!important;color:#fff!important}.rrta-nav-group{position:relative}.rrta-nav-parent{cursor:pointer}.rrta-nav-parent span:nth-child(2){flex:1}.rrta-nav-parent b{font-size:18px;margin-left:auto;transition:transform .2s}.rrta-nav-group.open>.rrta-nav-parent{background:rgba(255,255,255,.08)!important;color:#fff!important}.rrta-nav-group.open>.rrta-nav-parent b{transform:translateX(2px)}
  .rrta-flyout{position:absolute;left:calc(100% + 12px);top:-4px;width:255px;padding:8px;background:linear-gradient(180deg,#1e2530,#151a22);border:1px solid rgba(255,255,255,.12);border-radius:13px;box-shadow:0 18px 45px rgba(0,0,0,.28);opacity:0;visibility:hidden;pointer-events:none;transform:translateX(-10px) scale(.985);transition:opacity .18s ease,transform .22s ease,visibility .18s ease;z-index:80}.rrta-nav-group.open>.rrta-flyout{opacity:1;visibility:visible;pointer-events:auto;transform:none}.rrta-flyout a{display:flex!important;align-items:center;gap:10px;color:#aeb7c2!important;text-decoration:none!important;padding:10px 12px!important;border-radius:9px!important;margin:2px 0!important;font-size:12px!important;font-weight:680}.rrta-flyout a:hover,.rrta-flyout a.active{background:rgba(255,255,255,.08)!important;color:#fff!important}.rrta-flyout a.active{background:linear-gradient(90deg,rgba(178,15,34,.98),rgba(120,17,31,.82))!important}.rrta-standalone-account{position:absolute;left:12px;right:12px;bottom:14px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px}
  @media(max-width:1000px){.side.rrta-unified-side{display:none!important}.shell.rrta-unified-shell{grid-template-columns:1fr!important}}
  `;document.head.appendChild(s)}

  function patchStandalone(){const side=document.querySelector('.side,.booking-side');if(!side)return false;injectStyles();side.classList.add('rrta-unified-side');side.closest('.shell')?.classList.add('rrta-unified-shell');side.innerHTML=standaloneMarkup();side.querySelectorAll('.rrta-nav-parent').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();const g=btn.closest('.rrta-nav-group'),opening=!g.classList.contains('open');side.querySelectorAll('.rrta-nav-group').forEach(x=>x.classList.remove('open'));if(opening)g.classList.add('open')}));side.querySelectorAll('.rrta-flyout a').forEach(a=>a.addEventListener('click',()=>side.querySelectorAll('.rrta-nav-group').forEach(g=>g.classList.remove('open'))));document.addEventListener('click',e=>{if(!e.target.closest('.rrta-nav-group'))side.querySelectorAll('.rrta-nav-group').forEach(g=>g.classList.remove('open'))});return true}

  injectStyles();
  patchTrainerHome()||patchStandalone();
})();
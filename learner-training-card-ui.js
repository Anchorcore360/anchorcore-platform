(function(){
  const eye='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.6"/></svg>';
  const doc='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>';
  const css=document.createElement('style');
  css.textContent=`
  .learner-training-head,.learner-training-row{display:grid;grid-template-columns:minmax(300px,1.6fr) 125px minmax(180px,.8fr) 115px minmax(155px,.7fr);gap:16px;align-items:center}
  .learner-training-head{padding:0 14px 8px;font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.05em;color:#6b7788}
  .learner-training-list{display:grid;gap:8px}
  .learner-training-row{min-height:64px;padding:12px 14px;border:1px solid #dce3ea;border-radius:10px;background:#eef6ff}
  .learner-training-row:nth-child(even){background:#fff1f2}
  .learner-training-title{font-size:12px;font-weight:850;color:#263746}
  .learner-training-meta{font-size:9px;color:#667085;margin-top:4px}
  .learner-training-date,.learner-training-location{font-size:11px;font-weight:750;color:#526477}
  .learner-training-status{display:inline-flex;width:max-content;padding:6px 10px;border-radius:999px;background:#def3e5;color:#176b37;font-size:9px;font-weight:850;text-transform:capitalize}
  .learner-training-status.completed{background:#e7eff9;color:#31558f}
  .learner-training-actions{display:flex;justify-content:flex-start;gap:7px;flex-wrap:wrap}
  .learner-view-btn{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid #cbd5df;border-radius:8px;background:#fff;color:#263746;text-decoration:none;font-size:9px;font-weight:850;white-space:nowrap}
  .learner-view-btn:hover{background:#eef3f7}.learner-view-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.9}
  .learner-no-action{color:#98a2b3;font-size:9px}
  .overview-joining-action{display:inline-flex;align-items:center;gap:6px}.overview-joining-action svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.9}
  @media(max-width:850px){.learner-training-head{display:none}.learner-training-row{grid-template-columns:1fr 1fr}.learner-training-row>div:first-child{grid-column:1/-1}.learner-training-actions{grid-column:1/-1}}
  @media(max-width:560px){.learner-training-row{grid-template-columns:1fr}}
  `;
  document.head.appendChild(css);
  function e(v){return typeof esc==='function'?esc(v):String(v??'')}
  function f(d){return typeof fmt==='function'?fmt(d):(d||'—')}
  function joiningAction(b){
    const has=!!b?.courses?.joining_instructions_path;
    const released=!!(b?.joining_instructions_sent_at||has);
    if(!released)return '<span class="learner-no-action">Not released</span>';
    const href=has?`learner-joining-file.html?booking=${encodeURIComponent(b.id)}`:`joining-instructions-view.html?booking=${encodeURIComponent(b.id)}`;
    return `<a class="learner-view-btn" href="${href}" title="View joining instructions">${eye}<span>View Joining Instructions</span></a>`;
  }
  function renderTraining(){
    const target=document.getElementById('trainingBody');
    if(!target||typeof bookingRows==='undefined'||typeof records==='undefined')return false;
    const bookings=(bookingRows||[]).filter(b=>String(b.status||'').toLowerCase()!=='cancelled').sort((a,b)=>String(a.start_date||'').localeCompare(String(b.start_date||'')));
    const history=(records||[]).filter(r=>!bookings.some(b=>String(b.course_title||'').trim()===String(r.course_title||'').trim()&&String(b.start_date||'')===String(r.training_date||'')));
    const rows=[
      ...bookings.map(b=>({kind:'booking',title:b.course_title||'Training Course',date:b.start_date,location:b.location||'Location TBC',status:String(b.status||'Booked').toLowerCase(),b})),
      ...history.map(r=>({kind:'record',title:r.course_title||'Training',date:r.training_date,location:r.location||'—',status:String(r.completion_status||'Completed').toLowerCase(),r}))
    ];
    target.innerHTML=rows.length?`<div class="learner-training-head"><span>Course / Training</span><span>Date</span><span>Location</span><span>Status</span><span>Actions</span></div><div class="learner-training-list">${rows.map((x,i)=>`<div class="learner-training-row"><div><div class="learner-training-title">${e(x.title)}</div><div class="learner-training-meta">${x.kind==='booking'?'RRTA course booking':'Training record'}</div></div><div class="learner-training-date">${f(x.date)}</div><div class="learner-training-location">${e(x.location)}</div><div><span class="learner-training-status ${x.kind==='record'?'completed':''}">${e(x.status==='confirmed'?'Confirmed':x.status.replaceAll('_',' '))}</span></div><div class="learner-training-actions">${x.kind==='booking'?joiningAction(x.b):'<span class="learner-no-action">Completed record</span>'}</div></div>`).join('')}</div>`:'<div class="empty">No training records yet.</div>';
    return true;
  }
  function decorateOverview(){
    const box=document.getElementById('overviewBookings'); if(!box)return;
    box.querySelectorAll('a.joining-btn').forEach(a=>{a.classList.remove('btn','joining-btn');a.classList.add('learner-view-btn','overview-joining-action');if(!a.querySelector('svg'))a.insertAdjacentHTML('afterbegin',eye);});
  }
  let tries=0;const timer=setInterval(()=>{const ok=renderTraining();decorateOverview();if(ok||++tries>80)clearInterval(timer)},100);
  window.addEventListener('hashchange',()=>{setTimeout(()=>{renderTraining();decorateOverview()},0)});
})();
(function(){
  const style=document.createElement('style');
  style.textContent=`
  #view-compliance .req{cursor:pointer;transition:transform .12s ease,box-shadow .12s ease}
  #view-compliance .req:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(15,23,42,.08)}
  #view-compliance .booked-courses-panel{margin-top:16px;background:#fff;border:1px solid #d9dee5;border-radius:12px;padding:18px}
  #view-compliance .booked-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin-top:12px}
  #view-compliance .booked-card{border:1px solid #e1e5e9;border-radius:9px;background:#fafbfc;padding:13px}
  #view-compliance .booked-card h3{font-size:14px;margin:0 0 7px}.booked-card small{display:block;color:#667085;line-height:1.45}
  .learner-modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.48);z-index:2500;display:flex;align-items:center;justify-content:center;padding:20px}
  .learner-modal{width:min(540px,100%);background:#fff;border-radius:14px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.25)}
  .learner-modal-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;border-bottom:1px solid #e4e7ec;padding-bottom:14px;margin-bottom:14px}
  .learner-modal-head h2{margin:4px 0 0}.learner-modal-close{border:0;background:transparent;font-size:24px;cursor:pointer;line-height:1}
  .learner-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.learner-modal-detail{background:#f7f8fa;border:1px solid #e4e7ec;border-radius:8px;padding:11px}.learner-modal-detail span{display:block;color:#667085;font-size:11px;margin-bottom:4px}.learner-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px}
  @media(max-width:600px){.learner-modal-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  let accreditationRows=[];
  const esc2=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const fmt2=d=>d?new Date(d+'T00:00:00').toLocaleDateString('en-GB'):'—';
  const codeOf=x=>(String(x||'').toUpperCase().match(/\b(?:SA\d+[A-Z]?|S\d{3}|O\d+|LA|EFAW|IPAF\s*1B)\b/)||[])[0]?.replace(/\s/g,'');
  function findAccred(title){
    const code=codeOf(title);
    if(code){const hit=accreditationRows.find(a=>codeOf(a.accreditation_name)===code);if(hit)return hit}
    const norm=x=>String(x||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    const t=norm(title);
    return accreditationRows.find(a=>{const n=norm(a.accreditation_name);return n&&(t.includes(n)||n.includes(t))})||null;
  }
  async function openCertificate(path){
    if(!path)return;
    const {data,error}=await db.storage.from('learner-documents').createSignedUrl(path,300);
    if(error||!data?.signedUrl)return alert(error?.message||'Unable to open certificate.');
    window.open(data.signedUrl,'_blank','noopener');
  }
  function closeModal(){document.querySelector('.learner-modal-backdrop')?.remove()}
  function showAccreditation(title,acc){
    closeModal();
    const wrap=document.createElement('div');wrap.className='learner-modal-backdrop';
    const status=acc?((acc.expiry_date&&new Date(acc.expiry_date+'T23:59:59')<new Date())?'Expired':'Valid'):'Missing';
    wrap.innerHTML=`<div class="learner-modal" role="dialog" aria-modal="true"><div class="learner-modal-head"><div><div class="eyebrow">Qualification Details</div><h2>${esc2(title)}</h2></div><button class="learner-modal-close" aria-label="Close">×</button></div>${acc?`<div class="learner-modal-grid"><div class="learner-modal-detail"><span>Accreditation Held</span><strong>${esc2(acc.accreditation_name||title)}</strong></div><div class="learner-modal-detail"><span>Status</span><strong>${status}</strong></div><div class="learner-modal-detail"><span>Awarding Body</span><strong>${esc2(acc.awarding_body||'—')}</strong></div><div class="learner-modal-detail"><span>Certificate Number</span><strong>${esc2(acc.certificate_number||'—')}</strong></div><div class="learner-modal-detail"><span>Issue Date</span><strong>${fmt2(acc.issue_date)}</strong></div><div class="learner-modal-detail"><span>Expiry Date</span><strong>${fmt2(acc.expiry_date)}</strong></div></div><div class="learner-modal-actions">${acc.certificate_url?'<button class="btn dark" id="viewLearnerCertificate">View Certificate</button>':'<span class="muted">No Certificate File Stored</span>'}</div>`:`<div class="info-box" style="margin-top:0"><strong>Qualification Not Currently Held</strong><br>This qualification is required for your job role but no matching accreditation is recorded on your profile.</div>`}</div>`;
    document.body.appendChild(wrap);
    wrap.querySelector('.learner-modal-close').onclick=closeModal;
    wrap.onclick=e=>{if(e.target===wrap)closeModal()};
    wrap.querySelector('#viewLearnerCertificate')?.addEventListener('click',()=>openCertificate(acc.certificate_url));
  }
  async function loadAccreditations(){
    if(typeof profile==='undefined'||!profile?.id)return;
    const {data,error}=await db.from('accreditations').select('accreditation_name,awarding_body,certificate_number,issue_date,expiry_date,certificate_url,status').eq('learner_id',profile.id);
    if(!error)accreditationRows=data||[];
  }
  function wireTiles(){
    document.querySelectorAll('#view-compliance .req').forEach(tile=>{
      if(tile.dataset.detailWired)return;
      tile.dataset.detailWired='1';tile.setAttribute('tabindex','0');tile.setAttribute('role','button');
      const activate=()=>{const title=tile.querySelector('strong')?.textContent.trim()||'Qualification';showAccreditation(title,findAccred(title))};
      tile.addEventListener('click',activate);tile.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}});
    });
  }
  async function loadBookedCourses(){
    if(typeof profile==='undefined'||!profile?.id)return;
    const {data,error}=await db.from('training_records').select('course_title,booking_reference,training_date,end_date,completion_status,location').eq('learner_id',profile.id).in('completion_status',['booked','in_progress']).order('training_date',{ascending:true});
    if(error)return;
    const content=document.getElementById('complianceContent');if(!content)return;
    let panel=document.getElementById('learnerBookedCourses');
    if(!panel){panel=document.createElement('section');panel.id='learnerBookedCourses';panel.className='booked-courses-panel';content.appendChild(panel)}
    const rows=data||[];
    panel.innerHTML=`<div><div class="eyebrow">Upcoming / Current Training</div><h2 style="margin:4px 0">Booked Courses</h2><p class="muted" style="margin:0">Courses you are currently booked onto through RRTA.</p></div>${rows.length?`<div class="booked-list">${rows.map(r=>`<article class="booked-card"><h3>${esc2(r.course_title||'RRTA Course')}</h3><small><strong>Status:</strong> ${esc2(String(r.completion_status||'booked').replace('_',' '))}</small><small><strong>Date:</strong> ${fmt2(r.training_date)}${r.end_date&&r.end_date!==r.training_date?' – '+fmt2(r.end_date):''}</small><small><strong>Location:</strong> ${esc2(r.location||'TBC')}</small><small><strong>Booking:</strong> ${esc2(r.booking_reference||'—')}</small></article>`).join('')}</div>`:'<div class="empty" style="margin-top:12px">No Booked Courses At Present.</div>'}`;
  }
  async function enhance(){
    if(typeof profile==='undefined'||!profile?.id)return;
    await loadAccreditations();wireTiles();await loadBookedCourses();
  }
  const target=document.getElementById('view-compliance');
  if(target)new MutationObserver(()=>{wireTiles();if(!document.getElementById('learnerBookedCourses'))loadBookedCourses()}).observe(target,{childList:true,subtree:true});
  window.addEventListener('load',()=>setTimeout(enhance,500));
  setTimeout(enhance,1000);
})();
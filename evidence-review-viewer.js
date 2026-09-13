(function(){
  if(window.__rrtaEvidenceViewerLoaded)return;window.__rrtaEvidenceViewerLoaded=true;
  const style=document.createElement('style');
  style.textContent=`
    .rrta-evidence-modal{position:fixed;inset:0;z-index:2147483600;background:rgba(10,15,22,.72);display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(3px)}
    .rrta-evidence-modal-panel{width:min(1180px,96vw);height:min(860px,94vh);background:#fff;border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.38);display:grid;grid-template-rows:auto 1fr auto;overflow:hidden}
    .rrta-evidence-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;padding:18px 20px;border-bottom:1px solid #e4e7eb;background:#fff}
    .rrta-evidence-modal-head h2{margin:4px 0 0;font-size:20px;color:#18202a}.rrta-evidence-modal-head p{margin:5px 0 0;color:#6f7a88;font-size:11px}.rrta-evidence-close{border:0;background:#eef1f4;width:36px;height:36px;border-radius:50%;font-size:20px;cursor:pointer;color:#18202a}
    .rrta-evidence-stage{background:#eef1f4;min-height:0;display:grid;place-items:center;overflow:auto;padding:18px}.rrta-evidence-stage iframe{width:100%;height:100%;min-height:620px;border:0;background:#fff;border-radius:8px}.rrta-evidence-stage img{display:block;max-width:100%;max-height:100%;object-fit:contain;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.12)}
    .rrta-evidence-loading{font-size:12px;font-weight:800;color:#586474;background:#fff;border-radius:10px;padding:14px 18px}.rrta-evidence-modal-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 18px;border-top:1px solid #e4e7eb;background:#fff}.rrta-evidence-note{font-size:10px;color:#6f7a88}.rrta-evidence-open{display:inline-flex;align-items:center;text-decoration:none;background:#20262d;color:#fff;border-radius:8px;padding:9px 12px;font-size:10px;font-weight:850}
    .rrta-receipt-panel{background:#fff;border:1px solid #e2e6ea;border-radius:14px;box-shadow:0 10px 24px rgba(18,24,33,.05);padding:20px;margin-bottom:16px}.rrta-receipt-panel h2{margin:4px 0 5px}.rrta-receipt-list{display:grid;gap:9px;margin-top:14px}.rrta-receipt-item{border:1px solid #e5e8ec;border-radius:10px;background:#fafbfc;padding:12px 13px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center}.rrta-receipt-item strong{display:block;font-size:12px}.rrta-receipt-item p{margin:4px 0 0;color:#6f7a88;font-size:10px;line-height:1.45}.rrta-read-pill{display:inline-flex;align-items:center;border-radius:999px;padding:6px 9px;font-size:9px;font-weight:850;white-space:nowrap}.rrta-read-pill.read{background:#e8f6ed;color:#176b37}.rrta-read-pill.unread{background:#fff3d8;color:#8a6100}.rrta-receipt-status{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
    @media(max-width:700px){.rrta-evidence-modal{padding:8px}.rrta-evidence-modal-panel{width:100%;height:96vh;border-radius:12px}.rrta-evidence-stage{padding:8px}.rrta-evidence-stage iframe{min-height:560px}.rrta-evidence-modal-foot{align-items:flex-start;flex-direction:column}.rrta-receipt-item{grid-template-columns:1fr}.rrta-receipt-status{justify-content:flex-start}}
  `;
  document.head.appendChild(style);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let client=null;
  function getClient(){
    if(client)return client;
    if(!window.supabase?.createClient)return null;
    client=window.supabase.createClient('https://qgbpotjqggeodxqcwkgj.supabase.co','sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS');
    return client;
  }
  function modal(){
    let m=document.querySelector('.rrta-evidence-modal');
    if(m)return m;
    m=document.createElement('div');m.className='rrta-evidence-modal';
    m.innerHTML=`<div class="rrta-evidence-modal-panel" role="dialog" aria-modal="true" aria-label="Uploaded certificate viewer"><div class="rrta-evidence-modal-head"><div><div style="font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#b20f22">Uploaded Evidence</div><h2 data-ev-title>Certificate Preview</h2><p data-ev-meta>Loading certificate…</p></div><button class="rrta-evidence-close" type="button" aria-label="Close">×</button></div><div class="rrta-evidence-stage"><div class="rrta-evidence-loading">Loading uploaded certificate…</div></div><div class="rrta-evidence-modal-foot"><span class="rrta-evidence-note">Check learner name, qualification, certificate number, awarding body and dates before approving.</span><a class="rrta-evidence-open" data-ev-open href="#" target="_blank" rel="noopener">Open in new tab</a></div></div>`;
    document.body.appendChild(m);
    const close=()=>m.remove();m.querySelector('.rrta-evidence-close').onclick=close;m.addEventListener('click',e=>{if(e.target===m)close()});
    document.addEventListener('keydown',function key(e){if(e.key==='Escape'&&document.body.contains(m)){m.remove();document.removeEventListener('keydown',key)}});
    return m;
  }
  async function showEvidence(id){
    const db=getClient();if(!db){alert('Certificate viewer is still loading. Please try again.');return;}
    const m=modal(),stage=m.querySelector('.rrta-evidence-stage');
    try{
      const {data:r,error}=await db.from('evidence_review_requests').select('id,learner_id,qualification_name,awarding_body,certificate_number,issue_date,expiry_date,evidence_path,profiles:learner_id(full_name)').eq('id',id).single();
      if(error)throw error;if(!r?.evidence_path)throw new Error('No uploaded evidence file is attached to this request.');
      const signed=await db.storage.from('learner-documents').createSignedUrl(r.evidence_path,1800);
      if(signed.error)throw signed.error;const url=signed.data?.signedUrl;if(!url)throw new Error('Could not create a secure certificate link.');
      m.querySelector('[data-ev-title]').textContent=`${r.profiles?.full_name||'Learner'} · ${r.qualification_name||'Certificate'}`;
      m.querySelector('[data-ev-meta]').textContent=[r.awarding_body,r.certificate_number?`Certificate ${r.certificate_number}`:'',r.expiry_date?`Expires ${new Date(r.expiry_date+'T12:00:00').toLocaleDateString('en-GB')}`:''].filter(Boolean).join(' · ');
      m.querySelector('[data-ev-open]').href=url;
      const path=String(r.evidence_path).toLowerCase();
      if(/\.(png|jpe?g|webp|gif|bmp)(\?|$)/.test(path))stage.innerHTML=`<img src="${esc(url)}" alt="Uploaded certificate for ${esc(r.profiles?.full_name||'learner')}">`;
      else stage.innerHTML=`<iframe src="${esc(url)}#toolbar=1&navpanes=0" title="Uploaded certificate preview"></iframe>`;
    }catch(err){stage.innerHTML=`<div class="rrta-evidence-loading" style="color:#b42318">${esc(err.message||'Unable to open uploaded evidence.')}</div>`;m.querySelector('[data-ev-open]').style.display='none';}
  }
  function fmtDateTime(v){return v?new Date(v).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'}):''}
  async function loadReceipts(){
    const db=getClient();if(!db)return setTimeout(loadReceipts,250);
    const evidenceHost=document.getElementById('evidenceRequests')?.closest('.panel');if(!evidenceHost)return setTimeout(loadReceipts,250);
    const {data,error}=await db.from('evidence_review_requests').select('id,qualification_name,reviewer_note,reviewed_at,learner_read_at,manager_read_at,submitted_by_role,profiles:learner_id(full_name)').eq('status','rejected').order('reviewed_at',{ascending:false}).limit(20);
    if(error)return;
    document.getElementById('rrtaEvidenceReceipts')?.remove();
    const panel=document.createElement('section');panel.id='rrtaEvidenceReceipts';panel.className='rrta-receipt-panel';
    panel.innerHTML=`<div style="font-size:10px;color:#b20f22;font-weight:900;text-transform:uppercase;letter-spacing:.11em">Returned Evidence</div><h2>Read Receipts</h2><p style="margin:0;color:#6f7a88;font-size:11px">Shows whether the operative and, where relevant, their manager have opened the Academy feedback.</p><div class="rrta-receipt-list">${(data||[]).length?(data||[]).map(r=>`<div class="rrta-receipt-item"><div><strong>${esc(r.profiles?.full_name||'Learner')} · ${esc(r.qualification_name||'Qualification')}</strong><p>${esc(r.reviewer_note||'No reviewer note')}</p><p>Returned ${esc(fmtDateTime(r.reviewed_at))}</p></div><div class="rrta-receipt-status"><span class="rrta-read-pill ${r.learner_read_at?'read':'unread'}">Operative: ${r.learner_read_at?'✓ Read':'Not read'}</span>${r.submitted_by_role==='manager'?`<span class="rrta-read-pill ${r.manager_read_at?'read':'unread'}">Manager: ${r.manager_read_at?'✓ Read':'Not read'}</span>`:''}</div></div>`).join(''):'<div style="padding:18px;text-align:center;color:#6f7a88;font-size:11px">No returned evidence yet.</div>'}</div>`;
    evidenceHost.insertAdjacentElement('afterend',panel);
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-view-file]');if(!b)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showEvidence(b.dataset.viewFile);
  },true);
  if(!document.querySelector('script[data-academy-evidence-submitter]')){const a=document.createElement('script');a.src='academy-evidence-submitter.js?v=20260913-1';a.dataset.academyEvidenceSubmitter='1';document.head.appendChild(a)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(loadReceipts,350));else setTimeout(loadReceipts,350);
  window.addEventListener('focus',()=>setTimeout(loadReceipts,150));
})();
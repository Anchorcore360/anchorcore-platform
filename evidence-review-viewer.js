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
    @media(max-width:700px){.rrta-evidence-modal{padding:8px}.rrta-evidence-modal-panel{width:100%;height:96vh;border-radius:12px}.rrta-evidence-stage{padding:8px}.rrta-evidence-stage iframe{min-height:560px}.rrta-evidence-modal-foot{align-items:flex-start;flex-direction:column}}
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
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-view-file]');if(!b)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showEvidence(b.dataset.viewFile);
  },true);
})();
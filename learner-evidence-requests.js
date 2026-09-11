(function(){
  const style=document.createElement('style');
  style.textContent=`
  .evidence-review-box{margin-top:14px;padding:14px;border:1px solid #dfe4e8;border-radius:10px;background:#fafbfc}
  .evidence-review-box h3{margin:0 0 5px;font-size:15px}.evidence-review-box p{margin:0;color:#667085;font-size:12px;line-height:1.45}
  .evidence-review-status{display:inline-flex;margin-top:10px;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:800;background:#fff6d8;color:#8a6100}
  .evidence-form{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.evidence-form label{font-size:11px;font-weight:800;color:#344054}.evidence-form input,.evidence-form textarea{width:100%;margin-top:5px;padding:9px 10px;border:1px solid #cfd5dd;border-radius:8px;font:inherit;box-sizing:border-box}.evidence-form .full{grid-column:1/-1}.evidence-actions{display:flex;gap:9px;justify-content:flex-end;margin-top:11px;flex-wrap:wrap}.evidence-message{font-size:12px;font-weight:700;margin-top:9px}.evidence-message.ok{color:#176b37}.evidence-message.err{color:#b42318}
  @media(max-width:600px){.evidence-form{grid-template-columns:1fr}.evidence-form .full{grid-column:auto}}
  `;
  document.head.appendChild(style);
  let pending=[];
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const norm=v=>String(v||'').trim().toUpperCase().replace(/\s+/g,' ');
  async function refreshRequests(){
    if(typeof profile==='undefined'||!profile?.id)return;
    const {data,error}=await db.from('evidence_review_requests').select('*').eq('learner_id',profile.id).order('submitted_at',{ascending:false});
    if(!error)pending=data||[];
  }
  function requestFor(title){return pending.find(r=>norm(r.qualification_name)===norm(title)&&r.status==='pending')||null}
  function decorateModal(modal){
    if(!modal||modal.dataset.evidenceWired)return;
    const title=modal.querySelector('.learner-modal-head h2')?.textContent?.trim();
    if(!title)return;
    const missingText=modal.textContent.includes('Qualification Not Currently Held');
    const expiredText=[...modal.querySelectorAll('.learner-modal-detail strong')].some(x=>x.textContent.trim()==='Expired');
    if(!missingText&&!expiredText)return;
    modal.dataset.evidenceWired='1';
    const existing=requestFor(title);
    const box=document.createElement('div');box.className='evidence-review-box';
    if(existing){
      box.innerHTML=`<h3>Evidence Under Review</h3><p>You submitted evidence for this qualification on ${new Date(existing.submitted_at).toLocaleDateString('en-GB')}. RRTA must verify and approve it before it is added to your compliance record.</p><span class="evidence-review-status">Under Review</span>`;
    }else{
      box.innerHTML=`<h3>Have Evidence For This Qualification?</h3><p>If you already hold this qualification, you can upload your certificate or evidence for RRTA to review. It will not be added to your record until an assessor verifies and approves it.</p><div class="evidence-actions"><button class="btn dark evidence-start">Upload Evidence For Review</button></div>`;
      box.querySelector('.evidence-start').onclick=()=>showForm(box,title);
    }
    modal.appendChild(box);
  }
  function showForm(box,title){
    box.innerHTML=`<h3>Submit Evidence For Review</h3><p><strong>${safe(title)}</strong> will remain marked as missing until RRTA approves the evidence.</p><div class="evidence-form"><label>Awarding Body<input id="evAwarding" placeholder="e.g. Smart Awards"></label><label>Certificate Number<input id="evNumber"></label><label>Issue Date<input id="evIssue" type="date"></label><label>Expiry Date<input id="evExpiry" type="date"></label><label class="full">Certificate / Evidence<input id="evFile" type="file" accept="application/pdf,image/jpeg,image/png" required></label><label class="full">Notes For Reviewer<textarea id="evNote" rows="3" placeholder="Optional notes"></textarea></label></div><div class="evidence-message hidden" id="evMsg"></div><div class="evidence-actions"><button class="btn secondary evidence-cancel">Cancel</button><button class="btn dark evidence-submit">Submit For Review</button></div>`;
    box.querySelector('.evidence-cancel').onclick=()=>{box.remove();document.querySelector('.learner-modal')?.removeAttribute('data-evidence-wired');decorateModal(document.querySelector('.learner-modal'))};
    box.querySelector('.evidence-submit').onclick=()=>submit(box,title);
  }
  async function submit(box,title){
    const file=box.querySelector('#evFile')?.files?.[0],msg=box.querySelector('#evMsg'),btn=box.querySelector('.evidence-submit');
    if(!file){msg.textContent='Please choose a certificate or evidence file.';msg.className='evidence-message err';return}
    if(file.size>20*1024*1024){msg.textContent='The file must be 20 MB or smaller.';msg.className='evidence-message err';return}
    btn.disabled=true;btn.textContent='Submitting…';
    const clean=file.name.replace(/[^a-zA-Z0-9._-]+/g,'_');
    const path=`${profile.id}/pending-evidence/${Date.now()}-${clean}`;
    try{
      const {error:upErr}=await db.storage.from('learner-documents').upload(path,file,{upsert:false});if(upErr)throw upErr;
      const payload={learner_id:profile.id,qualification_name:title,awarding_body:box.querySelector('#evAwarding').value.trim()||null,certificate_number:box.querySelector('#evNumber').value.trim()||null,issue_date:box.querySelector('#evIssue').value||null,expiry_date:box.querySelector('#evExpiry').value||null,evidence_path:path,learner_note:box.querySelector('#evNote').value.trim()||null,status:'pending'};
      const {data,error}=await db.from('evidence_review_requests').insert(payload).select('*').single();if(error)throw error;
      pending.unshift(data);box.innerHTML=`<h3>Evidence Under Review</h3><p>Your evidence has been submitted successfully. RRTA will review it before anything is added to your compliance record.</p><span class="evidence-review-status">Under Review</span>`;
    }catch(e){msg.textContent=e.message||'Unable to submit evidence.';msg.className='evidence-message err';btn.disabled=false;btn.textContent='Submit For Review'}
  }
  const observer=new MutationObserver(()=>{document.querySelectorAll('.learner-modal').forEach(decorateModal)});
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('load',()=>setTimeout(refreshRequests,400));
  setTimeout(refreshRequests,900);
})();
(function(){const s=document.createElement('script');s.src='learner-team.js?v=20260911-1';document.body.appendChild(s)})();
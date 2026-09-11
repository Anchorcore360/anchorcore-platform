(function(){
  async function pendingCount(){
    try{
      const [a,b]=await Promise.all([
        db.from('profile_change_requests').select('id',{count:'exact',head:true}).eq('status','pending'),
        db.from('evidence_review_requests').select('id',{count:'exact',head:true}).eq('status','pending')
      ]);
      return (a.count||0)+(b.count||0);
    }catch(_){return 0}
  }
  async function addLink(){
    const compliance=[...document.querySelectorAll('#trainerDashboardScreen .sidebar a.side-link')].find(a=>a.textContent.trim()==='Compliance');
    if(!compliance)return;
    document.querySelector('#trainerDashboardScreen .sidebar a[href="evidence-review.html"]')?.remove();
    let link=document.querySelector('#trainerDashboardScreen .sidebar a[href="requests-review.html"]');
    if(!link){
      link=document.createElement('a');link.className='side-link';link.href='requests-review.html';
      link.innerHTML='<span class="side-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h5M8 16h3"/><path d="m15 16 2 2 4-5"/></svg></span><span>Reviews &amp; Requests</span><span data-request-count style="margin-left:auto;display:none;min-width:20px;height:20px;border-radius:999px;background:#b20d1c;color:#fff;font-size:11px;font-weight:900;align-items:center;justify-content:center;padding:0 6px"></span>';
      compliance.insertAdjacentElement('afterend',link);
    }
    const n=await pendingCount();const badge=link.querySelector('[data-request-count]');
    if(badge){badge.textContent=n;badge.style.display=n?'inline-flex':'none'}
  }
  function loadBulkUpload(){
    if(document.querySelector('script[data-bulk-learner-upload]'))return;
    const s=document.createElement('script');s.src='bulk-learner-upload.js';s.dataset.bulkLearnerUpload='1';document.body.appendChild(s);
  }
  document.addEventListener('DOMContentLoaded',()=>{addLink();loadBulkUpload()});
  setTimeout(()=>{addLink();loadBulkUpload()},500);
})();
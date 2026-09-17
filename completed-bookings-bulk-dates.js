(function(){
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='certification-queue.html') return;
  const style=document.createElement('style');
  style.textContent=`.rrta-bulk-dates{display:flex;align-items:end;gap:10px;flex-wrap:wrap;padding:12px 18px;background:#f8fafc;border-bottom:1px solid #e6eaf0}.rrta-bulk-dates label{display:grid;gap:4px;color:#667085;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.03em}.rrta-bulk-dates input{height:36px;box-sizing:border-box;padding:7px 9px;border:1px solid #cbd4de;border-radius:8px;background:#fff;font:inherit;color:#18202a}.rrta-bulk-dates button{height:36px;border:0;border-radius:8px;background:#20262c;color:#fff;padding:0 13px;font-size:10px;font-weight:800;cursor:pointer}.rrta-bulk-dates button:hover{background:#11161b}.rrta-bulk-note{font-size:9px;color:#667085;align-self:center;margin-left:2px}@media(max-width:700px){.rrta-bulk-dates{align-items:stretch}.rrta-bulk-dates label{width:100%}.rrta-bulk-dates input{width:100%}}`;
  document.head.appendChild(style);
  function apply(){
    document.querySelectorAll('.course').forEach(course=>{
      const body=course.querySelector('.course-body');if(!body||body.querySelector('.rrta-bulk-dates'))return;
      const id=course.dataset.course||Math.random().toString(36).slice(2);
      const bar=document.createElement('div');bar.className='rrta-bulk-dates';
      bar.innerHTML=`<label>Issue date<input type="date" data-bulk-issue="${id}"></label><label>Expiry date<input type="date" data-bulk-expiry="${id}"></label><button type="button">Apply dates to all</button><span class="rrta-bulk-note">You can still change any learner individually afterwards.</span>`;
      bar.querySelector('button').onclick=e=>{e.stopPropagation();const issue=bar.querySelector('[data-bulk-issue]').value,expiry=bar.querySelector('[data-bulk-expiry]').value;if(!issue||!expiry){alert('Please enter both the issue date and expiry date.');return}body.querySelectorAll('.delegate').forEach(row=>{const i=row.querySelector('input[id^="issue-"]'),x=row.querySelector('input[id^="expiry-"]');if(i)i.value=issue;if(x)x.value=expiry});};
      const head=body.querySelector('.delegate-head');body.insertBefore(bar,head||body.firstChild);
    });
  }
  const obs=new MutationObserver(apply);obs.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
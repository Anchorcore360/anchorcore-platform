(function(){
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='certification-queue.html') return;
  const style=document.createElement('style');
  style.textContent=`.rrta-status-pills{display:flex;align-items:center;justify-content:flex-start;gap:6px;min-width:0}.rrta-company-pill{display:inline-flex;align-items:center;justify-content:center;padding:6px 11px;border-radius:999px;background:#e8eef5;color:#44546a;font-size:11px;font-weight:800;white-space:nowrap;max-width:150px;overflow:hidden;text-overflow:ellipsis}.delegate-head,.delegate{grid-template-columns:minmax(245px,1.35fr) minmax(190px,.9fr) 126px 145px 145px 78px!important}@media(max-width:1200px){.delegate-head,.delegate{grid-template-columns:minmax(210px,1.25fr) minmax(170px,.85fr) 105px 135px 135px 74px!important}.rrta-company-pill{max-width:125px}}@media(max-width:1000px){.delegate-head{display:none!important}.delegate{grid-template-columns:1fr 1fr!important}.rrta-status-pills{justify-content:flex-start}}@media(max-width:700px){.delegate{grid-template-columns:1fr!important}}`;
  document.head.appendChild(style);
  function apply(){
    document.querySelectorAll('.course').forEach(course=>{
      const meta=course.querySelector('.course-meta')?.textContent||'';
      const parts=meta.split('·').map(x=>x.trim()).filter(Boolean);
      const bookingCompany=parts.length>2?parts[parts.length-1]:'';
      course.querySelectorAll('.delegate').forEach(row=>{
        const status=row.children[1];
        if(!status||status.closest('.rrta-status-pills')) return;
        const info=row.querySelector('.learner .muted')?.textContent||'';
        const isInternal=info.includes('Internal learner');
        const company=isInternal?'Rapid Response Telecoms':bookingCompany;
        const wrap=document.createElement('div');wrap.className='rrta-status-pills';
        status.parentNode.insertBefore(wrap,status);wrap.appendChild(status);
        if(company){const pill=document.createElement('span');pill.className='rrta-company-pill';pill.title=company;pill.textContent=company;wrap.appendChild(pill)}
      });
    });
  }
  const obs=new MutationObserver(apply);obs.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
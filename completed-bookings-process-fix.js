(function(){
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='certification-queue.html')return;
  const style=document.createElement('style');style.textContent=`.rrta-process-all{height:36px;border:0;border-radius:8px;background:#20262c;color:#fff;padding:0 13px;font-size:10px;font-weight:800;cursor:pointer;margin-left:auto}.rrta-process-all:hover{background:#11161b}.rrta-process-all:disabled{opacity:.55;cursor:wait}`;document.head.appendChild(style);
  function fixProcessor(){
    if(typeof window.processCertificate!=='function'||window.processCertificate.__rrtaFixed)return false;
    window.processCertificate=async id=>{
      const y=window.scrollY,a=attendees.find(x=>x.id===id);if(!a)return false;const b=bookings.find(x=>x.id===a.booking_id);if(!b)return false;
      const issue=document.getElementById('issue-'+id)?.value,expiry=document.getElementById('expiry-'+id)?.value;
      if(!a.certificate_path){alert('Please upload the certificate.');return false}if(!issue){alert('Please enter the issue date.');return false}if(!expiry){alert('Please enter the expiry date.');return false}
      let accreditationId=a.accreditation_id;
      if(internal(a)){
        const learnerId=a.profile_id||a.person_id,payload={learner_id:learnerId,accreditation_name:b.course_title,certificate_number:a.certificate_number||null,issue_date:issue,expiry_date:expiry,certificate_url:a.certificate_path,status:'current'};
        let res=accreditationId?await db.from('accreditations').update(payload).eq('id',accreditationId).select('id').single():await db.from('accreditations').insert(payload).select('id').single();
        if(res.error){alert('Accreditation update failed: '+res.error.message);return false}accreditationId=res.data.id;
      }
      const upd=await db.from('booking_attendees').update({certificate_issue_date:issue,certificate_expiry_date:expiry,certificate_path:a.certificate_path,certification_status:'complete',accreditation_id:accreditationId||null}).eq('id',id);
      if(upd.error){alert('Certificate processing failed: '+upd.error.message);return false}a.certificate_issue_date=issue;a.certificate_expiry_date=expiry;a.certification_status='complete';a.accreditation_id=accreditationId||null;requestAnimationFrame(()=>scrollTo(0,y));return true;
    };window.processCertificate.__rrtaFixed=true;return true;
  }
  async function processAll(course,btn){
    const rows=[...course.querySelectorAll('.delegate')],ids=rows.map(r=>{const p=r.querySelector('button[onclick*="processCertificate"]')?.getAttribute('onclick')||'';return(p.match(/processCertificate\('([^']+)'/)||[])[1]}).filter(Boolean);
    if(!ids.length)return;const missing=ids.filter(id=>{const a=attendees.find(x=>x.id===id);return !a?.certificate_path||!document.getElementById('issue-'+id)?.value||!document.getElementById('expiry-'+id)?.value});if(missing.length){alert('Please make sure every learner has an uploaded certificate, issue date and expiry date before using Process All.');return}
    if(!confirm(`Process all ${ids.length} learner certificate${ids.length===1?'':'s'} for this course?`))return;
    btn.disabled=true;btn.textContent='Processing…';let ok=0;for(const id of ids){if(await window.processCertificate(id))ok++;else break}btn.disabled=false;btn.textContent='Process All';if(ok===ids.length){await load();alert('All learner certificates have been processed successfully.')}
  }
  function apply(){fixProcessor();document.querySelectorAll('.course').forEach(course=>{const bar=course.querySelector('.rrta-bulk-dates');if(!bar||bar.querySelector('.rrta-process-all'))return;const btn=document.createElement('button');btn.type='button';btn.className='rrta-process-all';btn.textContent='Process All';btn.onclick=e=>{e.stopPropagation();processAll(course,btn)};bar.appendChild(btn)})}
  const obs=new MutationObserver(apply);obs.observe(document.documentElement,{childList:true,subtree:true});let tries=0,t=setInterval(()=>{apply();if(window.processCertificate?.__rrtaFixed||++tries>40)clearInterval(t)},100);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
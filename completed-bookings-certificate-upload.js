(function(){
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='certification-queue.html') return;
  const style=document.createElement('style');
  style.textContent=`.rrta-uploaded-pill{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:30px;padding:5px 10px;border-radius:999px;background:#def3e5;color:#176b37;font-size:10px;font-weight:800;white-space:nowrap}.rrta-uploaded-pill svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.2}.rrta-uploading-pill{background:#e6eef9;color:#31558f}.rrta-upload-error{background:#fde8e8;color:#9b1c1c}`;
  document.head.appendChild(style);
  let client=null;
  function getClient(){if(client)return client;if(!window.supabase?.createClient)return null;client=window.supabase.createClient('https://qgbpotjqggeodxqcwkgj.supabase.co','sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS');return client}
  function pill(host,text,kind='ok'){if(!host)return;host.innerHTML=`<span class="rrta-uploaded-pill ${kind==='loading'?'rrta-uploading-pill':kind==='error'?'rrta-upload-error':''}"><svg viewBox="0 0 24 24"><path d="M5 12l4 4L19 6"/></svg>${text}</span>`}
  async function uploadNow(id,input){
    const file=input.files?.[0];if(!file)return;
    if(file.size>20*1024*1024){input.value='';alert('Certificate must be 20 MB or smaller.');return}
    const host=input.closest('.uploadfield');pill(host,'Uploading…','loading');
    const db=getClient();if(!db){pill(host,'Upload failed','error');alert('Upload service is not ready. Please refresh and try again.');return}
    const {data:a,error:ae}=await db.from('booking_attendees').select('id,booking_id,profile_id,person_id').eq('id',id).single();
    if(ae||!a){pill(host,'Upload failed','error');alert('Could not find this learner booking record.');return}
    const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const owner=a.profile_id||a.person_id||'external';
    const path=`${owner}/${a.booking_id}/${Date.now()}-${safe}`;
    const {error:ue}=await db.storage.from('learner-documents').upload(path,file,{upsert:false,contentType:file.type||undefined});
    if(ue){console.error('Certificate upload failed',ue);pill(host,'Upload failed','error');alert('Certificate upload failed: '+ue.message);return}
    const {error:de}=await db.from('booking_attendees').update({certificate_path:path,certification_status:'in_progress'}).eq('id',id);
    if(de){pill(host,'Upload failed','error');alert('Certificate was stored but the booking record could not be updated: '+de.message);return}
    pill(host,'Uploaded');
    if(typeof window.load==='function') await window.load();
  }
  function apply(){
    document.querySelectorAll('.delegate').forEach(row=>{
      const input=row.querySelector('.upload input[type=file]');if(!input||input.dataset.rrtaImmediateUpload)return;
      input.dataset.rrtaImmediateUpload='1';
      const old=input.getAttribute('onchange')||'';input.removeAttribute('onchange');
      input.addEventListener('change',e=>uploadNow((old.match(/pickFile\('([^']+)'/)||[])[1],e.currentTarget));
      const host=input.closest('.uploadfield'),name=host?.querySelector('.filename');
      if(name?.textContent.trim()==='Stored')pill(host,'Uploaded');
    });
  }
  const obs=new MutationObserver(apply);obs.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
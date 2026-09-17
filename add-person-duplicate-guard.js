(function(){
  const normal=v=>String(v||'').trim().toLowerCase();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function ready(){
    const form=document.getElementById('form');
    if(!form||!window.db) return setTimeout(ready,100);
    let approved=false,checking=false;
    const box=document.createElement('div');
    box.id='duplicateWarning'; box.className='wide'; box.style.display='none';
    box.style.cssText+=';border:1px solid #f1b7be;background:#fff6f7;border-radius:10px;padding:14px;margin-top:2px';
    const actions=form.querySelector('.actions'); form.insertBefore(box,actions);
    form.addEventListener('submit',async e=>{
      if(approved){approved=false;return}
      e.preventDefault(); e.stopImmediatePropagation(); if(checking)return; checking=true;
      const fn=normal(document.getElementById('forename')?.value),sn=normal(document.getElementById('surname')?.value),email=normal(document.getElementById('email')?.value),employee=normal(document.getElementById('employee')?.value),full=`${fn} ${sn}`.trim();
      box.style.display='none';
      try{
        const {data,error}=await db.from('profiles').select('id,full_name,email,employee_number,job_title,account_status,created_at').order('created_at',{ascending:false});
        if(error)throw error;
        const matches=(data||[]).filter(p=>normal(p.email)===email||(employee&&normal(p.employee_number)===employee)||(full&&normal(p.full_name)===full));
        if(matches.length){
          box.innerHTML=`<strong style="display:block;color:#9d0b1a;margin-bottom:5px">⚠ Possible duplicate found</strong><div style="font-size:11px;color:#475467;margin-bottom:10px">A person with the same name, email address or employee number already exists. Review the existing record before creating another account.</div>${matches.slice(0,4).map(p=>`<div style="background:#fff;border:1px solid #ead9dc;border-radius:8px;padding:10px;margin:6px 0"><strong>${esc(p.full_name||'Unnamed')}</strong><div style="font-size:10px;color:#667085">${esc(p.email||'No email')} · ${esc(p.employee_number||'No employee number')} · ${esc(p.job_title||'No job title')} · ${esc(p.account_status||'active')}</div><a href="learner-profile.html?id=${encodeURIComponent(p.id)}" style="display:inline-block;margin-top:6px;color:#9d0b1a;font-size:10px;font-weight:800">View Existing Profile →</a></div>`).join('')}<div style="margin-top:10px"><button type="button" id="dupCancel" class="btn light">Cancel New Person</button></div>`;
          box.style.display='block'; box.scrollIntoView({behavior:'smooth',block:'center'}); document.getElementById('dupCancel').onclick=()=>{box.style.display='none'}; checking=false; return;
        }
        approved=true; checking=false; form.requestSubmit();
      }catch(err){checking=false;const msg=document.getElementById('message');if(msg){msg.textContent='Duplicate check could not be completed: '+(err?.message||err);msg.className='message wide bad'}}
    },true);
  }
  ready();
})();
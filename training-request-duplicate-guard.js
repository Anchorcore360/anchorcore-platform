(function(){
  if(window.__rrtaTrainingDuplicateGuard)return;window.__rrtaTrainingDuplicateGuard=true;
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='manager-team.html')return;
  const SUPA_URL='https://qgbpotjqggeodxqcwkgj.supabase.co',SUPA_KEY='sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS';
  const terminal=new Set(['closed','completed','cancelled','declined']);
  const norm=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
  const fmt=d=>d?new Date(d+'T00:00:00').toLocaleDateString('en-GB'):'No date selected';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const css=document.createElement('style');css.textContent=`
    .mgr-duplicate-warning{grid-column:1/-1;border:1px solid #efb7be;background:#fff7f8;border-left:4px solid #b20f22;border-radius:10px;padding:11px 12px;display:none}.mgr-duplicate-warning.show{display:block}.mgr-duplicate-warning strong{display:block;color:#8f1020;font-size:11px}.mgr-duplicate-warning span{display:block;color:#5e6875;font-size:9px;line-height:1.45;margin-top:4px}.mgr-duplicate-warning button{margin-top:8px;border:0;background:#20262d;color:#fff;border-radius:7px;padding:7px 9px;font:inherit;font-size:9px;font-weight:850;cursor:pointer}.mgr-request-row.rrta-duplicate{background:#fff9f9}.mgr-duplicate-pill{display:inline-flex;margin-left:6px;padding:4px 7px;border-radius:999px;background:#fde8eb;color:#a31325;font-size:8px;font-weight:900;vertical-align:middle}.mgr-modal-submit:disabled{opacity:.45;cursor:not-allowed}
  `;document.head.appendChild(css);
  async function boot(n=0){
    const modal=document.querySelector('.mgr-modal'),form=modal?.querySelector('form');
    if(!modal||!form||!window.supabase?.createClient){if(n<60)setTimeout(()=>boot(n+1),150);return}
    const db=window.supabase.createClient(SUPA_URL,SUPA_KEY);const au=await db.auth.getUser();if(!au.data?.user)return;
    const grid=form.querySelector('.mgr-form-grid');if(!grid)return;
    const warning=document.createElement('div');warning.className='mgr-duplicate-warning';grid.appendChild(warning);
    const submit=form.querySelector('.mgr-modal-submit');let duplicate=null,checkSeq=0;
    const requirement=()=>{const active=modal.querySelector('[data-kind].active')?.dataset.kind||'internal';return active==='external'?String(form.elements.external_course?.value||'').trim():String(form.elements.course?.value||'').trim()};
    async function check(){
      const seq=++checkSeq,person=form.elements.person?.value,req=requirement();duplicate=null;warning.classList.remove('show');warning.innerHTML='';if(submit)submit.disabled=false;
      if(!person||!req)return;
      const q=await db.from('training_requests').select('id,requirement,status,preferred_date,created_at,duplicate_of_request_id').eq('requested_for_profile_id',person).order('created_at',{ascending:true});
      if(seq!==checkSeq||q.error)return;
      duplicate=(q.data||[]).find(r=>!terminal.has(String(r.status||'').toLowerCase())&&!r.duplicate_of_request_id&&norm(r.requirement)===norm(req))||null;
      if(!duplicate)return;
      if(submit)submit.disabled=true;
      warning.classList.add('show');warning.innerHTML=`<strong>Training already requested</strong><span>There is already an active request for <b>${esc(req)}</b>. Current status: <b>${esc(String(duplicate.status||'Pending').replace(/_/g,' '))}</b>. Requested date: <b>${fmt(duplicate.preferred_date)}</b>.<br>Please use the existing request instead of creating another one.</span><button type="button">Open existing request</button>`;
      warning.querySelector('button').onclick=()=>{location.href=`manager-team.html?request=${encodeURIComponent(duplicate.id)}#requests`};
    }
    ['change','input'].forEach(ev=>form.addEventListener(ev,e=>{if(e.target.matches('[name="person"],[name="course"],[name="external_course"]'))setTimeout(check,0)}));
    modal.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>setTimeout(check,0)));
    const newBtn=document.querySelector('.mgr-new-request');if(newBtn)newBtn.addEventListener('click',()=>setTimeout(check,80));
    form.addEventListener('submit',e=>{if(!duplicate)return;e.preventDefault();e.stopImmediatePropagation();warning.classList.add('show');warning.scrollIntoView({behavior:'smooth',block:'center'})},true);
    async function flagExisting(){
      const q=await db.from('training_requests').select('id,duplicate_of_request_id').eq('requester_id',au.data.user.id).order('created_at',{ascending:false});if(q.error)return;
      const rows=[...document.querySelectorAll('.mgr-request-row')];(q.data||[]).forEach((r,i)=>{if(!r.duplicate_of_request_id||!rows[i]||rows[i].dataset.dupFlagged)return;const row=rows[i];row.dataset.dupFlagged='1';row.classList.add('rrta-duplicate');const target=row.querySelector('div:nth-child(2) strong')||row.querySelector('strong');if(target)target.insertAdjacentHTML('beforeend','<span class="mgr-duplicate-pill">Duplicate</span>');row.title='Duplicate request — use the earlier active request.'});
    }
    new MutationObserver(()=>setTimeout(flagExisting,50)).observe(document.querySelector('.mgr-request-list')||document.body,{childList:true,subtree:true});setTimeout(flagExisting,500);setTimeout(check,600);
  }
  boot();
})();
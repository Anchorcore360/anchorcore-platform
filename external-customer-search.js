(function(){
  function init(){
    const main=document.querySelector('main.main');
    const grid=main?.querySelector('.grid');
    if(!main||!grid||document.getElementById('externalSearch'))return;
    const panel=document.createElement('section');
    panel.className='panel';
    panel.style.marginBottom='16px';
    panel.innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px;align-items:end;flex-wrap:wrap"><div style="flex:1;min-width:280px"><label for="externalSearch" style="display:block;font-size:12px;font-weight:800;margin-bottom:5px">Search external customers</label><input id="externalSearch" placeholder="Search company, learner, email or phone…" style="width:100%;padding:10px 11px;border:1px solid #cfd5dd;border-radius:8px;font:inherit"></div><button id="clearExternalSearch" class="btn secondary" type="button">Clear</button></div><div id="externalSearchSummary" class="muted" style="margin-top:8px;font-size:12px">Search across companies and external learners.</div>`;
    main.insertBefore(panel,grid);
    const input=panel.querySelector('#externalSearch');
    const clear=panel.querySelector('#clearExternalSearch');
    const summary=panel.querySelector('#externalSearchSummary');
    function apply(){
      const q=input.value.trim().toLowerCase();
      const companyItems=[...document.querySelectorAll('#customerList [data-customer]')];
      const learnerItems=[...document.querySelectorAll('#delegateList .item')];
      let shownCompanies=0,shownLearners=0;
      companyItems.forEach(el=>{const hit=!q||el.textContent.toLowerCase().includes(q);el.style.display=hit?'':'none';if(hit)shownCompanies++;});
      learnerItems.forEach(el=>{const hit=!q||el.textContent.toLowerCase().includes(q);el.style.display=hit?'':'none';if(hit)shownLearners++;});
      summary.textContent=q?`${shownCompanies} company match${shownCompanies===1?'':'es'} · ${shownLearners} learner match${shownLearners===1?'':'es'}`:'Search across companies and external learners.';
    }
    input.addEventListener('input',apply);
    clear.addEventListener('click',()=>{input.value='';apply();input.focus();});
    const obs=new MutationObserver(()=>{if(input.value.trim())apply();});
    const c=document.getElementById('customerList'),d=document.getElementById('delegateList');
    if(c)obs.observe(c,{childList:true,subtree:true});
    if(d)obs.observe(d,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
(function(){if(window.__rrtaUnifiedNavLoader)return;window.__rrtaUnifiedNavLoader=true;const s=document.createElement('script');s.src='trainer-navigation.js';document.head.appendChild(s)})();
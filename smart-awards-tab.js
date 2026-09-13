(function(){
  if(window.__rrtaSmartAwardsTab)return;window.__rrtaSmartAwardsTab=true;
  function ensureTab(){
    const tabs=document.querySelector('.tabs');if(!tabs)return false;
    if(!tabs.querySelector('[data-tab="smartawards"]')){
      const b=document.createElement('button');b.className='tab-btn';b.dataset.tab='smartawards';b.textContent='Smart Awards';
      const docs=tabs.querySelector('[data-tab="documents"]');if(docs)docs.insertAdjacentElement('beforebegin',b);else tabs.appendChild(b);
    }
    if(!document.getElementById('tab-smartawards')){
      const p=document.createElement('section');p.id='tab-smartawards';p.className='tab-panel';
      p.innerHTML='<article class="panel-card"><div class="panel-head-row"><div><h2>Smart Awards Details</h2><p class="muted">Quartz and NOPS information is optional and only needs completing when required.</p></div></div><div id="smartAwardsTabBody" class="record-list"><div class="empty">Smart Awards details have not been opened yet.</div></div></article>';
      const docsPanel=document.getElementById('tab-documents');if(docsPanel)docsPanel.insertAdjacentElement('beforebegin',p);else document.getElementById('profileApp')?.appendChild(p);
    }
    const legacy=document.getElementById('smartAwardsBtn');
    if(legacy){
      legacy.id='smartAwardsManageBtn';legacy.className='btn secondary small';legacy.textContent='Add / Edit Smart Awards Details';legacy.removeAttribute('style');
      const body=document.getElementById('smartAwardsTabBody');if(body&&!body.contains(legacy)){body.innerHTML='<div class="notice">Use this only when Smart Awards / Quartz / NOPS information needs to be stored for this person.</div>';body.appendChild(legacy)}
    }
    document.querySelectorAll('.tabs [data-tab]').forEach(btn=>{
      if(btn.dataset.smartAwardsWired)return;btn.dataset.smartAwardsWired='1';
      btn.addEventListener('click',()=>{document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));btn.classList.add('active');document.getElementById('tab-'+btn.dataset.tab)?.classList.add('active')});
    });
    return !!legacy;
  }
  const observer=new MutationObserver(()=>ensureTab());observer.observe(document.documentElement,{childList:true,subtree:true});
  let tries=0;const timer=setInterval(()=>{tries++;if(ensureTab()||tries>40){if(tries>40)clearInterval(timer)}},150);
  setTimeout(()=>{clearInterval(timer);observer.disconnect();ensureTab()},8000);
})();
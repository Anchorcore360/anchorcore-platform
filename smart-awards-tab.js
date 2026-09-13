(function(){
  if(window.__rrtaSmartAwardsTab)return;
  window.__rrtaSmartAwardsTab=true;

  function install(){
    const tabs=document.querySelector('.tabs');
    const app=document.getElementById('profileApp');
    if(!tabs||!app)return false;

    let button=tabs.querySelector('[data-tab="smartawards"]');
    if(!button){
      button=document.createElement('button');
      button.className='tab-btn';
      button.dataset.tab='smartawards';
      button.textContent='Smart Awards';
      const documents=tabs.querySelector('[data-tab="documents"]');
      if(documents)documents.insertAdjacentElement('beforebegin',button);
      else tabs.appendChild(button);
    }

    let panel=document.getElementById('tab-smartawards');
    if(!panel){
      panel=document.createElement('section');
      panel.id='tab-smartawards';
      panel.className='tab-panel';
      panel.innerHTML='<article class="panel-card"><div class="panel-head-row"><div><h2>Smart Awards Details</h2><p class="muted">Quartz and NOPS information is optional and only needs completing when required.</p></div></div><div id="smartAwardsTabBody" class="record-list"><div class="notice">Use this only when Smart Awards / Quartz / NOPS information needs to be stored for this person.</div></div></article>';
      const documentsPanel=document.getElementById('tab-documents');
      if(documentsPanel)documentsPanel.insertAdjacentElement('beforebegin',panel);
      else app.appendChild(panel);
    }

    if(!button.dataset.smartAwardsWired){
      button.dataset.smartAwardsWired='1';
      button.addEventListener('click',function(){
        document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
        button.classList.add('active');
        panel.classList.add('active');
      });
    }
    return true;
  }

  if(!install()){
    let tries=0;
    const timer=setInterval(function(){
      tries++;
      if(install()||tries>=50)clearInterval(timer);
    },100);
  }
})();
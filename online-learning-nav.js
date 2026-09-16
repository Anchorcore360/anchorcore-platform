(function(){
  function apply(){
    const mode=document.body?.dataset.portalNav;
    const page=(location.pathname.split('/').pop()||'').toLowerCase();
    document.querySelectorAll('a').forEach(a=>{
      const t=(a.textContent||'').trim().toLowerCase();
      if(mode==='learner'&&(t==='online courses & assessments'||t==='online learning')){
        const copy=a.querySelector('span:not(.portal-nav-icon)');
        if(copy){if(copy.textContent!=='Online Learning')copy.textContent='Online Learning';}else if(!a.querySelector('svg')&&a.textContent!=='Online Learning')a.textContent='Online Learning';
        if(a.getAttribute('href')!=='online-learning.html') a.setAttribute('href','online-learning.html');
        if(a.getAttribute('title')!=='Open Online Learning') a.setAttribute('title','Open Online Learning');
        if(page==='online-learning.html'&&a.getAttribute('aria-current')!=='page') a.setAttribute('aria-current','page');
      }
      if(mode==='academy'&&(t==='online courses'||t==='online learning')){
        const copy=a.querySelector('span:not(.portal-nav-icon)');
        if(copy){if(copy.textContent!=='Online Learning')copy.textContent='Online Learning';}else if(!a.querySelector('svg')&&a.textContent!=='Online Learning')a.textContent='Online Learning';
        if(a.getAttribute('href')!=='academy-online-learning.html') a.setAttribute('href','academy-online-learning.html');
        if(a.getAttribute('title')!=='Manage Online Learning') a.setAttribute('title','Manage Online Learning');
        if(page==='academy-online-learning.html'&&a.getAttribute('aria-current')!=='page') a.setAttribute('aria-current','page');
      }
    });
  }
  function start(){apply();setTimeout(apply,250);setTimeout(apply,900)}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();

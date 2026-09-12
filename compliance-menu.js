(function(){
  if(window.__rrtaComplianceShell)return;window.__rrtaComplianceShell=true;
  document.body.dataset.portalNav='academy';
  if(!document.querySelector('link[href="portal-navigation.css"]')){
    const css=document.createElement('link');css.rel='stylesheet';css.href='portal-navigation.css';document.head.appendChild(css);
  }
  const shell=document.querySelector('.portal-shell');
  const side=document.querySelector('.sidebar');
  if(shell)shell.classList.add('rrta-shared-shell');
  if(side){
    side.classList.add('side','portal-side','rrta-shared-side');
    side.innerHTML='<div class="rrta-shared-brand"><img src="rrta-logo.png" alt="Rapid Response Training Academy"></div><div class="spacer"></div>';
  }
  const style=document.createElement('style');
  style.textContent=`
    .rrta-shared-shell{display:grid!important;grid-template-columns:258px minmax(0,1fr)!important;min-height:100vh!important;overflow:visible!important}
    .rrta-shared-side{position:sticky!important;top:0!important;height:100vh!important;min-height:100vh!important;background:linear-gradient(180deg,#151a22,#1e2530)!important;padding:16px 12px!important;overflow:visible!important;z-index:5000!important;isolation:isolate!important}
    .rrta-shared-brand{padding:6px 10px 16px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:4px}
    .rrta-shared-brand img{display:block;width:158px!important;height:auto!important;background:#fff!important;border-radius:4px!important;padding:5px!important;filter:none!important}
    .rrta-shared-shell>.portal-content{min-width:0!important;position:relative!important;z-index:1!important}
    .rrta-shared-side .portal-nav-flyout{z-index:6000!important}
    @media(max-width:1000px){.rrta-shared-shell{grid-template-columns:1fr!important}.rrta-shared-side{position:relative!important;height:auto!important;min-height:auto!important}}
  `;
  document.head.appendChild(style);
  const nav=document.createElement('script');nav.src='portal-navigation.js';document.head.appendChild(nav);
})();
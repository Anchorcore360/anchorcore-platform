(function(){
  if(window.__rrtaTrainerNavigationLoaded)return;window.__rrtaTrainerNavigationLoaded=true;
  document.body.dataset.portalNav='academy';
  if(!document.querySelector('link[href="portal-navigation.css"]')){
    const css=document.createElement('link');css.rel='stylesheet';css.href='portal-navigation.css';document.head.appendChild(css);
  }
  const side=document.getElementById('trainerSidebar')||document.querySelector('.side,.booking-side,.shell > .sidebar,.portal-shell > .sidebar');
  if(!side)return;
  const shell=side.closest('.shell,.portal-shell');
  if(shell)shell.classList.add('rrta-shared-shell');
  side.classList.add('side','portal-side','rrta-shared-side');
  side.innerHTML='<div class="rrta-shared-brand"><img src="rrta-logo.png" alt="Rapid Response Training Academy"></div><div class="spacer"></div>';
  const style=document.createElement('style');style.id='rrtaSharedLegacyShell';style.textContent=`
    .rrta-shared-shell{display:grid!important;grid-template-columns:258px minmax(0,1fr)!important;min-height:100vh!important;overflow:visible!important}
    .rrta-shared-side{position:sticky!important;top:0!important;height:100vh!important;min-height:100vh!important;background:linear-gradient(180deg,#151a22,#1e2530)!important;padding:16px 12px!important;overflow:visible!important;z-index:5000!important;isolation:isolate!important;box-sizing:border-box!important}
    .rrta-shared-brand{padding:8px 10px 18px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:4px;background:transparent!important}
    .rrta-shared-brand img{display:block;width:188px!important;max-width:100%!important;height:auto!important;background:transparent!important;border-radius:0!important;padding:0!important;filter:invert(1) hue-rotate(180deg) saturate(1.35) brightness(1.15) drop-shadow(0 0 8px rgba(255,255,255,.06))!important;mix-blend-mode:screen!important;margin:0!important}
    .rrta-shared-shell>main,.rrta-shared-shell>.main,.rrta-shared-shell>.portal-content{min-width:0!important;position:relative!important;z-index:1!important}
    @media(max-width:1000px){.rrta-shared-shell{grid-template-columns:1fr!important}.rrta-shared-side{position:relative!important;height:auto!important;min-height:auto!important;width:100%!important}}
  `;document.head.appendChild(style);
  const nav=document.createElement('script');nav.src='portal-navigation.js';document.head.appendChild(nav);
})();
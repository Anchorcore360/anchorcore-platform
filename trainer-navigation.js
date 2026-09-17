(function(){
  if(window.__rrtaTrainerNavigationLoaded)return;window.__rrtaTrainerNavigationLoaded=true;
  document.body.dataset.portalNav='academy';
  if(!document.querySelector('link[href^="portal-navigation.css"]')){const css=document.createElement('link');css.rel='stylesheet';css.href='portal-navigation.css?v=20260917-3';document.head.appendChild(css)}
  let side=document.getElementById('trainerSidebar')||document.querySelector('aside.side,.side,aside.booking-side,.booking-side,.shell > aside.sidebar,.portal-shell > aside.sidebar');
  const shell=document.querySelector('.shell,.portal-shell,.rrta-generated-shell');
  if(!side&&shell){side=document.createElement('aside');side.className='side';shell.insertBefore(side,shell.firstChild)}
  if(!side)return;
  if(shell)shell.classList.add('rrta-shared-shell','portal-shell-standard');
  side.classList.add('side','portal-side','rrta-shared-side');
  if(!side.querySelector('.brand'))side.innerHTML='<div class="brand"></div><div class="spacer"></div>';
  const nav=document.createElement('script');nav.src='portal-navigation.js?v=20260917-3';document.head.appendChild(nav);
})();
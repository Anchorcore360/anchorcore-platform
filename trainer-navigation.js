(function(){
  if(window.__rrtaTrainerNavigationLoaded)return;
  window.__rrtaTrainerNavigationLoaded=true;

  const script=document.createElement('script');
  script.src='platform-navigation.js';
  script.onload=boot;
  script.onerror=boot;
  document.head.appendChild(script);

  function boot(){
    const nav=window.RRTAPlatformNavigation;
    if(!nav)return;
    const side=document.getElementById('trainerSidebar')||document.querySelector('.side,.booking-side,.shell > .sidebar');
    if(!side)return;
    side.classList.add('rrta-platform-side');
    side.closest('.shell,.portal-shell')?.classList.add('rrta-platform-shell');
    installStyles();
    side.innerHTML=renderAcademy(nav);
    wire(side);
  }

  function isActive(href){
    const current=(location.pathname.split('/').pop()||'trainer.html').toLowerCase();
    const raw=href.split('#')[0];
    const target=(raw.split('?')[0]||'trainer.html').toLowerCase();
    if(current!==target)return false;
    if(href.includes('#')&&location.hash&&href.split('#')[1]!==location.hash.slice(1))return false;
    return true;
  }

  function renderAcademy(nav){
    const icon=nav.icon;
    const items=nav.menus.academy.map(item=>{
      if(item.type==='section')return `<div class="rrta-platform-section">${item.label}</div>`;
      if(item.type==='link')return `<a class="rrta-platform-link${isActive(item.href)?' active':''}" href="${item.href}">${icon(item.icon)}<span>${item.label}</span></a>`;
      if(item.type==='group')return `<div class="rrta-platform-group"><button class="rrta-platform-parent" type="button">${icon(item.icon)}<span>${item.label}</span><b>›</b></button><div class="rrta-platform-flyout">${item.items.map(([label,ic,href])=>`<a class="${isActive(href)?'active':''}" href="${href}">${icon(ic)}<span>${label}</span></a>`).join('')}</div></div>`;
      return '';
    }).join('');
    return `<div class="rrta-platform-brand"><img src="rrta-logo.png" alt="RRTA"></div><div class="rrta-platform-kicker">Training Academy Administration</div><nav class="rrta-platform-nav">${items}</nav><div class="rrta-platform-bottom"><a class="rrta-platform-link" href="workforce.html">${icon('people')}<span>RRT Workforce Portal</span></a><a class="rrta-platform-link" href="portal.html">${icon('dashboard')}<span>Switch Portal</span></a></div>`;
  }

  function wire(side){
    side.querySelectorAll('.rrta-platform-parent').forEach(btn=>btn.addEventListener('click',e=>{
      e.stopPropagation();
      const group=btn.closest('.rrta-platform-group');
      const opening=!group.classList.contains('open');
      side.querySelectorAll('.rrta-platform-group').forEach(g=>g.classList.remove('open'));
      if(opening)group.classList.add('open');
    }));
    side.querySelectorAll('.rrta-platform-flyout a').forEach(a=>a.addEventListener('click',()=>side.querySelectorAll('.rrta-platform-group').forEach(g=>g.classList.remove('open'))));
    document.addEventListener('click',e=>{if(!e.target.closest('.rrta-platform-group'))side.querySelectorAll('.rrta-platform-group').forEach(g=>g.classList.remove('open'))});
  }

  function installStyles(){
    if(document.getElementById('rrtaPlatformNavStyles'))return;
    const s=document.createElement('style');s.id='rrtaPlatformNavStyles';s.textContent=`
      .rrta-platform-side{position:sticky!important;top:0!important;height:100vh!important;width:258px!important;box-sizing:border-box!important;background:linear-gradient(180deg,#151a22,#1e2530)!important;color:#d8dee7!important;padding:16px 12px 14px!important;overflow:visible!important;z-index:50!important;box-shadow:8px 0 30px rgba(0,0,0,.08)!important;display:flex!important;flex-direction:column!important}
      .rrta-platform-shell{grid-template-columns:258px minmax(0,1fr)!important}
      .rrta-platform-brand{height:66px;display:flex;align-items:center;padding:4px 10px 14px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:8px}.rrta-platform-brand img{width:154px!important;max-height:50px!important;object-fit:contain;filter:brightness(0) invert(1);margin:0!important}
      .rrta-platform-kicker,.rrta-platform-section{padding:11px 12px 6px;color:#7e8997;font-size:9px;letter-spacing:.14em;text-transform:uppercase;font-weight:850}.rrta-platform-section{margin-top:5px;border-top:1px solid rgba(255,255,255,.07);padding-top:13px}
      .rrta-platform-nav{display:grid;gap:2px;min-height:0;overflow-y:auto;overflow-x:visible;padding-right:3px}.rrta-platform-nav::-webkit-scrollbar{width:4px}.rrta-platform-nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,.14);border-radius:99px}
      .rrta-platform-link,.rrta-platform-parent{position:relative;width:100%;box-sizing:border-box;border:0;background:transparent;color:#c7ced8!important;display:flex!important;align-items:center;gap:11px;padding:10px 11px!important;border-radius:9px!important;margin:1px 0!important;text-decoration:none!important;text-align:left;font:inherit;font-size:12px!important;font-weight:700!important;cursor:pointer;transition:.18s ease}.rrta-platform-link:hover,.rrta-platform-parent:hover{background:rgba(255,255,255,.075)!important;color:#fff!important}.rrta-platform-link.active{background:linear-gradient(90deg,rgba(178,15,34,.98),rgba(120,17,31,.82))!important;color:#fff!important}.rrta-nav-icon{width:18px;height:18px;flex:0 0 18px;display:inline-grid;place-items:center}.rrta-nav-icon svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.rrta-platform-parent span:nth-child(2){flex:1}.rrta-platform-parent b{font-size:17px;margin-left:auto;transition:.18s ease}.rrta-platform-group{position:relative}.rrta-platform-group.open>.rrta-platform-parent{background:rgba(255,255,255,.08)!important;color:#fff!important}.rrta-platform-group.open>.rrta-platform-parent b{transform:translateX(2px)}
      .rrta-platform-flyout{position:absolute;left:calc(100% + 12px);top:-4px;width:270px;padding:8px;background:linear-gradient(180deg,#1e2530,#151a22);border:1px solid rgba(255,255,255,.12);border-radius:13px;box-shadow:0 18px 45px rgba(0,0,0,.28);opacity:0;visibility:hidden;pointer-events:none;transform:translateX(-9px) scale(.985);transition:opacity .16s ease,transform .2s ease,visibility .16s ease;z-index:100}.rrta-platform-group.open>.rrta-platform-flyout{opacity:1;visibility:visible;pointer-events:auto;transform:none}.rrta-platform-flyout a{display:flex!important;align-items:center;gap:10px;color:#aeb7c2!important;text-decoration:none!important;padding:9px 11px!important;border-radius:8px!important;margin:2px 0!important;font-size:11px!important;font-weight:680!important}.rrta-platform-flyout a:hover,.rrta-platform-flyout a.active{background:rgba(255,255,255,.08)!important;color:#fff!important}.rrta-platform-flyout a.active{background:linear-gradient(90deg,rgba(178,15,34,.96),rgba(120,17,31,.8))!important}
      .rrta-platform-bottom{margin-top:auto;padding-top:9px;border-top:1px solid rgba(255,255,255,.08)}
      @media(max-width:1000px){.rrta-platform-side{position:relative!important;height:auto!important;width:100%!important}.rrta-platform-shell{grid-template-columns:1fr!important}.rrta-platform-flyout{position:static;width:auto;display:none;opacity:1;visibility:visible;transform:none;box-shadow:none;border:0;background:rgba(0,0,0,.15);margin:2px 0 6px 15px}.rrta-platform-group.open>.rrta-platform-flyout{display:block}}
    `;document.head.appendChild(s);
  }
})();
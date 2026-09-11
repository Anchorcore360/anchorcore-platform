(function(){
  function enhanceComplianceMenu(){
    const links=[...document.querySelectorAll('.sidebar .side-link')];
    const existing=links.find(a=>a.getAttribute('href')==='compliance.html' || (a.textContent||'').trim()==='Compliance');
    if(!existing || existing.closest('.compliance-nav-group')) return;

    const style=document.createElement('style');
    style.textContent=`
      .compliance-nav-group{position:relative;margin:3px 0}
      .compliance-nav-group>.side-link{margin:0;width:100%}
      .compliance-chevron{margin-left:auto;font-size:13px;opacity:.72;transition:transform .16s ease}
      .compliance-submenu{display:none;margin:4px 0 2px 31px;padding:4px 0 4px 10px;border-left:1px solid rgba(255,255,255,.18)}
      .compliance-submenu a{display:block;text-decoration:none;color:#cfd5da;padding:8px 10px;border-radius:6px;font-size:12.5px;line-height:1.2}
      .compliance-submenu a:hover,.compliance-submenu a.active{background:#3a4147;color:#fff}
      .compliance-nav-group:hover .compliance-submenu,.compliance-nav-group:focus-within .compliance-submenu,.compliance-nav-group.open .compliance-submenu{display:block}
      .compliance-nav-group:hover .compliance-chevron,.compliance-nav-group:focus-within .compliance-chevron,.compliance-nav-group.open .compliance-chevron{transform:rotate(90deg)}
      @media(max-width:950px){.compliance-submenu{position:absolute;left:0;top:100%;margin:3px 0 0;background:#262b30;border:1px solid #424a51;border-radius:8px;padding:7px;min-width:180px;z-index:30;box-shadow:0 10px 30px rgba(0,0,0,.2)}}
    `;
    document.head.appendChild(style);

    const group=document.createElement('div');
    group.className='compliance-nav-group';
    const parent=existing.cloneNode(true);
    parent.setAttribute('href','compliance-operatives.html');
    const chevron=document.createElement('span');
    chevron.className='compliance-chevron';
    chevron.textContent='›';
    parent.appendChild(chevron);

    const submenu=document.createElement('div');
    submenu.className='compliance-submenu';
    const path=(location.pathname.split('/').pop()||'').toLowerCase();
    const items=[
      ['compliance.html','Job Role Matrix'],
      ['compliance-operatives.html','Operatives'],
      ['compliance-teams.html','Manage Teams']
    ];
    submenu.innerHTML=items.map(([href,label])=>`<a href="${href}" class="${path===href?'active':''}">${label}</a>`).join('');
    if(items.some(([href])=>path===href)) parent.classList.add('active');
    group.append(parent,submenu);
    existing.replaceWith(group);

    parent.addEventListener('click',e=>{
      if(matchMedia('(max-width:950px)').matches){
        if(!group.classList.contains('open')){e.preventDefault();group.classList.add('open')}
      }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',enhanceComplianceMenu); else enhanceComplianceMenu();
})();

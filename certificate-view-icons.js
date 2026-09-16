(function(){
  if(window.__certificateViewIcons)return;window.__certificateViewIcons=true;
  const style=document.createElement('style');
  style.textContent='.certificate-view-icon{display:inline-grid!important;place-items:center;width:32px!important;height:32px!important;padding:0!important;flex:none}.certificate-view-icon svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.9}';
  document.head.appendChild(style);
  function decorate(){document.querySelectorAll('button,a').forEach(button=>{
    if(button.dataset.certificateViewIcon||!/^view certificate$/i.test(button.textContent.trim()))return;
    button.dataset.certificateViewIcon='1';button.title='View certificate';button.setAttribute('aria-label','View certificate');
    button.classList.add('certificate-view-icon');
    button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  })}
  decorate();new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});
})();

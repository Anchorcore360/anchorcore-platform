(function(){
  if(window.__rrtaTrainingRequestUiPolishLoaded)return;window.__rrtaTrainingRequestUiPolishLoaded=true;
  const style=document.createElement('style');style.textContent=`
    .trc-btn.rrta-done{background:#e8f6ed!important;border-color:#b8dfc4!important;color:#176b37!important;cursor:default!important;box-shadow:none!important}.trc-btn.rrta-pending{background:#fff4d6!important;border-color:#ead28b!important;color:#8a6100!important}.trc-btn:disabled{opacity:1}.trc-thread-note{font-size:9px;color:#6f7a88;margin:-3px 0 10px}.trc-compose{padding:11px;border:1px solid #e3e7eb;border-radius:10px;background:#fafbfc;margin:0 0 11px!important}.trc-compose textarea{background:#fff!important}.trc-timeline{margin-top:4px}
  `;document.head.appendChild(style);
  function txt(root,sel){return (root.querySelector(sel)?.textContent||'').toLowerCase()}
  function enhance(overlay){if(!overlay||overlay.dataset.rrtaUiPolished==='1')return;overlay.dataset.rrtaUiPolished='1';
    const card=[...overlay.querySelectorAll('.trc-card')].find(x=>/messages\s*&\s*audit trail/i.test(x.querySelector('h3')?.textContent||''));
    if(card){const compose=card.querySelector('.trc-compose'),timeline=card.querySelector('.trc-timeline');if(compose&&timeline&&compose.nextElementSibling!==timeline)card.insertBefore(compose,timeline);if(!card.querySelector('.trc-thread-note')){const note=document.createElement('div');note.className='trc-thread-note';note.textContent='Shared conversation between the Training Academy and requesting manager · newest activity first.';if(compose)compose.insertAdjacentElement('afterend',note)}}
    const status=txt(overlay,'.trc-status');const events=[...overlay.querySelectorAll('.trc-event')].map(e=>(e.textContent||'').toLowerCase()).join('\n');
    const buttons=[...overlay.querySelectorAll('[data-act]')];const by=a=>buttons.find(b=>b.dataset.act===a);const done=(b,label)=>{if(!b)return;b.textContent='✓ '+label;b.disabled=true;b.classList.add('rrta-done')};
    if(/date approved/.test(events)||/booking in progress|booked \/ confirmed|date agreed/.test(status))done(by('approve'),'Date Approved');
    if(/alternative date offered/.test(events)&&/manager action required|awaiting manager/.test(status)){done(by('offer'),'Alternative Sent');const d=overlay.querySelector('#trcAltDate');if(d)d.disabled=true}
    if(/booking confirmed/.test(events)||/booked \/ confirmed/.test(status))done(by('book'),'Booking Created');
    if(/joining instructions/.test(events))done(by('joining'),'Instructions Released');
    if(/closed|cancelled/.test(status)){done(by('close'),'Closed');done(by('cancel'),'Cancelled')}
    const managerAccept=by('accept-alt');if(managerAccept&&/alternative date accepted/.test(events))done(managerAccept,'Date Accepted');
    const managerDecline=by('decline-alt');if(managerDecline&&/alternative date declined/.test(events))done(managerDecline,'Date Declined');
  }
  function run(){document.querySelectorAll('.trc-overlay').forEach(enhance)}
  const o=new MutationObserver(()=>requestAnimationFrame(run));o.observe(document.documentElement,{childList:true,subtree:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
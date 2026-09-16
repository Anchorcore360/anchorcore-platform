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

  // Online Learning: add a relevant photographic header to each existing course card.
  if((location.pathname.split('/').pop()||'').toLowerCase()==='academy-online-learning.html'){
    const courseStyle=document.createElement('style');
    courseStyle.id='rrta-online-course-images';
    courseStyle.textContent=`
      .course-card{padding:0!important;overflow:hidden!important;min-height:300px!important;justify-content:flex-start!important}
      .rrta-course-image{width:100%;height:138px;object-fit:cover;display:block;background:#e9edf1;border-bottom:1px solid #e2e6ea}
      .rrta-course-card-body{padding:15px 17px 17px;display:flex;flex:1;flex-direction:column}
      .rrta-course-card-body .course-open{margin-top:auto;padding-top:16px}
      @media(max-width:1100px){.rrta-course-image{height:160px}}
    `;
    document.head.appendChild(courseStyle);
    const imageFor=(title)=>{
      const t=String(title||'').toLowerCase();
      if(t.includes('customer')||t.includes('professional')||t.includes('conduct'))return 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=82';
      if(t.includes('fibre')||t.includes('fiber')||t.includes('scorm'))return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=82';
      return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=82';
    };
    function decorateCourses(){
      document.querySelectorAll('.course-card').forEach(card=>{
        if(card.dataset.rrtaImage==='1')return;
        const title=card.querySelector('.course-title')?.textContent?.trim()||'RRTA online course';
        card.dataset.rrtaImage='1';
        const img=document.createElement('img');img.className='rrta-course-image';img.src=imageFor(title);img.alt='';img.loading='lazy';
        const body=document.createElement('div');body.className='rrta-course-card-body';
        while(card.firstChild)body.appendChild(card.firstChild);
        card.append(img,body);
      });
    }
    const run=()=>requestAnimationFrame(decorateCourses);run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
  }
})();

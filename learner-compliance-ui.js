(function(){
  const style=document.createElement('style');
  style.textContent=`
  #view-compliance .compliance-overview{display:grid;grid-template-columns:220px minmax(0,1fr);gap:16px;margin-bottom:18px}
  #view-compliance .overall-chart{background:#fff;border:1px solid #d9dee5;border-radius:14px;padding:18px;display:flex;align-items:center;gap:16px}
  #view-compliance .donut{--pct:0;--ring:#18794e;width:104px;height:104px;border-radius:50%;background:conic-gradient(var(--ring) calc(var(--pct)*1%),#e9edf0 0);position:relative;flex:0 0 auto}
  #view-compliance .donut:after{content:'';position:absolute;inset:12px;border-radius:50%;background:#fff}
  #view-compliance .donut-value{position:absolute;inset:0;z-index:1;display:grid;place-items:center;font-weight:900;font-size:23px;color:#172033}
  #view-compliance .overall-copy strong{display:block;font-size:18px}.overall-copy span{display:block;color:#667085;font-size:12px;margin-top:4px;line-height:1.35}
  #view-compliance .stats{margin:0;align-self:stretch}.stats .stat{padding:14px}.stats .stat strong{font-size:24px}
  #view-compliance .role-head{align-items:center}.role-chart-wrap{display:flex;align-items:center;gap:10px}.role-donut{--pct:0;width:68px;height:68px;border-radius:50%;background:conic-gradient(#18794e calc(var(--pct)*1%),#e9edf0 0);position:relative;flex:0 0 auto}.role-donut:after{content:'';position:absolute;inset:9px;border-radius:50%;background:#fff}.role-donut span{position:absolute;inset:0;z-index:1;display:grid;place-items:center;font-size:13px;font-weight:900}
  #view-compliance .req-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:9px;margin-top:14px}
  #view-compliance .req{min-height:116px;padding:11px;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:9px;background:#fff}
  #view-compliance .req strong{font-size:13px;line-height:1.25;display:block}.req small{font-size:11px;line-height:1.3;margin-top:5px}.req>div:last-child{width:100%;justify-content:flex-start!important;flex-wrap:wrap}.req .badge{padding:4px 7px;font-size:10px}
  #view-compliance .req.req-valid{border-left:4px solid #2e8b57}.req.req-expiring{border-left:4px solid #d4a017}.req.req-expired,.req.req-missing{border-left:4px solid #c93c45}.req.req-conditional{border-left:4px solid #98a2b3}
  #view-compliance .role-card{padding:18px}
  @media(max-width:900px){#view-compliance .compliance-overview{grid-template-columns:1fr}.role-chart-wrap{width:100%;justify-content:space-between}.role-head{flex-wrap:wrap}}
  @media(max-width:600px){#view-compliance .req-list{grid-template-columns:repeat(2,minmax(0,1fr))}.overall-chart{flex-direction:column;text-align:center}}
  `;
  document.head.appendChild(style);

  function numberFromStat(label){
    const stats=[...document.querySelectorAll('#complianceStats .stat')];
    const card=stats.find(x=>x.querySelector('span')?.textContent.trim().toLowerCase()===label.toLowerCase());
    return Number(card?.querySelector('strong')?.textContent||0)||0;
  }
  function statusForReq(req){
    const badges=[...req.querySelectorAll('.badge')].map(b=>b.textContent.trim().toLowerCase());
    if(badges.includes('expired'))return 'expired';
    if(badges.includes('missing'))return 'missing';
    if(badges.includes('expiring'))return 'expiring';
    if(badges.includes('valid'))return 'valid';
    if(badges.includes('conditional'))return 'conditional';
    return 'missing';
  }
  function decorate(){
    const view=document.getElementById('view-compliance');
    const stats=document.getElementById('complianceStats');
    const content=document.getElementById('complianceContent');
    if(!view||!stats||!content||!content.querySelector('.role-card'))return;

    content.querySelectorAll('.req').forEach(req=>{
      req.classList.remove('req-valid','req-expiring','req-expired','req-missing','req-conditional');
      req.classList.add('req-'+statusForReq(req));
    });

    let overview=view.querySelector('.compliance-overview');
    if(!overview){
      overview=document.createElement('div');overview.className='compliance-overview';
      stats.parentNode.insertBefore(overview,stats);
      overview.appendChild(stats);
    }
    const covered=numberFromStat('Covered'),expiring=numberFromStat('Expiring'),missing=numberFromStat('Missing'),expired=numberFromStat('Expired');
    const total=covered+expiring+missing+expired;
    const current=covered+expiring;
    const pct=total?Math.round(current/total*100):0;
    let chart=overview.querySelector('.overall-chart');
    if(!chart){chart=document.createElement('div');chart.className='overall-chart';overview.insertBefore(chart,stats)}
    chart.innerHTML=`<div class="donut" style="--pct:${pct}"><div class="donut-value">${pct}%</div></div><div class="overall-copy"><strong>Overall Compliance</strong><span>${current} of ${total} requirements currently held</span></div>`;

    content.querySelectorAll('.role-card').forEach(card=>{
      const reqs=[...card.querySelectorAll('.req')];
      const met=reqs.filter(r=>['valid','expiring'].includes(statusForReq(r))).length;
      const rolePct=reqs.length?Math.round(met/reqs.length*100):0;
      const head=card.querySelector('.role-head');
      if(!head)return;
      const old=head.querySelector('.role-chart-wrap');if(old)old.remove();
      const wrap=document.createElement('div');wrap.className='role-chart-wrap';
      wrap.innerHTML=`<div class="role-donut" style="--pct:${rolePct}"><span>${rolePct}%</span></div><div><strong style="font-size:13px">${met}/${reqs.length} Current</strong><small style="display:block;color:#667085;margin-top:3px">Qualifications Required</small></div>`;
      head.appendChild(wrap);
    });
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(decorate));
  const target=document.getElementById('view-compliance');
  if(target)observer.observe(target,{childList:true,subtree:true,characterData:true});
  window.addEventListener('load',()=>setTimeout(decorate,250));
  setTimeout(decorate,700);
})();
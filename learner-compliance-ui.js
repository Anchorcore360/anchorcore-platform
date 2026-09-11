(function(){
  const style=document.createElement('style');
  style.textContent=`
  #view-compliance .page-head{margin-bottom:16px}
  #view-compliance .compliance-overview{display:grid;grid-template-columns:210px minmax(0,1fr);gap:0;margin-bottom:18px;background:#fff;border:1px solid #d9dee5;border-radius:14px;overflow:hidden}
  #view-compliance .overall-chart{border:0;border-right:1px solid #e5e9ed;border-radius:0;padding:16px;display:flex;align-items:center;gap:13px;min-height:118px;background:#fff}
  #view-compliance .donut{--pct:0;--ring:#18794e;width:82px;height:82px;border-radius:50%;background:conic-gradient(var(--ring) calc(var(--pct)*1%),#e9edf0 0);position:relative;flex:0 0 auto}
  #view-compliance .donut:after{content:'';position:absolute;inset:10px;border-radius:50%;background:#fff}
  #view-compliance .donut-value{position:absolute;inset:0;z-index:1;display:grid;place-items:center;font-weight:900;font-size:18px;color:#172033}
  #view-compliance .overall-copy strong{display:block;font-size:15px;line-height:1.2}.overall-copy span{display:block;color:#667085;font-size:10px;margin-top:4px;line-height:1.35}
  #view-compliance .stats{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:0!important;margin:0!important;align-self:stretch}
  #view-compliance .stats .stat{border:0;border-radius:0;padding:15px 14px;display:flex;flex-direction:column;justify-content:center;min-width:0;background:#fff}
  #view-compliance .stats .stat+ .stat{border-left:1px solid #edf0f2}
  #view-compliance .stats .stat span{font-size:11px;white-space:nowrap}.stats .stat strong{font-size:23px;margin-top:3px}
  #view-compliance .role-card{padding:16px;border-radius:14px;margin-top:12px}
  #view-compliance .role-head{align-items:center;gap:14px;padding-bottom:12px;border-bottom:1px solid #edf0f2}
  #view-compliance .role-head h2{font-size:20px!important;margin:3px 0 0!important}
  #view-compliance .role-chart-wrap{display:flex;align-items:center;gap:9px;margin-left:auto}
  #view-compliance .role-donut{--pct:0;width:54px;height:54px;border-radius:50%;background:conic-gradient(#18794e calc(var(--pct)*1%),#e9edf0 0);position:relative;flex:0 0 auto}
  #view-compliance .role-donut:after{content:'';position:absolute;inset:8px;border-radius:50%;background:#fff}.role-donut span{position:absolute;inset:0;z-index:1;display:grid;place-items:center;font-size:11px;font-weight:900}
  #view-compliance .role-chart-wrap>div:last-child strong{font-size:12px!important}.role-chart-wrap>div:last-child small{font-size:10px!important}
  #view-compliance .req-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:8px;margin-top:12px}
  #view-compliance .req{min-height:88px;padding:9px 10px;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:7px;background:#fff;border-radius:8px;overflow:hidden}
  #view-compliance .req strong{font-size:11px;line-height:1.25;display:block}.req small{font-size:9px;line-height:1.25;margin-top:4px}.req>div:last-child{width:100%;justify-content:flex-start!important;flex-wrap:wrap;gap:4px!important}.req .badge{padding:3px 6px;font-size:9px}
  #view-compliance .req.req-valid{border-left:3px solid #2e8b57}.req.req-expiring{border-left:3px solid #d4a017}.req.req-expired,.req.req-missing{border-left:3px solid #c93c45}.req.req-conditional{border-left:3px solid #98a2b3}
  @media(max-width:1180px){#view-compliance .stats{grid-template-columns:repeat(2,minmax(0,1fr))}#view-compliance .stats .stat:nth-child(3){border-left:0;border-top:1px solid #edf0f2}#view-compliance .stats .stat:nth-child(4){border-top:1px solid #edf0f2}}
  @media(max-width:850px){#view-compliance .compliance-overview{grid-template-columns:1fr}#view-compliance .overall-chart{border-right:0;border-bottom:1px solid #e5e9ed}.role-chart-wrap{width:auto}.role-head{flex-wrap:wrap}}
  @media(max-width:600px){#view-compliance .req-list{grid-template-columns:repeat(2,minmax(0,1fr))}#view-compliance .stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
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
      wrap.innerHTML=`<div class="role-donut" style="--pct:${rolePct}"><span>${rolePct}%</span></div><div><strong>${met}/${reqs.length} Current</strong><small style="display:block;color:#667085;margin-top:2px">Qualifications Required</small></div>`;
      head.appendChild(wrap);
    });
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(decorate));
  const target=document.getElementById('view-compliance');
  if(target)observer.observe(target,{childList:true,subtree:true,characterData:true});
  window.addEventListener('load',()=>setTimeout(decorate,250));
  setTimeout(decorate,700);
})();
(function(){
  if(window.__nrswaUnitGroups)return;window.__nrswaUnitGroups=true;
  function classify(title){
    const text=String(title||'').trim().toUpperCase();
    const unit=text.match(/^(?:NRSWA\s*[-–—:]?\s*)?(LA|O[1-9]|S[1-7])(?:\s|[-–—:]|$)/);
    if(unit)return unit[1]==='LA'?'Shared units':unit[1][0]==='O'?'Operative units':'Supervisor units';
    if(/\bNRSWA\b|\bSTREETWORKS\b/.test(text))return 'Other Streetworks records';
    return null;
  }
  window.rrtaNrswaClassify=classify;
  const style=document.createElement('style');style.textContent=`
    .nrswa-group{grid-column:1/-1;border:1px solid #dbe1e6;border-radius:11px;background:#fff;min-width:0}
    .nrswa-group>summary{cursor:pointer;padding:14px 16px;font-weight:850;color:#20262d}
    .nrswa-group>summary small{display:block;margin-top:5px;font-size:11px;font-weight:500;color:#68727b}
    .nrswa-section{padding:0 12px 12px}.nrswa-section h3{font-size:12px;color:#68727b;margin:12px 0 8px}
    .nrswa-unit-list{display:grid;gap:8px;grid-template-columns:1fr}.nrswa-group .cert{min-height:0!important}
    .nrswa-group table{width:100%;border-collapse:collapse}.nrswa-group td{vertical-align:middle}
  `;document.head.appendChild(style);
  function title(row){return row.querySelector('.cert-top strong, strong, td')?.textContent||''}
  function summary(group){
    const rows=[...group.querySelectorAll('.req,.cert,.record,.team-req,tr')].filter(row=>classify(title(row)));
    const states={valid:0,expiring:0,expired:0,missing:0};
    rows.forEach(row=>{const badge=row.querySelector('.badge,.pill,.status,.team-chip');const state=(badge?.textContent||'').trim().toLowerCase();if(state in states)states[state]++});
    const text=rows.length+' unit record'+(rows.length===1?'':'s')+' shown'+Object.entries(states).filter(([,count])=>count).map(([state,count])=>' · '+count+' '+state).join('');
    const small=group.querySelector('summary small');if(small.textContent!==text)small.textContent=text;
  }
  function decorate(){
    document.querySelectorAll('#requirements,.req-list,#accreditationList,#certificates,#view-compliance .req-grid,#view-compliance tbody,#accreditationsBody tbody,#accreditationBody tbody,.team-detail').forEach(root=>{
      if(root.closest('.nrswa-group'))return;
      const rows=[...root.children].filter(row=>row.matches('.req,.cert,.record,.team-req,tr')&&classify(title(row)));
      let group=root.querySelector(':scope > .nrswa-group, :scope > .nrswa-table-wrapper .nrswa-group');
      if(!rows.length){if(group)summary(group);return}
      if(!group){
        group=document.createElement('details');group.className='nrswa-group';
        const heading=document.createElement('summary');heading.textContent='NRSWA / Streetworks';heading.appendChild(document.createElement('small'));group.appendChild(heading);
        if(root.tagName==='TBODY'){
          const wrapper=document.createElement('tr');wrapper.className='nrswa-table-wrapper';const cell=document.createElement('td');cell.colSpan=rows[0].children.length;wrapper.appendChild(cell);cell.appendChild(group);root.insertBefore(wrapper,rows[0]);
        }else root.insertBefore(group,rows[0]);
      }
      rows.forEach(row=>{
        const category=classify(title(row));let section=[...group.children].find(el=>el.dataset.category===category);
        if(!section){section=document.createElement('section');section.className='nrswa-section';section.dataset.category=category;const heading=document.createElement('h3');heading.textContent=category;section.appendChild(heading);const list=document.createElement(row.tagName==='TR'?'tbody':'div');list.className='nrswa-unit-list';if(row.tagName==='TR'){list.className='';const table=document.createElement('table');table.appendChild(list);section.appendChild(table)}else section.appendChild(list);group.appendChild(section)}
        section.querySelector('.nrswa-unit-list,tbody').appendChild(row);
      });summary(group);
    });
  }
  let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}).observe(document.body,{childList:true,subtree:true});decorate();
})();

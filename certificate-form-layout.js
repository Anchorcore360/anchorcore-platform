(function(){
  if(window.__certificateFormLayout)return;window.__certificateFormLayout=true;
  const style=document.createElement('style');style.textContent=`
    .certificate-form-layout{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px!important;align-items:start!important}
    .certificate-form-layout>label{display:flex!important;flex-direction:column;justify-content:flex-start;gap:6px;min-width:0;margin:0!important;align-self:start}
    .certificate-form-layout>label>input,.certificate-form-layout>label>select{box-sizing:border-box;width:100%!important;min-width:0;height:40px;margin-top:0!important;font:inherit}
    .certificate-form-layout>label>input[type=file]{height:auto;min-height:40px}
    .certificate-form-layout>label>textarea{box-sizing:border-box;width:100%;margin-top:0!important}
    @media(max-width:480px){.certificate-form-layout{grid-template-columns:1fr!important}.certificate-form-layout>label{grid-column:1/-1!important}}
  `;document.head.appendChild(style);
  function arrange(){document.querySelectorAll('.form-grid,.evidence-form,.mgr-evidence-grid').forEach(grid=>{
    if(grid.dataset.certificateLayout)return;
    const labels=[...grid.children].filter(el=>el.tagName==='LABEL');
    const find=pattern=>labels.find(label=>pattern.test(label.childNodes[0]?.textContent||''));
    const number=find(/certificate\s*(number|no)/i),awarding=find(/awarding/i),issue=find(/issue\s*date/i),expiry=find(/expiry\s*date/i),file=labels.find(label=>label.querySelector('input[type=file]'));
    if(!number||!awarding||!issue||!expiry||!file)return;
    grid.dataset.certificateLayout='1';grid.classList.add('certificate-form-layout');
    let qualification=find(/accreditation|qualification/i);
    if(!qualification){
      const title=grid.closest('.evidence-review-box')?.querySelector('p strong')?.textContent;
      if(title){qualification=document.createElement('label');qualification.textContent='Accreditation';const input=document.createElement('input');input.value=title;input.readOnly=true;qualification.appendChild(input);grid.prepend(qualification)}
    }
    labels.forEach(label=>{label.style.gridColumn='1 / -1';label.style.order='3'});
    const set=(label,order,column)=>{if(label){label.style.order=String(order);label.style.gridColumn=column}};
    set(qualification,0,'1 / -1');set(number,1,'1');set(awarding,1,'2');set(issue,2,'1');set(expiry,2,'2');set(file,4,'1 / -1');
    labels.filter(label=>label.querySelector('#catalogSearch,#catalogDescription')).forEach(label=>set(label,label.querySelector('#catalogSearch')?-2:0,'1 / -1'));
    [...grid.children].filter(el=>el.tagName==='LABEL').sort((a,b)=>Number(a.style.order)-Number(b.style.order)||Number(a.style.gridColumn==='2')-Number(b.style.gridColumn==='2')).forEach(label=>grid.appendChild(label));
  })}
  arrange();new MutationObserver(arrange).observe(document.body,{childList:true,subtree:true});
})();

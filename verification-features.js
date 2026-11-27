let showExpiredAccreditations=false;

function verificationUrl(){
  return learner?.verification_token ? `${location.origin}/verify.html?t=${encodeURIComponent(learner.verification_token)}` : '';
}

function loadScriptOnce(src,globalName){
  return new Promise((resolve,reject)=>{
    if(globalName&&window[globalName])return resolve();
    const existing=[...document.scripts].find(s=>s.src===src);
    if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return;}
    const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
  });
}

async function generateQrDataUrl(text,size=220){
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js','QRCode');
  const holder=document.createElement('div');
  holder.style.cssText='position:fixed;left:-10000px;top:-10000px;width:'+size+'px;height:'+size+'px;background:#fff';
  document.body.appendChild(holder);
  try{
    new QRCode(holder,{text,width:size,height:size,correctLevel:QRCode.CorrectLevel.M});
    await new Promise(resolve=>setTimeout(resolve,60));
    const canvas=holder.querySelector('canvas');
    if(canvas)return canvas.toDataURL('image/png');
    const img=holder.querySelector('img');
    if(img?.src)return img.src;
    throw new Error('QR code could not be rendered.');
  }finally{
    holder.remove();
  }
}

async function renderVerificationQr(){
  const slot=document.querySelector('.qr-slot');
  const url=verificationUrl();
  if(!slot||!url)return;
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js','QRCode');
  slot.innerHTML='<div id="liveQr" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#fff"></div>';
  slot.style.padding='10px';
  slot.style.overflow='hidden';
  new QRCode(document.getElementById('liveQr'),{text:url,width:118,height:118,correctLevel:QRCode.CorrectLevel.M});
}

function ensureVerificationActions(){
  const bar=document.querySelector('.profile-topbar');
  if(!bar||document.getElementById('verificationActions'))return;
  const edit=document.getElementById('editProfileBtn');
  const wrap=document.createElement('div');wrap.id='verificationActions';wrap.style.cssText='display:flex;gap:8px;flex-wrap:wrap;align-items:center';
  wrap.innerHTML='<button class="btn secondary" type="button" id="openVerificationBtn">Open live check</button><button class="btn dark" type="button" id="downloadAccPdfBtn">Download accreditation PDF</button>';
  if(edit){const holder=document.createElement('div');holder.style.cssText='display:flex;gap:8px;flex-wrap:wrap;align-items:center';edit.replaceWith(holder);holder.append(wrap,edit);}else bar.appendChild(wrap);
  document.getElementById('openVerificationBtn').onclick=()=>window.open(verificationUrl(),'_blank','noopener');
  document.getElementById('downloadAccPdfBtn').onclick=downloadAccreditationPdf;
  if(learner?.worker_type==='direct_staff'&&['rrt','rapid response telecoms'].includes(String(learner.organisation||'').trim().toLowerCase())){
    const card=document.createElement('a');card.className='btn secondary';card.textContent='Employee card';card.href='employee-card-preview.html?id='+encodeURIComponent(learner.id);wrap.appendChild(card);
  }
}

function profileQualificationLabel(a){
 const name=a.accreditation_name||'Accreditation',master=window.RRTAQualificationMaster;
 const entry=master?.entries().find(e=>master.matches(e,name));
 return entry?master.display(entry):name;
}
function profileNrswaUnit(a){
 const master=window.RRTAQualificationMaster;
 return master?.entries().find(e=>e.category==='02 NRSWA'&&master.matches(e,a.accreditation_name));
}
async function renderAccreditationRecords(){
  const list=document.getElementById('accreditationList');if(!list)return;
  const rows=[...accreditations].sort((a,b)=>String(a.accreditation_name||'').localeCompare(String(b.accreditation_name||''))||String(b.issue_date||'').localeCompare(String(a.issue_date||'')));
  list.classList.remove('accreditation-grid');list.style.display='block';
  const expanded=new Set([...list.querySelectorAll('[data-nrswa-toggle][aria-expanded="true"]')].map(x=>x.dataset.nrswaToggle));
  const groups=new Map(),ordered=[];
  for(const a of rows){
    const unit=profileNrswaUnit(a);
    if(!unit){ordered.push({a});continue}
    const groupKey='nrswa-all';
    if(!groups.has(groupKey)){const g={key:groupKey,rows:[]};groups.set(groupKey,g);ordered.push(g)}
    groups.get(groupKey).rows.push(a);
  }
  const cells=await Promise.all(rows.map(async a=>{
    let view='No file attached';if(a.certificate_url){try{const url=await signed('learner-documents',a.certificate_url);if(url)view='<a class="mini-btn" href="'+esc(url)+'" target="_blank" rel="noopener">View</a> <button type="button" class="mini-btn" data-cert-download="'+esc(a.id)+'">Download</button>';else view='Unavailable'}catch(e){view='Unavailable'}}
    const title=profileQualificationLabel(a);
    return '<tr data-profile-acc-row="'+esc(a.id)+'"><td><strong>'+esc(title)+'</strong></td><td>'+esc(a.awarding_body||'—')+'</td><td>'+esc(fmt(a.issue_date))+'</td><td>'+esc(a.expiry_date?fmt(a.expiry_date):'No expiry')+'</td><td>'+accreditationBadge(a.expiry_date)+'</td><td>'+view+'</td><td>'+actions('accreditation',a.id)+' <button type="button" class="mini-btn" data-action="renew" data-type="accreditation" data-id="'+esc(a.id)+'">Renew</button></td></tr>';
  }));
  const byId=new Map(rows.map((a,i)=>[String(a.id),cells[i]]));
  const visibleRows=ordered.map(g=>{
    if(g.a)return byId.get(String(g.a.id));
    const opened=expanded.has(g.key),units=[...new Set(g.rows.map(a=>profileNrswaUnit(a).code))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    const statuses=g.rows.map(a=>accreditationStatus(a.expiry_date).cls);
    const dates=[...new Set(g.rows.map(a=>a.expiry_date||''))];
    const status=statuses.every(x=>x===statuses[0])?accreditationBadge(g.rows[0].expiry_date):'<span style="color:#64748b;font-weight:600">Mixed validity</span>';
    const summary='<tr style="background:#e8edf2"><td><button type="button" class="mini-btn" data-nrswa-toggle="'+esc(g.key)+'" aria-expanded="'+opened+'" style="white-space:normal;text-align:left"><span aria-hidden="true">'+(opened?'▾':'▸')+'</span> <strong>NRSWA Street Works</strong> · '+units.length+' units</button><div style="font-size:11px;color:#64748b;margin-top:3px">'+esc(units.join(', '))+'</div></td><td>'+esc([...new Set(g.rows.map(a=>a.awarding_body||'—'))].join(', '))+'</td><td>'+esc(new Set(g.rows.map(a=>a.issue_date||'')).size===1?fmt(g.rows[0].issue_date):'Various')+'</td><td>'+esc(dates.length===1?(dates[0]?fmt(dates[0]):'No expiry'):'Various')+'</td><td>'+status+'</td><td colspan="2"><span style="color:#64748b">Expand to view individual units and evidence</span></td></tr>';
    return summary+g.rows.map(a=>byId.get(String(a.id)).replace('<tr data-profile-acc-row=', '<tr '+(opened?'':'hidden ' )+'data-nrswa-group="'+esc(g.key)+'" data-profile-acc-row=')).join('');
  }).join('');
  list.innerHTML='<div style="font-size:12px;color:#667085;margin-bottom:8px">'+rows.length+' recorded accreditations · includes expired records</div>'+(rows.length?'<div style="overflow-x:auto;min-height:110px"><table class="rrta-uniform-table rrta-compact-accreditations" style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#e6e9ec">'+['Qualification','Awarding body','Issued','Expiry','Status','Evidence','Actions'].map(t=>'<th style="text-align:left;padding:9px 8px;white-space:nowrap">'+t+'</th>').join('')+'</tr></thead><tbody>'+visibleRows+'</tbody></table></div>':empty('No accreditations recorded yet.'));
  list.querySelectorAll('[data-nrswa-toggle]').forEach(btn=>btn.onclick=()=>{const open=btn.getAttribute('aria-expanded')!=='true';btn.setAttribute('aria-expanded',String(open));btn.querySelector('span').textContent=open?'▾':'▸';list.querySelectorAll('[data-nrswa-group]').forEach(tr=>{if(tr.dataset.nrswaGroup===btn.dataset.nrswaToggle)tr.hidden=!open})});
  list.querySelectorAll('td').forEach(td=>{td.style.padding='4px 8px';td.style.borderBottom='1px solid #dfe3e7';td.style.verticalAlign='middle'});
  list.querySelectorAll('[data-cert-download]').forEach(b=>b.onclick=async()=>{const a=accreditations.find(x=>String(x.id)===b.dataset.certDownload);if(!a?.certificate_url)return;b.disabled=true;try{const url=await signed('learner-documents',a.certificate_url);if(!url)throw Error('Certificate unavailable');const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw Error('Certificate download failed');const objectUrl=URL.createObjectURL(await res.blob());const link=document.createElement('a');link.href=objectUrl;link.download=safeZipName(a.accreditation_name)+' - '+safeZipName(learner?.full_name||'Learner')+fileExtensionFromPath(a.certificate_url);document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(objectUrl),30000)}catch(e){alert(e.message||'Unable to download certificate')}finally{b.disabled=false}});const downloadAll=document.getElementById('downloadAllAccreditationsBtn');if(downloadAll)downloadAll.onclick=downloadAllAccreditationsZip;bindActions();
}

function safeZipName(value,fallback='accreditation'){
  const cleaned=String(value||fallback).trim().replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').slice(0,100);
  return cleaned||fallback;
}

function fileExtensionFromPath(path){
  const clean=String(path||'').split('?')[0].split('#')[0];
  const last=clean.split('/').pop()||'';
  const match=last.match(/\.([a-zA-Z0-9]{1,8})$/);
  return match?'.'+match[1].toLowerCase():'.pdf';
}

async function downloadAllAccreditationsZip(){
  const btn=document.getElementById('downloadAllAccreditationsBtn');
  if(!btn)return;
  const withEvidence=accreditations.filter(a=>a.certificate_url);
  if(!withEvidence.length)return alert('There are no accreditation certificate files available to download.');
  const oldText=btn.textContent;btn.disabled=true;btn.textContent='Preparing ZIP…';
  try{
    await loadScriptOnce('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js','JSZip');
    const zip=new JSZip();
    const manifest=[['Accreditation','Awarding Body','Certificate Number','Issue Date','Expiry Date','Status','File Included'].join(',')];
    const used=new Set();
    let added=0;
    for(let i=0;i<accreditations.length;i++){
      const a=accreditations[i],status=accreditationStatus(a.expiry_date).label;
      let included='No';
      if(a.certificate_url){
        try{
          const url=await signed('learner-documents',a.certificate_url);
          if(url){
            const res=await fetch(url,{cache:'no-store'});
            if(!res.ok)throw new Error('Certificate download failed');
            const blob=await res.blob();
            const ext=fileExtensionFromPath(a.certificate_url);
            const base=safeZipName(a.accreditation_name||('Accreditation '+(i+1)));
            let fileName=base+ext,n=2;
            while(used.has(fileName.toLowerCase()))fileName=base+' ('+(n++)+')'+ext;
            used.add(fileName.toLowerCase());
            zip.file(fileName,blob);
            included='Yes';added++;
          }
        }catch(e){console.warn('Could not add accreditation file to ZIP',a?.id,e)}
      }
      const csv=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
      manifest.push([
        csv(a.accreditation_name||'Accreditation'),
        csv(a.awarding_body||''),
        csv(a.certificate_number||''),
        csv(a.issue_date||''),
        csv(a.expiry_date||''),
        csv(status),
        csv(included)
      ].join(','));
    }
    zip.file('Accreditation Summary.csv',manifest.join('\r\n'));
    if(!added)throw new Error('None of the certificate files could be downloaded.');
    const blob=await zip.generateAsync({type:'blob'});
    const name=[learner?.forename,learner?.surname].filter(Boolean).join(' ')||learner?.full_name||'Learner';
    const objectUrl=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=objectUrl;a.download=safeZipName(name,'Learner')+' - Accreditations.zip';document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(objectUrl),30000);
  }catch(e){
    alert(e?.message||'Unable to create the accreditation ZIP file.');
  }finally{
    btn.disabled=false;btn.textContent=oldText;
  }
}

async function imageUrlToDataUrl(src){
  try{
    const res=await fetch(src,{cache:'no-store'});
    if(!res.ok)throw new Error('Image unavailable');
    const blob=await res.blob();
    return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob);});
  }catch(_e){return null;}
}

function pdfStatusStyle(status){
  if(status.cls==='expired')return {fill:[253,235,236],text:[180,35,24]};
  if(status.cls==='expiring')return {fill:[255,246,216],text:[138,97,0]};
  return {fill:[232,246,237],text:[23,107,55]};
}

async function downloadAccreditationPdf(){
  const url=verificationUrl();
  if(!url)return alert('Verification link is not available for this learner.');
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js');
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const name=[learner.forename,learner.surname].filter(Boolean).join(' ')||learner.full_name||'Operative';
  const current=accreditations.filter(a=>accreditationStatus(a.expiry_date).cls!=='expired');

  doc.setFillColor(255,255,255);doc.rect(0,0,210,297,'F');
  try{const logo=await imageUrlToDataUrl(`${location.origin}/rrta-logo.png`);if(logo)doc.addImage(logo,'PNG',14,10,32,15);}catch(_e){}
  doc.setDrawColor(157,11,26);doc.setLineWidth(1);doc.line(0,30,210,30);
  doc.setFontSize(8);doc.setTextColor(102,112,123);doc.text('ACCREDITATION VERIFICATION RECORD',196,18,{align:'right'});

  let photoData=null;
  if(learner.photo_path){try{const photoUrl=await signed('learner-photos',learner.photo_path);if(photoUrl)photoData=await imageUrlToDataUrl(photoUrl);}catch(_e){}}
  if(photoData){try{doc.addImage(photoData,'JPEG',16,40,29,35);}catch(_e){try{doc.addImage(photoData,'PNG',16,40,29,35);}catch(_e2){}}}
  else{doc.setFillColor(246,247,248);doc.roundedRect(16,40,29,35,2,2,'F');doc.setFontSize(8);doc.setTextColor(115,125,135);doc.text('Photo',30.5,58,{align:'center'});}

  try{
    const qrData=await generateQrDataUrl(url,240);
    doc.addImage(qrData,'PNG',16,78,29,29);
  }catch(_e){}

  doc.setTextColor(123,23,35);doc.setFontSize(8);doc.setFont(undefined,'bold');doc.text('OPERATIVE DETAILS',55,42);
  const details=[
    ['Name',name],
    ['Employee number',learner.employee_number||'—'],
    ['Company status',String(learner.account_status||'active').replace(/^./,c=>c.toUpperCase())],
    ['Employer',learner.organisation||'—'],
    ['Job title',learner.job_title||'—']
  ];
  let dy=50;
  for(const [label,value] of details){
    doc.setFont(undefined,'bold');doc.setFontSize(8.5);doc.setTextColor(82,94,106);doc.text(label,55,dy);
    doc.setFont(undefined,'normal');doc.setTextColor(31,41,51);doc.text(String(value),92,dy);
    dy+=8;
  }
  doc.setFontSize(7.5);doc.setTextColor(102,112,123);doc.text(`Generated ${new Date().toLocaleString('en-GB')}`,92,dy+1);
  doc.setFont(undefined,'normal');

  const tableY=118;
  doc.setFillColor(230,243,246);doc.rect(14,tableY,182,10,'F');
  doc.setFont(undefined,'bold');doc.setFontSize(9);doc.setTextColor(31,41,51);doc.text('All Certifications',105,124.5,{align:'center'});

  const cols={code:16,module:42,issued:105,expires:132,status:158,body:178};
  let y=136;
  doc.setFontSize(6.8);doc.setTextColor(92,103,115);
  doc.text('MODULE NO',cols.code,y);doc.text('MODULE',cols.module,y);doc.text('CERTIFICATION DATE',cols.issued,y);doc.text('EXPIRES',cols.expires,y);doc.text('STATUS',cols.status,y);doc.text('AWARDING BODY',cols.body,y);
  y+=5;doc.setDrawColor(220,226,232);doc.line(14,y-2,196,y-2);

  doc.setFont(undefined,'normal');
  for(const a of current){
    if(y>278){doc.addPage();y=20;}
    const s=accreditationStatus(a.expiry_date),style=pdfStatusStyle(s);
    const code=String(a.accreditation_name||'—');
    const module=String((window.accreditationCatalog||[]).find?.(x=>String(x.id)===String(a.accreditation_catalog_id))?.description||a.accreditation_name||'—');
    const wrapped=doc.splitTextToSize(module,58).slice(0,2);
    const rowH=Math.max(9,wrapped.length*4+4);
    doc.setFont(undefined,'bold');doc.setFontSize(7.2);doc.setTextColor(31,41,51);doc.text(code,cols.code,y+4.5);
    doc.setFont(undefined,'normal');doc.setFontSize(6.9);doc.text(wrapped,cols.module,y+4.2);
    doc.text(fmt(a.issue_date),cols.issued,y+4.5);doc.text(fmt(a.expiry_date),cols.expires,y+4.5);
    doc.setFillColor(...style.fill);doc.rect(154,y,21,rowH,'F');doc.setTextColor(...style.text);doc.setFont(undefined,'bold');doc.text(s.label,164.5,y+4.7,{align:'center'});
    doc.setFont(undefined,'normal');doc.setTextColor(55,65,75);doc.setFontSize(6.6);doc.text(doc.splitTextToSize(String(a.awarding_body||'—'),18).slice(0,2),cols.body,y+4.2);
    y+=rowH;doc.setDrawColor(225,230,235);doc.line(14,y,196,y);
  }
  if(!current.length){doc.setFontSize(8);doc.setTextColor(102,112,123);doc.text('No current accreditations recorded.',16,y+8);y+=14;}

  doc.setFontSize(7.2);doc.setTextColor(102,112,123);doc.setFont(undefined,'normal');
  doc.text('Expired accreditations are excluded from this PDF. Scan the QR code for the current live record and certificate evidence.',14,289);
  doc.save(`${name.replace(/[^a-z0-9]+/gi,'_')}_accreditation_record.pdf`);
}

const verificationOriginalRender=render;
render=async function(){
  // The core profile must remain visible if QR-generation or other optional enhancements fail.
  await verificationOriginalRender();
  try{ensureVerificationActions()}catch(error){console.warn('Verification actions unavailable',error)}
  void renderVerificationQr().catch(error=>console.warn('Optional QR enhancement unavailable',error))
  try{await renderAccreditationRecords()}catch(error){console.warn('Optional accreditation display unavailable',error)}
};

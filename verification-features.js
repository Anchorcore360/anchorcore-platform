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
}

async function renderAccreditationRecords(){
  const list=document.getElementById('accreditationList');
  if(!list)return;
  const expiredCount=accreditations.filter(a=>accreditationStatus(a.expiry_date).cls==='expired').length;
  const visible=accreditations.filter(a=>showExpiredAccreditations||accreditationStatus(a.expiry_date).cls!=='expired');
  const rows=await Promise.all(visible.map(async a=>{
    const status=accreditationStatus(a.expiry_date);
    let view='';
    if(a.certificate_url){
      const url=await signed('learner-documents',a.certificate_url);
      if(url)view=`<a class="mini-btn" style="text-decoration:none" href="${url}" target="_blank" rel="noopener">View certificate</a>`;
    }
    return `<div class="record"><div><strong>${esc(a.accreditation_name||'Accreditation')}</strong><small>${esc(a.awarding_body||'Awarding body not recorded')} · Issued ${fmt(a.issue_date)} · Expires ${fmt(a.expiry_date)}</small></div><div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap">${accreditationBadge(a.expiry_date)}${view}${actions('accreditation',a.id)}</div></div>`;
  }));
  list.innerHTML=`${expiredCount?`<div style="display:flex;justify-content:flex-end;margin-bottom:10px"><label style="display:flex;align-items:center;gap:7px;font-size:13px;font-weight:700"><input type="checkbox" id="showExpiredAccs" ${showExpiredAccreditations?'checked':''}> Show expired (${expiredCount})</label></div>`:''}${rows.length?rows.join(''):empty(showExpiredAccreditations?'No accreditations recorded yet.':'No current accreditations. '+(expiredCount?'Use Show expired to view historic records.':''))}`;
  const toggle=document.getElementById('showExpiredAccs');if(toggle)toggle.onchange=()=>{showExpiredAccreditations=toggle.checked;renderAccreditationRecords();};
  bindActions();
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
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js','QRCode');
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const name=[learner.forename,learner.surname].filter(Boolean).join(' ')||learner.full_name||'Operative';
  const current=accreditations.filter(a=>accreditationStatus(a.expiry_date).cls!=='expired');

  // Header / branding
  doc.setFillColor(255,255,255);doc.rect(0,0,210,297,'F');
  try{const logo=await imageUrlToDataUrl(`${location.origin}/rrta-logo.png`);if(logo)doc.addImage(logo,'PNG',14,10,32,15);}catch(_e){}
  doc.setDrawColor(157,11,26);doc.setLineWidth(1);doc.line(0,30,210,30);
  doc.setFontSize(8);doc.setTextColor(102,112,123);doc.text('ACCREDITATION VERIFICATION RECORD',196,18,{align:'right'});

  // Identity block
  let photoData=null;
  if(learner.photo_path){try{const photoUrl=await signed('learner-photos',learner.photo_path);if(photoUrl)photoData=await imageUrlToDataUrl(photoUrl);}catch(_e){}}
  if(photoData){try{doc.addImage(photoData,'JPEG',16,40,29,35);}catch(_e){try{doc.addImage(photoData,'PNG',16,40,29,35);}catch(_e2){}}}
  else{doc.setFillColor(246,247,248);doc.roundedRect(16,40,29,35,2,2,'F');doc.setFontSize(8);doc.setTextColor(115,125,135);doc.text('Photo',30.5,58,{align:'center'});}

  try{const qrData=await window.QRCode.toDataURL(url,{width:220,margin:1});doc.addImage(qrData,'PNG',16,78,29,29);}catch(_e){}

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

  // Accreditation table title
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
  await verificationOriginalRender();
  ensureVerificationActions();
  await renderVerificationQr();
  await renderAccreditationRecords();
};

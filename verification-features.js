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
  slot.innerHTML='<div id="liveQr" style="background:#fff;padding:7px;border:1px solid #d7dde3;border-radius:8px"></div><strong style="margin-top:8px">Live accreditation check</strong><small>Scan to verify current records</small>';
  new QRCode(document.getElementById('liveQr'),{text:url,width:86,height:86,correctLevel:QRCode.CorrectLevel.M});
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

async function downloadAccreditationPdf(){
  const url=verificationUrl();
  if(!url)return alert('Verification link is not available for this learner.');
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js');
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js','QRCode');
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const name=[learner.forename,learner.surname].filter(Boolean).join(' ')||learner.full_name||'Operative';
  doc.setFontSize(18);doc.text('RRTA Accreditation Record',15,18);
  doc.setFontSize(11);doc.text(name,15,28);
  doc.setFontSize(9);doc.text(`Employee: ${learner.employee_number||'—'}    Organisation: ${learner.organisation||'—'}`,15,34);
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`,15,40);
  const current=accreditations.filter(a=>accreditationStatus(a.expiry_date).cls!=='expired');
  let y=52;
  doc.setFontSize(8);doc.text('Accreditation',15,y);doc.text('Issued',92,y);doc.text('Expires',118,y);doc.text('Status',150,y);y+=5;
  doc.line(15,y-3,195,y-3);
  for(const a of current){
    if(y>272){doc.addPage();y=20;}
    const s=accreditationStatus(a.expiry_date);
    const title=String(a.accreditation_name||'Accreditation').slice(0,42);
    doc.text(title,15,y);doc.text(fmt(a.issue_date),92,y);doc.text(fmt(a.expiry_date),118,y);doc.text(s.label,150,y);y+=6;
  }
  if(!current.length){doc.text('No current accreditations recorded.',15,y);y+=8;}
  try{
    const qrData=await window.QRCode.toDataURL(url,{width:180,margin:1});
    if(y>235){doc.addPage();y=20;}
    doc.addImage(qrData,'PNG',15,y,36,36);doc.setFontSize(9);doc.text('Scan for the live accreditation record.',57,y+12);doc.text('The online record is the current source of truth.',57,y+18);
  }catch(e){}
  doc.save(`${name.replace(/[^a-z0-9]+/gi,'_')}_accreditation_record.pdf`);
}

const verificationOriginalRender=render;
render=async function(){
  await verificationOriginalRender();
  ensureVerificationActions();
  await renderVerificationQr();
  await renderAccreditationRecords();
};

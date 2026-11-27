
(function(){
const E=id=>document.getElementById(id),norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={people:[],catalog:[],records:[],rows:[],busy:false,ready:false};let worker,pdf,seq=0;const max=20*1024*1024;
const unique=a=>a.length===1?a[0]:null;
const contains=(text,term)=>(' '+norm(text)+' ').includes(' '+norm(term)+' ');
function matchPerson(text){const names=state.people.filter(p=>p.full_name&&contains(text,p.full_name));const ids=state.people.filter(p=>p.learner_reference&&contains(text,p.learner_reference));if(names.length===1){if(ids.length===1&&ids[0].id!==names[0].id)return null;return names[0]}if(names.length>1)return unique(names.filter(p=>ids.some(i=>i.id===p.id)));return unique(ids)}
function matchQual(text){if(/\bbasic first aid\s+level\s*2\b/i.test(text)){return state.catalog.filter(q=>/^basic first aid level 2$/i.test(q.description||q.entry?.title||''))}const cleaned=String(text||'').replace(/\b[Ss][\s-]*[O0][\s-]*[O0][\s-]*([0-9])\b/g,'S00$1');return window.RRTAQualificationMaster.detect(cleaned,state.catalog.filter(q=>q.entry))}
function parseDate(s){const m=String(s||'').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$|^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$|^(\d{1,2})[\s-]+([A-Za-z]{3,9})[\s,-]+(\d{4})$/);if(!m)return'';const y=Number(m[1]||m[6]||m[9]),mo=Number(m[2]||m[5]||(['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf((m[8]||'').slice(0,3).toLowerCase())+1)),d=Number(m[3]||m[4]||m[7]);const dt=new Date(Date.UTC(y,mo-1,d));return y>=1900&&y<=2100&&dt.getUTCFullYear()===y&&dt.getUTCMonth()===mo-1&&dt.getUTCDate()===d?dt.toISOString().slice(0,10):''}
function labelledDate(t,label){const re=new RegExp('(?:'+label+')\\s*[:\\-]?\\s*(\\d{4}-\\d{1,2}-\\d{1,2}|\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{4}|\\d{1,2}[\\s-]+[A-Za-z]{3,9}[\\s,-]+\\d{4})','gi');const matches=[...new Set([...t.matchAll(re)].map(m=>parseDate(m[1])).filter(Boolean))];return matches.length===1?matches[0]:''}
function stackedOpenreachDates(t){
 if(!/\bOpenreach\b/i.test(t)||!/\bCertificate\s+of\s+Accreditation\b/i.test(t))return null;
 const source=String(t).replace(/(\d)\s*([\/.-])\s*(?=\d)/g,'$1$2');
 const issue=labelledDate(source,'date\\s+of\\s+issue|issue\\s+date'),expiry=labelledDate(source,'expiry(?:\\s+date)?|date\\s+of\\s+expiry');
 if(issue&&expiry)return issue<expiry?{issue,expiry}:null;
 // PDF text layers may group labels ahead of their values. Accept only the known template
 // with exactly two dates in ascending order; otherwise leave the record for review.
 const m=source.match(/(?:Expiry\s*:\s*Date\s+of\s+issue|Date\s+of\s+issue\s*:\s*Expiry)\s*:\s*Learner\s+ID\s*:\s*Assessor\s+Name\s*:\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})\s+(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i);
 if(!m)return null;const a=parseDate(m[1]),b=parseDate(m[2]);return a&&b&&a<b&&(!issue||issue===a)&&(!expiry||expiry===b)?{issue:a,expiry:b}:null
}
function extract(t){const stacked=stackedOpenreachDates(t),person=matchPerson(t),qs=matchQual(t),num=t.match(/(?:certificate|certification|accreditation|registration|card)\s*(?:number|no\.?|id|#)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\/-]{2,35})/i);const awarding=['Smart Awards','EUSR','CITB','NRSWA','SWQR','Openreach','IPAF','NPORS','PASMA','ProTrainings','City & Guilds'].filter(x=>contains(t,x));return {person:person?.id||'',qual:qs.length===1?String(qs[0].id):'',suggestions:qs.map(q=>String(q.id)),issue:stacked?.issue||labelledDate(t,'presented on|date of accreditation|accreditation date|accreditation start date|date accredited|issue date|date of issue|issued on|date issued|achievement date|valid from|validity start date|certification date|date of certification|course completed on|course completion date|date assessed'),expiry:stacked?.expiry||labelledDate(t,'accreditation expiry date|expiry date|expiration date|valid until|expires on|expires|date of expiry|valid to|validity end date|expiry|expiration|retake this course before|retake course before'),number:num?.[1]||'',awarding:awarding.length===1?awarding[0]:(awarding.includes('Openreach')&&awarding.every(x=>['Openreach','Smart Awards'].includes(x))&&/\bS00[5-9]\b/i.test(t)?'Openreach':'')}}

function swqrNumber(t){const m=String(t||'').match(/\bSWQR\s*(?:No\.?|Number|#)\s*[:\-]?\s*(\d{6,10})\b/i);return m?.[1]||''}
function swqrRows(t){
 const lines=String(t||'').split(/\r?\n/), units=new Map(), conflicts=new Set();
 const datePattern=/\b\d{1,2}\s*[\/.-]\s*\d{1,2}\s*[\/.-]\s*\d{4}\b/g;
 const codePattern=/^\s*(LA|[O0][1-8]|S[1-7])\b/i;
 function put(code,date){if(!date)return;if(units.has(code)&&units.get(code)!==date){conflicts.add(code);units.delete(code)}else if(!conflicts.has(code))units.set(code,date)}
 for(const line of lines){const m=line.match(codePattern);if(!m)continue;const dates=[...line.matchAll(datePattern)].map(x=>parseDate(x[0].replace(/\s/g,''))).filter(Boolean);if(dates.length===1)put(m[1].toUpperCase().replace(/^0/,'O'),dates[0])}
 // Some OCR engines separate the right-hand expiry column. Only align an entire
 // ordered block when every unit and every date are present exactly once.
 if(!units.size){const codes=lines.map(l=>l.match(codePattern)?.[1]?.toUpperCase().replace(/^0/,'O')).filter(Boolean);
 const dates=lines.filter(l=>!/date of birth|\bdob\b/i.test(l)).flatMap(l=>[...l.matchAll(datePattern)].map(x=>parseDate(x[0].replace(/\s/g,''))).filter(Boolean));
 const front=['LA','O1','S1'],back=['O2','O3','O4','O5','O6','O7','O8','S2','S3','S4','S5','S6','S7'];
 if((codes.join(',')===front.join(',')||codes.join(',')===back.join(','))&&dates.length===codes.length)codes.forEach((c,i)=>put(c,dates[i]));
 }
 const codes=lines.map(l=>l.match(codePattern)?.[1]?.toUpperCase().replace(/^0/,'O')).filter(Boolean);
 return {units:[...new Set(codes)].map(code=>({code,expiry:units.get(code)||''})),conflicts:[...conflicts]};
}
function swqrQual(code){const qs=state.catalog.filter(q=>norm(q.module_code)===norm(code));return unique(qs)}
function swqrPerson(t){const names=state.people.filter(p=>p.full_name&&contains(t,p.full_name));return unique(names)}
function isSwqr(t){return !!swqrNumber(t)||(/\bSWQR\b/i.test(t)&&/key certificates|qualified to monitor|qualified in|expiring/i.test(t))}
async function swqrEvidence(files,number){
 if(files.length===1)return files[0];
 if(files.some(f=>/\.pdf$/i.test(f.name)))throw Error('Pair image files (JPG, PNG or WEBP) to create shared card evidence.');
 if(!window.jspdf){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';script.onload=resolve;script.onerror=()=>reject(Error('PDF library unavailable'));document.head.append(script)})}
 const doc=new window.jspdf.jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
 for(let i=0;i<files.length;i++){const bitmap=await createImageBitmap(files[i]);const canvas=document.createElement('canvas');const scale=Math.min(1,2200/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();if(i)doc.addPage();const ratio=Math.min(277/canvas.width,190/canvas.height),w=canvas.width*ratio,h=canvas.height*ratio;doc.addImage(canvas.toDataURL('image/jpeg',.94),'JPEG',(297-w)/2,(210-h)/2,w,h);canvas.width=0;canvas.height=0}
 return new File([doc.output('blob')],'SWQR-'+number+'-card.pdf',{type:'application/pdf'});
}
async function expandSwqr(cards,report){
 const groups=new Map();for(const c of cards){const number=swqrNumber(c.text),key=number||'unpaired-'+c.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c)}
 for(const group of groups.values()){
 const number=swqrNumber(group[0].text),matches=[...new Set(group.map(c=>swqrPerson(c.text)?.id).filter(Boolean))],person=matches.length===1?matches[0]:'';
 const readings=group.map(c=>({...c,parsed:swqrRows(c.text)}));let evidence=null;
 if(number&&group.length===2&&matches.length<=1&&readings.some(c=>c.parsed.units.some(u=>u.code==='LA'))&&readings.some(c=>c.parsed.units.some(u=>/^O[2-8]|^S[2-7]/.test(u.code)))){try{evidence=await swqrEvidence(group.map(c=>c.file),number)}catch(e){report.errors.push('SWQR '+number+' — combined evidence unavailable; using individual sides. '+e.message)}}
 const merged=new Map();for(const c of readings)for(const u of c.parsed.units){const prev=merged.get(u.code);if(!prev)merged.set(u.code,{...u,file:c.file});else if(prev.expiry!==u.expiry)prev.expiry=''}
 if(!merged.size){for(const c of group){Object.assign(c,extract(c.text),{person,number,awarding:'SWQR',qual:'',issue:'',expiry:'',note:'SWQR card detected; units could not be read. Review card manually.'});state.rows.push(c);report.added++}continue}
 for(const u of merged.values()){const q=swqrQual(u.code);state.rows.push({id:++seq,file:evidence||u.file,text:group.map(c=>c.text).join('\n\n'),person,qual:q?String(q.id):'',suggestions:q?[String(q.id)]:[],number,awarding:'SWQR',issue:u.expiry?addYears(u.expiry,-5):'',expiry:u.expiry,issueDerived:u.expiry?-5:null,noExpiry:false,confirmed:false,done:false,error:'',swqrUnit:u.code,note:'SWQR '+u.code+' · '+(u.expiry?'Issue date calculated: expiry minus 5 years':'Check expiry against card')+(evidence?' · both sides attached':' · individual side attached')+(person?'':' · select operative')+(q?'':' · select catalogue unit')});report.added++}
 }
}


function isStreetworksCertificate(t){return /\bunit certificate\b/i.test(t)&&/new road(?:s)? and street works|street works unit/i.test(t)}
function streetworksCertificateRows(t){
 const base=extract(t),person=swqrPerson(t),units=swqrRows(t).units.map(u=>u.code);
 return [...new Set(units)].map(code=>{const q=swqrQual(code);return {...base,person:person?.id||'',qual:q?String(q.id):'',suggestions:q?[String(q.id)]:[],swqrUnit:code,streetworksCertificate:true,issue:base.issue||(base.expiry?addYears(base.expiry,-5):''),issueDerived:!base.issue&&base.expiry?-5:null,expiry:base.expiry||(base.issue?addYears(base.issue,5):''),expiryDerived:!base.expiry&&base.issue?5:null,note:'Streetworks '+code+' · '+(!base.issue||!base.expiry?'One date calculated using five years; verify':'Dates printed on certificate')+(q?'':' · select catalogue unit')}});
}
function additionalMatch(r){
 if(r.swqrUnit||r.personal||r.nops||r.codeConflict||!r.file||!r.person||!r.qual||!r.number||!r.issue||!r.awarding)return null;
 const p=state.people.find(x=>x.id===r.person),q=state.catalog.find(x=>String(x.id)===r.qual);if(!p||!q||q.personal||q.registration)return null;
 const matches=state.records.filter(a=>!a.superseded_by&&(a.person_id===p.id||(p.profile_id&&a.learner_id===p.profile_id))&&(q.catalogId!=null&&String(a.accreditation_catalog_id)===String(q.catalogId)||q.entry&&window.RRTAQualificationMaster.matches(q.entry,a.accreditation_name)||!q.entry&&norm(a.accreditation_name)===norm(q.module_code))&&norm(a.certificate_number)===norm(r.number));
 if(matches.length!==1)return null;const a=matches[0];return a.issue_date===r.issue&&(a.expiry_date||'')===(r.expiry||'')&&norm(a.awarding_body)===norm(r.awarding)?a:null
}
async function addAdditionalEvidence(r){
 if(state.busy||r.done)return;const a=additionalMatch(r);if(!a)return;
 if(!confirm('Attach this document to the existing accreditation? This will not create a new qualification or change its dates.'))return;
 const p=state.people.find(x=>x.id===r.person),bucket=db.storage.from('learner-documents');let path=null,uploaded=false;state.busy=true;render();
 try{
 const digest=async blob=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const hash=await digest(r.file);
 const fresh=await db.from('accreditations').select('id,certificate_number,issue_date,expiry_date,awarding_body,certificate_url,supporting_documents,superseded_by').eq('id',a.id).is('archived_at',null).single();if(fresh.error)throw fresh.error;
 const current=fresh.data;if(current.superseded_by||norm(current.certificate_number)!==norm(r.number)||current.issue_date!==r.issue||(current.expiry_date||'')!==(r.expiry||'')||norm(current.awarding_body)!==norm(r.awarding))throw Error('Existing accreditation changed. Refresh and review.');
 const paths=[...new Set([current.certificate_url,...(current.supporting_documents||[]).map(d=>d.path)].filter(Boolean))];
 for(const old of paths){const result=await bucket.download(old);if(result.error)throw Error('Could not compare existing evidence: '+result.error.message);if(await digest(result.data)===hash){r.done=true;r.identicalEvidence=true;r.confirmed=false;E('smartMessage').textContent='Identical evidence already exists — no duplicate stored.';return}}
 path=(p.profile_id||p.id)+'/accreditations/'+crypto.randomUUID()+'-'+r.file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
 const up=await bucket.upload(path,r.file,{upsert:false});if(up.error)throw up.error;uploaded=true;
 const res=await db.rpc('append_accreditation_document',{p_id:a.id,p_path:path,p_kind:'Additional evidence',p_name:r.file.name});if(res.error)throw res.error;uploaded=false;
 a.supporting_documents=[...(current.supporting_documents||[]),{path,name:r.file.name,kind:'Additional evidence'}];r.done=true;r.additionalSaved=true;r.confirmed=false;E('smartMessage').textContent='Additional evidence attached to existing accreditation.';
 }catch(e){if(uploaded&&path)await bucket.remove([path]);r.error=e.message||'Could not attach evidence';alert(r.error)}finally{state.busy=false;render()}
}

function evidenceMatch(r){
 if(!r.swqrUnit||!r.person||!r.qual||!r.expiry)return null;
 const p=state.people.find(x=>x.id===r.person),q=state.catalog.find(x=>String(x.id)===r.qual);if(!p||!q)return null;
 const matches=state.records.filter(a=>(a.person_id===p.id||(p.profile_id&&a.learner_id===p.profile_id))&&(q.catalogId!=null&&String(a.accreditation_catalog_id)===String(q.catalogId)||q.entry&&window.RRTAQualificationMaster.matches(q.entry,a.accreditation_name)||!q.entry&&norm(a.accreditation_name)===norm(q.module_code))&&a.expiry_date===r.expiry);
 return matches.length===1&&(!matches[0].issue_date||matches[0].issue_date===r.issue)?matches[0]:null;
}
function ambiguousEvidence(r){if(!r.swqrUnit||!r.person||!r.qual||!r.expiry)return false;const p=state.people.find(x=>x.id===r.person),q=state.catalog.find(x=>String(x.id)===r.qual);if(!p||!q)return false;return state.records.some(a=>(a.person_id===p.id||(p.profile_id&&a.learner_id===p.profile_id))&&(q.catalogId!=null&&String(a.accreditation_catalog_id)===String(q.catalogId)||q.entry&&window.RRTAQualificationMaster.matches(q.entry,a.accreditation_name)||!q.entry&&norm(a.accreditation_name)===norm(q.module_code))&&a.expiry_date===r.expiry)&&!evidenceMatch(r)}



const nopsOption={id:'registration:nops',catalogId:null,module_code:'NOPS',description:'NOPS registration',label:'NOPS card / Smart Awards profile',registration:true};
function isNops(t,name=''){if(openreachFields(t)&&/date of accreditation/i.test(t))return false;return /\bNOPS\b/i.test(name)||(/\bNOPS\b/i.test(t)&&/\b(?:user\s*id|card\s*id|card\s*number|registration|QR\s*code)\b/i.test(t))}
function nopsId(t,label){const re=new RegExp('(?:'+label+')\\s*[:#-]?\\s*(\\d{1,20})\\b','gi');const ids=[...new Set([...t.matchAll(re)].map(m=>m[1]))];return ids.length===1?ids[0]:''}
function nopsFields(t){return {person:unique(state.people.filter(p=>p.full_name&&contains(t,p.full_name)))?.id||'',qual:nopsOption.id,suggestions:[],issue:'',expiry:'',number:nopsId(t,'(?:NOPS\\s*)?User\\s*ID'),nopsCard:nopsId(t,'(?:NOPS\\s*)?Card\\s*(?:ID|Number|No\\.?)'),awarding:'Smart Awards',note:'NOPS registration picture — User ID must be explicitly labelled; check employee and IDs. Not a qualification.'}}
async function saveNops(r,p){const result=await db.from('people').select('smart_awards_user_id,smart_awards_card_id,smart_awards_qr_path').eq('id',p.id).single();if(result.error)throw result.error;const old=result.data;if(old.smart_awards_user_id&&r.number&&String(old.smart_awards_user_id)!==r.number)throw Error('Existing NOPS User ID conflicts. Review the Smart Awards profile before importing.');if(old.smart_awards_card_id&&r.nopsCard&&String(old.smart_awards_card_id)!==r.nopsCard)throw Error('Existing NOPS Card ID conflicts. Review the Smart Awards profile before importing.');const path=(p.profile_id||p.id)+'/nops/'+crypto.randomUUID()+'-'+r.file.name.replace(/[^a-zA-Z0-9._-]/g,'_'),bucket=db.storage.from('learner-documents');const up=await bucket.upload(path,r.file,{upsert:false});if(up.error)throw up.error;let update=db.from('people').update({smart_awards_user_id:r.number||old.smart_awards_user_id||null,smart_awards_card_id:r.nopsCard||old.smart_awards_card_id||null,smart_awards_qr_path:path}).eq('id',p.id);for(const key of ['smart_awards_user_id','smart_awards_card_id','smart_awards_qr_path'])update=old[key]==null?update.is(key,null):update.eq(key,old[key]);const saved=await update.select('id').single();if(saved.error){await bucket.remove([path]);throw saved.error}}

const licenceOption={id:'personal:driving',catalogId:null,module_code:'Driving licence',description:'Driving licence',label:'🔒 Driving licence — personal document',personal:true};
function isDrivingLicence(t,name=''){return /(?:^|[ _-])DL[ _-]*(?:front|back)(?:[ ._-]|$)/i.test(name)||/\b(?:driving licen[cs]e|driver'?s licen[cs]e|driving license)\b/i.test(t)||/\b(?:driving|driver)[ _-]*licen[cs]e\b/i.test(name)||(/\bDVLA\b/i.test(t)&&/\b4[ab]\b/i.test(t))}
function licencePerson(t){
 const text=String(t||'');
 function field(n,next){const re=new RegExp('(?:^|\\n|\\s)'+n+'\\s*[.\\):]?\\s*([\\p{L}][\\p{L}\\s\\x27’\\-]*?)(?=\\s+'+next+'\\s*[.\\):]?\\s*|\\n\\s*\\d|$)','iu');const m=text.match(re);return m?norm(m[1]):''}
 const surname=field('1','2'),forenames=field('2','3');
 if(surname&&forenames){
 const matches=state.people.filter(p=>{const full=norm(p.full_name).split(' '),last=norm(p.surname||full.at(-1)),first=norm(p.forename||full[0]).split(' ');return last===surname&&first[0]===forenames.split(' ')[0]&&first.every((v,i)=>v===forenames.split(' ')[i])});
 return unique(matches);
 }
 return matchPerson(text)
}
function licenceFields(t){return {person:licencePerson(t)?.id||'',qual:licenceOption.id,suggestions:[],issue:labelledDate(t,'4\\s*a\\.?|date of issue|valid from'),expiry:labelledDate(t,'4\\s*b\\.?|expiry date|date of expiry|valid until'),number:'',awarding:'',note:'Sensitive personal document — academy staff only; verify name and dates against the licence.'}}
async function saveLicence(r,p){if(!state.privateAccess)throw Error('Academy staff access required for personal documents.');const path=p.id+'/'+crypto.randomUUID()+'-'+r.file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const bucket=db.storage.from('personal-documents');const up=await bucket.upload(path,r.file,{upsert:false});if(up.error)throw up.error;const result=await db.from('personal_documents').insert({person_id:p.id,document_type:'Driving licence',file_path:path,file_name:r.file.name,issue_date:r.issue||null,expiry_date:r.expiry||null}).select('id').single();if(result.error){await bucket.remove([path]);throw result.error}}

async function lib(){if(!pdf){pdf=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs');pdf.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs'}return pdf}
async function ocr(image){if(!worker){await new Promise((resolve,reject)=>{if(window.Tesseract)return resolve();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';s.onload=resolve;s.onerror=()=>reject(Error('OCR library unavailable'));document.head.append(s)});worker=await window.Tesseract.createWorker('eng',1,{workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',langPath:'https://tessdata.projectnaptha.com/4.0.0'})}const r=await worker.recognize(image);return r.data.text||''}
async function read(file){if(/\.pdf$/i.test(file.name)){const p=await lib(),doc=await p.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;let text='';try{for(let n=1;n<=Math.min(doc.numPages,5);n++){const page=await doc.getPage(n),c=await page.getTextContent();const t=c.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('');const fields=extract(t);if(t.trim().length>=45&&fields.person&&fields.qual&&fields.issue&&fields.expiry)text+=t+'\n';else{const view=page.getViewport({scale:1.7}),canvas=document.createElement('canvas');canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);await page.render({canvasContext:canvas.getContext('2d'),viewport:view}).promise;try{const scanned=await ocr(canvas);text+=t+'\n'+scanned+'\n'}catch(e){if(!t.trim())throw e;text+=t+'\n'}finally{canvas.width=0;canvas.height=0}}}return {text,note:doc.numPages>5?'First five pages read; review remaining pages.':''}}finally{await doc.destroy()}}return {text:await ocr(file),note:''}}
function personLabel(p){return [p.full_name,p.learner_reference,p.company].filter(Boolean).join(' · ')}
const qLabel=q=>q.label||[q.module_code,q.description].filter(Boolean).join(' — ');
async function addQualification(r){
 const title=prompt('Enter the qualification name as shown on the certificate:');if(!title?.trim())return;
 const label=title.trim();if(label.length>150){alert('Qualification name must be 150 characters or fewer.');return}
 const existing=state.catalog.find(q=>norm(q.description)===norm(label)||norm(q.module_code)===norm(label));if(existing){r.qual=String(existing.id);r.confirmed=false;render();return}
 const master=confirm('Add "'+label+'" to the approved master catalogue and matrix?\nOK = add to the matrix catalogue.\nCancel = store as an additional qualification only.');
 if(master){const code=prompt('Qualification code (leave blank for a generic qualification):','');if(code===null)return;const moduleCode=code.trim()||label;if(moduleCode.length>150){alert('Code too long.');return}
 if(state.rawCatalog.some(q=>norm(q.module_code)===norm(moduleCode))){alert('This code already exists in the source catalogue. Use an existing qualification or choose a distinct, verified name.');return}
 try{const res=await db.from('accreditation_catalog').insert({module_code:moduleCode,description:label,source:'RRTA master qualification',active:true}).select('id,module_code,description,source,active').single();if(res.error)throw res.error;state.rawCatalog.push(res.data);const opts=window.RRTAQualificationMaster.options(state.rawCatalog).filter(q=>q.module_code!=='NOPS'),q=opts.find(q=>q.catalogId===res.data.id);if(!q)throw Error('Qualification saved, but it matches an existing master entry. Refresh and choose the matching entry.');state.catalog=[...opts,...state.catalog.filter(q=>!q.entry)];r.qual=String(q.id)}catch(e){alert(e.message);return}
 }else{if(!confirm('Save this certificate under additional qualifications without adding a matrix column?'))return;const q={id:'additional:'+norm(label),catalogId:null,module_code:label,description:label,label:label+' (additional only)'};state.catalog.push(q);r.qual=q.id}
 r.confirmed=false;r.error='';render();
}

function isCardRecord(a){return String(a.awarding_body||'').trim().toUpperCase()==='SWQR'||/\/SWQR-\d+-card\.pdf$/i.test(a.certificate_url||'')}
function shouldPromoteCard(r,a){return !!(r.swqrUnit&&!r.streetworksCertificate&&r.awarding==='SWQR'&&!isCardRecord(a))}
function duplicate(r){if(r.nops||r.qual===nopsOption.id)return false;if(r.personal||r.qual===licenceOption.id)return false;if(evidenceMatch(r)&&r.file)return false;const p=state.people.find(x=>x.id===r.person),q=state.catalog.find(x=>String(x.id)===r.qual);if(!p||!q)return false;return state.records.some(a=>(a.person_id===p.id||(p.profile_id&&a.learner_id===p.profile_id))&&(q.catalogId!=null&&String(a.accreditation_catalog_id)===String(q.catalogId)||q.entry&&window.RRTAQualificationMaster.matches(q.entry,a.accreditation_name)||!q.entry&&norm(a.accreditation_name)===norm(q.module_code))&&((r.number&&norm(a.certificate_number)===norm(r.number)&&(!r.swqrUnit||(a.expiry_date||'')===(r.expiry||'')))||(r.issue&&a.issue_date===r.issue&&(a.expiry_date||'')===(r.expiry||''))))}
function valid(r){if(r.codeConflict)return false;if(r.nops||r.qual===nopsOption.id)return !!(r.qual===nopsOption.id&&r.person&&r.file&&/^\d{1,20}$/.test(r.number||'')&&(!r.nopsCard||/^\d{1,20}$/.test(r.nopsCard))&&!r.done&&!r.error);if(r.personal||r.qual===licenceOption.id)return !!(state.privateAccess&&r.qual===licenceOption.id&&r.person&&r.file&&r.expiry&&parseDate(r.expiry)===r.expiry&&(!r.issue||parseDate(r.issue)===r.issue&&r.issue<=r.expiry)&&!r.done&&!r.error);return !!(r.person&&state.catalog.some(q=>String(q.id)===r.qual)&&parseDate(r.issue)===r.issue&&r.issue&&r.issue<=new Date().toISOString().slice(0,10)&&(r.noExpiry&&!r.expiry||r.expiry&&parseDate(r.expiry)===r.expiry&&r.expiry>=r.issue)&&!duplicate(r)&&!ambiguousEvidence(r)&&!r.error&&!r.done)}

function openreachFields(t){
 const source=String(t||'');
 if(isSwqr(source)||isStreetworksCertificate(source)||/\bNRSWA\b|\bstreet\s*works\b/i.test(source))return null;
 const template=/date of accreditation/i.test(source)&&/accreditation expiry date/i.test(source)&&/certification\s*id/i.test(source);
 const explicit=contains(source,'Openreach')||/\bPIA\b/i.test(source);
 if(!template&&!explicit)return null;
 const nums=[...new Set([...source.matchAll(/certification\s*id\s*[:\-]?\s*([A-Z]{2,12}\s*\d{2,12}|[A-Z0-9][A-Z0-9\/-]{2,35})/gi)].map(m=>m[1].replace(/\s/g,'')))];
 const catalog=state.catalog.filter(q=>q.entry&&['03 PIA','05 Openreach'].includes(q.entry.category));
 const section=source.split(/date of accreditation|accreditation expiry date|certification\s*id/i)[0];
 const normalized=norm(section);
 const codeCandidates=catalog.filter(q=>{const c=q.entry.code;const m=c.match(/^([A-Z])0*(\d+)$/);return contains(normalized,c)||(m&&contains(normalized,m[1]+Number(m[2])))});
 const piaDescriptions=[
 ['S007',/\bsub[\s-]*duct\s+(?:and|&)\s+cable\s+installation\b/i],
 ['S008',/\boverhead\s+cable\s+installation\b/i]
 ];
 const described=piaDescriptions.filter(([,re])=>re.test(section)).map(([c])=>catalog.find(q=>q.entry.code===c)).filter(Boolean);
 const conflict=codeCandidates.length===1&&described.length===1&&codeCandidates[0].entry.code!==described[0].entry.code;
 return {awarding:'Openreach',number:nums.length===1?nums[0]:'',conflict,codeCandidates,described};
}
function applyOpenreachFields(r){
 const x=openreachFields(r.text);if(!x)return r;
 r.awarding=x.awarding;if(x.number)r.number=x.number;const dates=stackedOpenreachDates(r.text);if(dates){r.issue=dates.issue;r.expiry=dates.expiry}
 if(x.conflict){
  r.qual='';r.suggestions=x.described.map(q=>String(q.id));r.note=[r.note,'CODE / DESCRIPTION CONFLICT: '+x.codeCandidates[0].entry.code+' vs '+x.described[0].label+'. Obtain corrected evidence before approval.'].filter(Boolean).join(' · ');r.codeConflict=true;
 }else if(x.codeCandidates.length===1){
  r.qual=String(x.codeCandidates[0].id);r.suggestions=[r.qual];
 }else if(x.codeCandidates.length>1){
  r.qual='';r.suggestions=x.codeCandidates.map(q=>String(q.id));r.note=[r.note,'Multiple Openreach codes; review qualification'].filter(Boolean).join(' · ');
 }else if(x.described.length===1){r.qual=String(x.described[0].id);r.suggestions=[r.qual]}
 return r
}
function applySmartAwardExpiry(r){if(r.expiry||!r.issue||r.noExpiry||r.personal||r.nops||r.swqrUnit)return r;const q=state.catalog.find(x=>String(x.id)===String(r.qual));const codes=[q?.entry?.code,...(q?.entry?.aliases||[])].filter(x=>/^SA\d{3}[A-Z]?$/i.test(x||''));const text=String(r.text||'');const detected=codes.some(c=>contains(text,c))||(/^SA\d{3}[A-Z]?$/i.test(q?.entry?.code||'')&&norm(r.awarding)==='smart awards');if(detected&&parseDate(r.issue)===r.issue){r.expiry=addYears(r.issue,3);r.expiryDerived=3;r.note=[r.note,'SA expiry calculated: issue + 3 years; verify before approval'].filter(Boolean).join(' · ')}return r}
function addYears(date,years){const [y,m,d]=date.split('-').map(Number);const last=new Date(Date.UTC(y+years,m,0)).getUTCDate();return new Date(Date.UTC(y+years,m-1,Math.min(d,last))).toISOString().slice(0,10)}
async function saveValidityCheck(r){
 if(state.busy||r.done||!state.privateAccess)return;
 const p=state.people.find(x=>x.id===r.person),q=state.catalog.find(x=>String(x.id)===r.qual);
 if(!p||!q||q.personal||q.registration||r.personal||r.nops||!r.file){alert('Select the employee and qualification first. Personal documents and NOPS registrations cannot use this option.');return}
 const reason=prompt('Reason for checking validity (evidence will NOT count as compliance):',r.codeConflict?'Conflicting qualification code and description — corrected certificate required.':'');if(!reason?.trim())return;if(reason.trim().length>2000){alert('Reason is too long.');return}
 state.busy=true;render();const bucket=db.storage.from('validity-evidence'),path=p.id+'/'+crypto.randomUUID()+'-'+r.file.name.replace(/[^a-zA-Z0-9._-]/g,'_');let uploaded=false;
 try{const up=await bucket.upload(path,r.file,{upsert:false});if(up.error)throw up.error;uploaded=true;const result=await db.from('accreditation_validity_checks').insert({person_id:p.id,accreditation_catalog_id:q.catalogId??null,qualification:q.module_code||q.description,awarding_body:r.awarding||null,certificate_number:r.number||null,issue_date:parseDate(r.issue)||null,expiry_date:parseDate(r.expiry)||null,file_path:path,file_name:r.file.name,reason:reason.trim()}).select('id').single();if(result.error)throw result.error;uploaded=false;r.done=true;r.validitySaved=true;r.confirmed=false;E('smartMessage').textContent='Evidence saved for validity check — not counted as compliance.'}catch(e){if(uploaded)await bucket.remove([path]);r.error=e.message;alert(e.message)}finally{state.busy=false;render()}
}

function render(){const filter=E('smartFilter').value,box=E('smartRows');box.innerHTML='';for(const r of state.rows){if(filter==='imported'?!r.done:r.done)continue;if(filter==='review'&&valid(r)&&r.confirmed)continue;if(filter==='duplicates'&&!duplicate(r))continue;const tr=document.createElement('tr');const input=(k,type='text')=>'<input aria-label="'+k+'" data-field="'+k+'" type="'+type+'" value="'+esc(r[k]||'')+'">';
const opts=(items,value,label)=>'<option value="">'+label+'</option>'+items.map(([id,n])=>'<option value="'+esc(id)+'" '+(String(id)===value?'selected':'')+'>'+esc(n)+'</option>').join('');
tr.innerHTML='<td><input type="checkbox" aria-label="Approve certificate" data-field="confirmed" '+(r.confirmed?'checked':'')+' '+(valid(r)?'':'disabled')+'></td><td><button type="button" class="btn secondary small" data-action="preview">View</button> <strong>'+esc(r.file?.name||'Spreadsheet row')+'</strong><small>'+esc(r.note||'')+'</small><button type="button" class="btn secondary small" data-action="text">Read text</button><button type="button" class="btn secondary small" data-action="copy">+ Qualification</button></td><td><select aria-label="Operative" data-field="person">'+opts(state.people.map(p=>[p.id,personLabel(p)]),r.person,'Select person')+'</select></td><td><select aria-label="Qualification" data-field="qual">'+opts(state.catalog.map(q=>[q.id,qLabel(q)]),r.qual,'Select qualification')+'</select><button type="button" class="btn secondary small" data-action="newqual">+ New / additional</button>'+(r.suggestions?.length>1?'<small>Multiple possible qualifications: '+esc(r.suggestions.map(id=>qLabel(state.catalog.find(q=>String(q.id)===id)||{})).join('; '))+'</small>':'')+'</td><td>'+input('awarding')+'</td><td>'+((r.nops||r.qual===nopsOption.id)?'<small>NOPS User ID</small>'+input('number')+'<small>Card ID (optional)</small>'+input('nopsCard'):input('number'))+'</td><td>'+input('issue','date')+'</td><td>'+input('expiry','date')+'<select aria-label="Calculate issue or expiry date" data-field="expiryPeriod" title="Choose a validity period only after verifying the qualification requirements" style="margin-top:4px;font-size:11px;min-width:0;padding:4px"><option value="" '+(!r.noExpiry&&!r.expiryDerived&&!r.issueDerived?'selected':'')+'>Calculate dates…</option>'+[1,2,3,4,5].map(y=>'<option value="'+y+'" '+(r.expiryDerived===y?'selected':'')+' '+(!r.issue?'disabled':'')+'>+ '+y+' year'+(y===1?'':'s')+'</option>').join('')+[-1,-2,-3,-4,-5].map(y=>'<option value="'+y+'" '+(r.issueDerived===y?'selected':'')+' '+(!r.expiry?'disabled':'')+'>− '+Math.abs(y)+' year'+(y===-1?'':'s')+'</option>').join('')+'<option value="none" '+(r.noExpiry?'selected':'')+'>No expiry</option></select>'+'</td><td class="'+(r.done?'ok':duplicate(r)?'bad':valid(r)?'ok':'warn')+'">'+esc(r.done?(r.validitySaved?'⚠ Saved for validity check':r.identicalEvidence?'Identical evidence skipped':r.additionalSaved?'Evidence added':'Imported'):r.error|| (duplicate(r)?'Duplicate':valid(r)?r.confirmed?'Approved':evidenceMatch(r)?(shouldPromoteCard(r,evidenceMatch(r))?'Make SWQR card primary':'Add supporting evidence'):'Review & approve':ambiguousEvidence(r)?'Conflicting existing record — review manually':'Needs details'))+( !r.done&&additionalMatch(r)?'<button type="button" class="btn secondary small" data-action="additional" title="Attach to existing accreditation; identical files are skipped">+ Add evidence</button>':'')+'<button type="button" class="btn secondary small" data-action="remove">Remove</button>'+(!r.done&&state.privateAccess&&!r.personal&&!r.nops&&r.qual!==licenceOption.id&&r.qual!==nopsOption.id&&!valid(r)&&!additionalMatch(r)?'<button type="button" class="btn secondary small" style="color:#925600;border-color:#e6b94c" data-action="validity">⚠ Check validity</button>':'')+'</td>';
tr.querySelectorAll('[data-field]').forEach(el=>{el.disabled=el.disabled||state.busy||r.done;el.onchange=()=>{const k=el.dataset.field;if(k==='expiryPeriod'){const v=el.value;if(v==='none'){r.noExpiry=true;r.expiry='';r.expiryDerived=null;r.issueDerived=null}else if(/^[1-5]$/.test(v)&&r.issue){r.noExpiry=false;r.issueDerived=null;r.expiryDerived=Number(v);r.expiry=addYears(r.issue,r.expiryDerived)}else if(/^-[1-5]$/.test(v)&&r.expiry){r.noExpiry=false;r.expiryDerived=null;r.issueDerived=Number(v);r.issue=addYears(r.expiry,r.issueDerived)}else{if(r.expiryDerived)r.expiry='';if(r.issueDerived)r.issue='';r.noExpiry=false;r.expiryDerived=null;r.issueDerived=null}r.confirmed=false;r.error='';render();return}if(k==='qual'&&r.nops&&el.value!==nopsOption.id){render();return}if(k==='qual'&&r.personal&&el.value!==licenceOption.id){render();return}r[k]=el.type==='checkbox'?el.checked:el.value;if(k!=='confirmed'){r.confirmed=false;r.error='';if(k==='expiry'){r.expiryDerived=null;r.noExpiry=false;if(r.issueDerived){r.issue=r.expiry?addYears(r.expiry,r.issueDerived):'';if(!r.expiry)r.issueDerived=null}}if(k==='issue'){r.issueDerived=null;if(r.expiryDerived){r.expiry=r.issue?addYears(r.issue,r.expiryDerived):'';if(!r.issue)r.expiryDerived=null}}if(k==='noExpiry'&&r.noExpiry){r.expiry='';r.expiryDerived=null}}render()}});
tr.querySelectorAll('[data-action]').forEach(b=>{b.disabled=state.busy||(r.done&&['remove','copy','newqual'].includes(b.dataset.action));b.onclick=()=>{const a=b.dataset.action;if(a==='additional'){void addAdditionalEvidence(r);return}if(a==='validity'){void saveValidityCheck(r);return}if((r.personal||r.nops)&&['newqual','copy'].includes(a))return;if(a==='newqual'){void addQualification(r);return}if(a==='remove'){state.rows=state.rows.filter(x=>x!==r);render()}if(a==='copy'){state.rows.splice(state.rows.indexOf(r)+1,0,{...r,id:++seq,qual:'',confirmed:false,done:false,error:''});render()}if(a==='preview'&&r.file){const u=URL.createObjectURL(r.file);window.open(u,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(u),120000)}if(a==='text'){E('smartText').textContent=r.text||'No extracted text.';E('smartTextDialog').showModal()}}});box.append(tr)}
const eligible=state.rows.filter(valid),master=E('smartApproveAll');if(master){master.disabled=state.busy||!eligible.length;master.checked=eligible.length>0&&eligible.every(r=>r.confirmed);master.indeterminate=eligible.some(r=>r.confirmed)&&!master.checked;master.onchange=()=>{const select=master.checked;if(select&&!confirm('Select all '+eligible.length+' rows that passed automated checks? Confirm you have reviewed the original evidence. Automated checks do not prove authenticity.')){render();return}eligible.forEach(r=>r.confirmed=select);render()}}const approved=state.rows.filter(r=>r.confirmed&&valid(r)).length;E('smartCount').textContent=state.rows.filter(r=>!r.done).length+' remaining · '+approved+' approved · '+state.rows.filter(r=>r.done).length+' imported';E('smartImport').disabled=state.busy||!approved;E('smartApprove').disabled=state.busy||!state.rows.some(valid);E('smartFiles').disabled=state.busy||!state.ready;E('smartSheet').disabled=state.busy||!state.ready;
}
const zipMax=250*1024*1024,expandedMax=500*1024*1024,entryMax=500;
const accepted=n=>/\.(pdf|jpe?g|png|webp)$/i.test(n);
let zipLibrary;
async function unzip(file,onFile,report){
 if(file.size>zipMax)throw Error('ZIP exceeds 250 MB; split into smaller archives.');
 if(!zipLibrary)zipLibrary=import('https://cdn.jsdelivr.net/npm/@zip.js/zip.js@2.7.57/+esm').catch(e=>{zipLibrary=null;throw e});
 const {ZipReader,BlobReader,BlobWriter}=await zipLibrary;
 const reader=new ZipReader(new BlobReader(file),{useWebWorkers:false});
 try{
 const entries=await reader.getEntries();if(entries.length>5000)throw Error('Archive has too many entries; split it into smaller ZIPs.');
 const candidates=entries.filter(e=>!e.directory&&!e.filename.split('/').some(p=>p==='__MACOSX'||p.startsWith('.'))&&accepted(e.filename));
 report.skipped+=entries.filter(e=>!e.directory).length-candidates.length;
 if(candidates.length>entryMax)throw Error('ZIP contains over 500 certificates; split it into smaller archives.');
 let total=0;
 for(const e of candidates){if(!Number.isSafeInteger(e.uncompressedSize)||e.uncompressedSize<0)throw Error('Archive contains invalid file sizes.');if(e.uncompressedSize<=max)total+=e.uncompressedSize;}
 if(total>expandedMax)throw Error('Extracted certificates exceed 500 MB; split this ZIP.');
 for(let i=0;i<candidates.length;i++){
 const e=candidates[i];E('smartMessage').textContent='Extracting '+(i+1)+' / '+candidates.length+' from '+file.name;
 if(e.encrypted||e.uncompressedSize>max){report.errors.push(e.filename+' — '+(e.encrypted?'password protected':'over 20 MB'));continue}
 try{
 const blob=await e.getData(new BlobWriter(),{checkSignature:true,onprogress:loaded=>{if(loaded>max)throw Error('Extracted file exceeds size limit')}});
 if(blob.size>max)throw Error('Extracted file exceeds 20 MB');
 const name=e.filename.split(/[\\/]/).pop();if(!name)throw Error('Invalid filename');
 await onFile(new File([blob],name,{type:/\.pdf$/i.test(name)?'application/pdf':/\.png$/i.test(name)?'image/png':/\.webp$/i.test(name)?'image/webp':'image/jpeg'}),file.name+' / '+e.filename);
 }catch(err){report.errors.push(e.filename+' — '+(err.message||'Extraction failed'))}
 }
 }finally{await reader.close()}
}
async function addFiles(list){
 if(state.busy||!state.ready)return;state.busy=true;render();
 const report={added:0,skipped:0,errors:[]};const swqrCards=[];
 async function process(f,source=''){
 if(!accepted(f.name)||f.size>max){report.errors.push(f.name+' — unsupported format or over 20 MB');return}
 const r={id:++seq,file:f,text:'',confirmed:false,done:false,error:'',noExpiry:false};state.rows.push(r);report.added++;
 E('smartMessage').textContent='Reading certificate '+report.added+': '+f.name;
 try{const result=await read(f);if(isNops(result.text,f.name)){Object.assign(r,result,nopsFields(result.text));r.nops=true;render();return}if(isDrivingLicence(result.text,f.name)){Object.assign(r,result,licenceFields(result.text));r.personal=true;render();return}if(isStreetworksCertificate(result.text)){const units=streetworksCertificateRows(result.text);if(units.length){state.rows=state.rows.filter(x=>x!==r);report.added--;for(const unit of units){state.rows.push({...r,...result,...unit,id:++seq});report.added++}render();return}}if(isSwqr(result.text)){state.rows=state.rows.filter(x=>x!==r);report.added--;swqrCards.push({...r,...result});return}Object.assign(r,extract(result.text),result);r.note=[source,r.note].filter(Boolean).join(' · ');applyOpenreachFields(r);applySmartAwardExpiry(r)}
 catch(e){Object.assign(r,extract(''),{note:[source,'Reading failed; enter details manually.'].filter(Boolean).join(' · ')});if(isNops('',f.name)){Object.assign(r,nopsFields(''));r.nops=true}else if(isDrivingLicence('',f.name)){Object.assign(r,licenceFields(''));r.personal=true}}
 render();
 }
 try{for(const f of list){try{if(/\.zip$/i.test(f.name))await unzip(f,process,report);else await process(f)}catch(e){report.errors.push(f.name+' — '+(e.message||'Unable to extract ZIP'))}}await expandSwqr(swqrCards,report)}
 finally{if(worker){try{await worker.terminate()}catch{}worker=null}state.busy=false;
 E('smartMessage').textContent=report.added+' accreditation rows added · '+report.skipped+' unsupported/hidden ZIP entries skipped · '+report.errors.length+' files could not be processed. Check suggested details before approving.';
 const box=E('smartArchiveErrors');if(box){box.hidden=!report.errors.length;box.textContent=report.errors.join('\n')}render()}
}
async function init(){const perm=await db.rpc('is_trainer');if(perm.error||perm.data!==true)throw Error('Academy access required.');const [p,c,a,co]=await Promise.all([db.from('people').select('id,profile_id,full_name,forename,surname,email,employee_number,learner_reference,default_company_id,person_type').eq('status','active').order('full_name'),db.from('accreditation_catalog').select('id,module_code,description,source,active').eq('active',true).order('module_code'),db.from('accreditations').select('id,person_id,learner_id,accreditation_catalog_id,accreditation_name,certificate_number,issue_date,expiry_date,certificate_url,supporting_documents,awarding_body,superseded_by').is('archived_at',null).order('id').range(0,999),db.from('external_customers').select('id,company_name,is_internal_rrt,is_rrt_subcontractor')]);for(const x of [p,c,a,co])if(x.error)throw x.error;const companies=new Map(co.data.filter(x=>x.is_internal_rrt||x.is_rrt_subcontractor).map(x=>[x.id,x.company_name]));state.people=p.data.filter(x=>x.person_type!=='external'&&companies.has(x.default_company_id)).map(x=>({...x,company:companies.get(x.default_company_id)}));state.rawCatalog=c.data;state.catalog=window.RRTAQualificationMaster.options(c.data).filter(q=>q.module_code!=='NOPS');state.catalog.unshift(nopsOption);const access=await db.rpc('can_manage_academy');state.privateAccess=!access.error&&access.data===true;if(state.privateAccess)state.catalog.push(licenceOption);state.records=a.data;let offset=a.data.length;while(offset&&offset%1000===0){const r=await db.from('accreditations').select('id,person_id,learner_id,accreditation_catalog_id,accreditation_name,certificate_number,issue_date,expiry_date,certificate_url,supporting_documents,awarding_body,superseded_by').is('archived_at',null).order('id').range(offset,offset+999);if(r.error)throw r.error;state.records.push(...r.data);if(r.data.length<1000)break;offset+=r.data.length}state.ready=true;E('smartMessage').textContent='Ready to select certificates.';render()}
async function importRows(){if(state.busy)return;const selected=state.rows.filter(r=>r.confirmed&&valid(r));if(!selected.length||!confirm('Import '+selected.length+' approved accreditation records?'))return;state.busy=true;render();const paths=new WeakMap();try{for(const r of selected){if(!valid(r)){r.confirmed=false;continue}const p=state.people.find(x=>x.id===r.person),q=state.catalog.find(x=>String(x.id)===r.qual);let path=null,uploaded=false;try{E('smartMessage').textContent='Importing '+p.full_name+' — '+q.module_code;if(r.nops||q.registration){await saveNops(r,p);r.done=true;r.confirmed=false;render();continue}if(r.personal||q.personal){await saveLicence(r,p);r.done=true;r.confirmed=false;render();continue}if(r.file){path=paths.get(r.file)?.get(p.id);if(!path){path=(p.profile_id||p.id)+'/accreditations/'+crypto.randomUUID()+'-'+r.file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const up=await db.storage.from('learner-documents').upload(path,r.file,{upsert:false});if(up.error)throw up.error;uploaded=true}}const today=new Date().toISOString().slice(0,10),days=r.expiry?(Date.parse(r.expiry)-Date.parse(today))/86400000:null;const payload={person_id:p.id,learner_id:p.profile_id||null,accreditation_catalog_id:q.catalogId??null,accreditation_name:q.entry?window.RRTAQualificationMaster.evidenceName(q,r.text):q.module_code,awarding_body:r.awarding||null,certificate_number:r.number||null,issue_date:r.issue,expiry_date:r.noExpiry?null:r.expiry,certificate_url:path,status:days===null?'current':days<0?'expired':days<=90?'expiring':'current'};const existing=evidenceMatch(r);if(existing){if(!path)throw Error('Supporting evidence file missing');if(shouldPromoteCard(r,existing)){
const previous=existing.certificate_url;const originalDocs=existing.supporting_documents||[];const docs=[...originalDocs];if(previous&&!docs.some(d=>d.path===previous))docs.push({path:previous,kind:'Certificate',name:previous.split('/').pop(),certificate_number:existing.certificate_number,awarding_body:existing.awarding_body,issue_date:existing.issue_date,expiry_date:existing.expiry_date});
let update=db.from('accreditations').update({certificate_url:path,awarding_body:'SWQR',certificate_number:r.number||null,supporting_documents:docs}).eq('id',existing.id).is('archived_at',null).eq('supporting_documents',JSON.stringify(originalDocs));update=previous?update.eq('certificate_url',previous):update.is('certificate_url',null);const result=await update.select('id').single();if(result.error)throw Error('Could not promote card; existing evidence retained. '+result.error.message);Object.assign(existing,{certificate_url:path,awarding_body:'SWQR',certificate_number:r.number||null,supporting_documents:docs});
}else{const res=await db.rpc('append_accreditation_document',{p_id:existing.id,p_path:path,p_kind:r.streetworksCertificate?'Certificate':'Additional evidence',p_name:r.file.name});if(res.error)throw res.error;existing.supporting_documents=[...(existing.supporting_documents||[]),{path,name:r.file.name,kind:r.streetworksCertificate?'Certificate':'Additional evidence'}]}}else{const res=await db.from('accreditations').insert(payload).select('id').single();if(res.error)throw res.error;state.records.push({...payload,id:res.data.id})}if(path&&r.file){if(!paths.has(r.file))paths.set(r.file,new Map());paths.get(r.file).set(p.id,path)}r.done=true;r.confirmed=false}catch(e){if(uploaded&&path)await db.storage.from('learner-documents').remove([path]);r.error=e.message||'Import failed';r.confirmed=false}render()}}finally{state.busy=false;E('smartFilter').value='all';E('smartMessage').textContent=selected.filter(r=>r.done).length+' imported successfully · '+selected.filter(r=>!r.done).length+' not imported. Remaining certificates are shown below; choose Imported to view completed rows.';render()}}
E('smartFiles').onchange=e=>{addFiles([...e.target.files]);e.target.value=''};E('smartDrop').ondragover=e=>e.preventDefault();E('smartDrop').ondrop=e=>{e.preventDefault();addFiles([...e.dataTransfer.files])};E('smartFilter').onchange=render;E('smartImport').onclick=importRows;E('smartApprove').onclick=()=>{if(!confirm('Approve all complete, non-duplicate rows? Only do this after checking the details against the certificates.'))return;state.rows.forEach(r=>{if(valid(r))r.confirmed=true});render()};E('smartTextClose').onclick=()=>E('smartTextDialog').close();
E('smartSheet').onclick=()=>{E('smartMessage').textContent='Use the Spreadsheet Upload tab for spreadsheet imports.'};
init().catch(e=>{E('smartMessage').textContent=e.message;render()});
})();
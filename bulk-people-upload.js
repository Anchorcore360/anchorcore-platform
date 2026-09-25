(function(){const db=window.supabase?.createClient('https://qgbpotjqggeodxqcwkgj.supabase.co','sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS');const cols=['Forename','Surname','Personal Email','Work Email','Mobile','Employee Number','Person Type','Company','Employment Type','Job Title','Primary Job Role','Manager','Start Date','DOB','Smart Awards Learner ID','Smart Awards Card ID','Smart Awards User ID','Smart Awards Email','Photo Filename','Notes'];let parsed=[],photoMap=new Map();const norm=v=>String(v||'').trim().toLowerCase(),dateVal=v=>{if(!v)return null;if(v instanceof Date&&!isNaN(v))return v.toISOString().slice(0,10);const d=new Date(v);return isNaN(d)?null:d.toISOString().slice(0,10)},safe=v=>String(v||'photo').replace(/[^a-zA-Z0-9._-]+/g,'-');
document.getElementById('template').onclick=()=>{const ws=XLSX.utils.aoa_to_sheet([cols,['Example','Person','person@example.com','','07123456789','','workforce','Rapid Response Telecoms Ltd','Direct','Operative','Operative','','','','','','','person@example.com','example-person.jpg','']]);ws['!cols']=cols.map(x=>({wch:Math.max(16,x.length+3)}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'People Import');const help=XLSX.utils.aoa_to_sheet([['RRTA Bulk People Upload'],['Required','Forename, Surname and at least one email address.'],['Person Type','workforce, induction or external_customer. Only workforce appears in Manage People.'],['Personal Email','Retained even after a work email is added.'],['Work Email','Leave blank during induction if not yet issued.'],['DOB','Optional. Leave blank if unknown.'],['Login','Importing a person does NOT create a login account.'],['Photos','Use the exact image filename in Photo Filename and select the matching images/folder before import. JPEG, PNG and WebP only, maximum 5MB each.'],['Duplicates','Email, employee number, Smart Awards IDs and likely name matches are checked first.']]);XLSX.utils.book_append_sheet(wb,help,'Instructions');XLSX.writeFile(wb,'RRTA_Bulk_People_Upload_Template.xlsx')};
const ui = Object.fromEntries(['sheet','photos','photo-folder','clear-photos','photo-summary','upload-status','review','retry-review','rows','ready','warnings','blocked','preview','import'].map(id => [id, document.getElementById(id)]));
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let records = null, checkVersion = 0, sheetVersion = 0, checking = false, reading = false, selecting = false, importing = false;
let checkError = '', photoUrls = [];
const message = (text, error = false) => { ui['upload-status'].textContent = text; ui['upload-status'].className = error ? 'bad' : ''; };
const busy = () => importing || reading || selecting;
function updateControls() {
  ui.import.disabled = busy() || checking || !records || !!checkError || !parsed.some(r => r.__state === 'ready' && !r.__personId && !r.__uncertain);
  for (const id of ['sheet','photos','photo-folder']) ui[id].disabled = busy();
  ui['clear-photos'].disabled = busy() || !photoMap.size;
  ui['retry-review'].disabled = busy() || checking;
}
function photoFor(row) {
  const name = norm(row['Photo Filename']);
  const matches = row.__photoEntry ? [row.__photoEntry] : photoMap.get(name) || [];
  if (!name) return { label: 'No photo requested', css: 'muted' };
  if (!matches.length) return { label: 'Missing photo', css: 'warn', issue: 'Photo file not selected' };
  if (matches.length > 1) return { label: 'Duplicate filename', css: 'bad', issue: 'More than one selected photo has this filename. Clear photos and select a unique file.' };
  const entry = matches[0];
  if (entry.problem) return { ...entry, label: entry.problem, css: 'bad', issue: entry.problem };
  return { ...entry, label: row.__photoSaved ? 'Photo uploaded' : 'Photo matched', css: 'ok' };
}
function validateRows() {
  const people = records?.people || [], profiles = records?.profiles || [];
  const emails = new Set([...people.flatMap(x => [x.email,x.personal_email,x.work_email]), ...profiles.map(x => x.email)].map(norm).filter(Boolean));
  const emp = new Set([...people,...profiles].map(x => norm(x.employee_number)).filter(Boolean));
  const smart = new Set([...people.flatMap(x => [x.smart_awards_learner_id,x.smart_awards_card_id,x.smart_awards_user_id]),...profiles.flatMap(x => [x.smart_quartz_learner_id,x.smart_nops_card_id,x.smart_nops_user_id])].map(norm).filter(Boolean));
  const names = new Set([...people,...profiles].filter(x => String(x.status || x.account_status || 'active') !== 'archived').map(x => norm([x.forename,x.surname].filter(Boolean).join(' ') || x.full_name)).filter(Boolean));
  const count = field => {
    const result = new Map();
    parsed.forEach(r => new Set(field(r).map(norm).filter(Boolean)).forEach(v => result.set(v,(result.get(v)||0)+1)));
    return result;
  };
  const batchEmails = count(r => [r['Personal Email'],r['Work Email']]);
  const batchEmp = count(r => [r['Employee Number']]);
  const batchSmart = count(r => [r['Smart Awards Learner ID'],r['Smart Awards Card ID'],r['Smart Awards User ID']]);
  parsed.forEach((r,i) => {
    const issues = [], warns = [];
    const forename = String(r.Forename || '').trim(), surname = String(r.Surname || '').trim();
    const personal = norm(r['Personal Email']), work = norm(r['Work Email']), employee = norm(r['Employee Number']);
    const type = norm(r['Person Type'] || 'workforce').replace(/ /g,'_');
    const ids = [r['Smart Awards Learner ID'],r['Smart Awards Card ID'],r['Smart Awards User ID']].map(norm).filter(Boolean);
    if (!forename || !surname) issues.push('Forename and surname required');
    if (!personal && !work) issues.push('At least one email required');
    if ([personal,work].some(v => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) issues.push('Invalid email address');
    if (!['workforce','induction','external_customer'].includes(type)) issues.push('Invalid Person Type');
    if ((personal && emails.has(personal)) || (work && emails.has(work))) issues.push('Email already exists');
    if (employee && emp.has(employee)) issues.push('Employee number already exists');
    if (ids.some(x => smart.has(x))) issues.push('Smart Awards ID already exists');
    if ([personal,work].some(x => x && batchEmails.get(x) > 1)) issues.push('Email repeated in spreadsheet');
    if (employee && batchEmp.get(employee) > 1) issues.push('Employee number repeated in spreadsheet');
    if (ids.some(x => batchSmart.get(x) > 1)) issues.push('Smart Awards ID repeated in spreadsheet');
    if (names.has(norm(forename+' '+surname))) warns.push('Name already exists — review possible duplicate');
    const photo = photoFor(r);
    if (photo.issue) issues.push(photo.issue);
    Object.assign(r, {__row:i+2,__issues:issues,__warnings:warns,__type:type});
    r.__state = r.__personId ? (r.__photoError ? 'photo-error' : 'imported') : r.__uncertain ? 'uncertain' : r.__importError ? 'failed' : issues.length ? 'blocked' : warns.length ? 'warning' : 'ready';
  });
}
function renderReview() {
  validateRows();
  ui.review.hidden = !parsed.length;
  ui.rows.textContent = parsed.length;
  ui.ready.textContent = parsed.filter(r => r.__state === 'ready').length;
  ui.warnings.textContent = parsed.filter(r => r.__state === 'warning' || r.__state === 'photo-error').length;
  ui.blocked.textContent = parsed.filter(r => ['blocked','failed','uncertain'].includes(r.__state)).length;
  ui.preview.innerHTML = parsed.map(r => {
    const photo = photoFor(r);
    if (r.__photoError) { photo.label = 'Photo upload failed'; photo.css = 'bad'; }
    let result = checking ? 'Checking existing people…' : checkError ? 'Checks unavailable — retry checks' : r.__state === 'ready' ? 'Ready' : [...r.__issues,...r.__warnings].join('; ');
    if (r.__personId) result = r.__photoError ? 'Person imported; photo failed: '+r.__photoError+'. Open View people to add the photo.' : 'Imported';
    if (r.__importError) result = 'Import failed: '+r.__importError;
    if (r.__uncertain) result = 'Import status unknown. Check View people before trying again.';
    const css = r.__state === 'ready' || r.__state === 'imported' ? 'ok' : r.__state === 'warning' ? 'warn' : 'bad';
    return `<tr><td><b>${escapeHtml(r.Forename)} ${escapeHtml(r.Surname)}</b><br><small>Row ${r.__row} · ${escapeHtml(r.__type)}</small></td><td class="photo-cell"><div class="photo-preview">${photo.url ? `<img src="${escapeHtml(photo.url)}" alt="Selected photo for ${escapeHtml(r.Forename)} ${escapeHtml(r.Surname)}">` : ''}<div><small>${escapeHtml(r['Photo Filename'] || '—')}</small><strong class="${photo.css}">${escapeHtml(photo.label)}</strong></div></div></td><td class="result-cell ${css}">${escapeHtml(result)}</td>${['Personal Email','Work Email','Employee Number','Company','Primary Job Role','Smart Awards Learner ID'].map(k => `<td>${escapeHtml(r[k] || '—')}</td>`).join('')}</tr>`;
  }).join('');
  const selected = [...photoMap.values()].flat();
  const requested = new Set(parsed.map(r => norm(r['Photo Filename'])).filter(Boolean));
  const unused = selected.filter(x => !requested.has(norm(x.file.name))).length;
  ui['photo-summary'].textContent = selected.length ? `${selected.length} photo file(s) selected.${parsed.length && unused ? ` ${unused} not referenced in the spreadsheet.` : ''}` : 'No photos selected.';
  updateControls();
}
async function addPhotos(event) {
  const files = [...event.target.files];
  if (!files.length || busy()) return;
  selecting = true;
  updateControls();
  try {
    for (const file of files) {
      const key = norm(file.name), entries = photoMap.get(key) || [];
      if (entries.some(x => x.file.name === file.name && x.file.size === file.size && x.file.lastModified === file.lastModified && x.file.webkitRelativePath === file.webkitRelativePath)) continue;
      const entry = {file};
      if (!['image/jpeg','image/png','image/webp'].includes(file.type)) entry.problem = 'Wrong file type — use JPEG, PNG or WebP';
      else if (file.size > 5242880) entry.problem = 'Photo exceeds 5MB';
      else {
        const url = URL.createObjectURL(file);
        const image = new Image(); image.src = url;
        try { await image.decode(); entry.url = url; photoUrls.push(url); }
        catch (_) { URL.revokeObjectURL(url); entry.problem = 'Photo cannot be read'; }
      }
      entries.push(entry); photoMap.set(key,entries);
    }
  } catch (error) { message('Unable to read the selected photos: '+error.message,true); }
  finally { selecting = false; renderReview(); }
}
ui.photos.onchange = addPhotos;
ui['photo-folder'].onchange = addPhotos;
ui['clear-photos'].onclick = () => {
  // Keep the saved result thumbnails visible after clearing pending selections.
  const savedUrls = new Set(parsed.map(row => row.__photoEntry?.url).filter(Boolean));
  photoUrls.filter(url => !savedUrls.has(url)).forEach(url => URL.revokeObjectURL(url));
  photoUrls = photoUrls.filter(url => savedUrls.has(url)); photoMap.clear();
  ui.photos.value = ''; ui['photo-folder'].value = '';
  renderReview();
};
ui.sheet.onchange = async event => {
  const file = event.target.files[0];
  if (!file || busy()) return;
  const version = ++sheetVersion;
  ++checkVersion; checking = false; reading = true; parsed = []; records = null; checkError = '';
  ui['retry-review'].hidden = true;
  renderReview(); message('Reading spreadsheet…');
  try {
    if (!window.XLSX) throw new Error('The spreadsheet reader did not load. Refresh the page and try again.');
    const data = await file.arrayBuffer();
    if (version !== sheetVersion) return;
    const wb = XLSX.read(data,{type:'array',cellDates:true});
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) throw new Error('No worksheet found. Use the RRTA template.');
    const headers = XLSX.utils.sheet_to_json(ws,{header:1,defval:''})[0] || [];
    if (!['Forename','Surname'].every(k => headers.includes(k)) || !['Personal Email','Work Email'].some(k => headers.includes(k))) throw new Error('Required columns are missing. Use the RRTA template and keep its column headings.');
    parsed = XLSX.utils.sheet_to_json(ws,{defval:''});
    if (!parsed.length) throw new Error('The spreadsheet has no people to import.');
    reading = false;
    await checkExistingPeople();
  } catch (error) { parsed = []; message('Could not read spreadsheet: '+error.message,true); }
  finally { reading = false; renderReview(); }
};
async function checkExistingPeople() {
  const version = ++checkVersion;
  checking = true; records = null; checkError = '';
  ui['retry-review'].hidden = true;
  renderReview(); message('Checking people and photo matches…');
  try {
    const [a,b] = await Promise.all([
      db.from('people').select('id,full_name,forename,surname,email,personal_email,work_email,employee_number,smart_awards_learner_id,smart_awards_card_id,smart_awards_user_id,status'),
      db.from('profiles').select('id,full_name,forename,surname,email,employee_number,smart_quartz_learner_id,smart_nops_card_id,smart_nops_user_id,account_status')
    ]);
    if (version !== checkVersion) return;
    if (a.error || b.error) throw (a.error || b.error);
    records = {people:a.data || [],profiles:b.data || []};
    message('Review the table below, then choose Import Ready People. Files are not saved until you import.');
  } catch (error) {
    if (version !== checkVersion) return;
    checkError = error.message || 'Connection failed';
    message('Unable to check existing people: '+checkError+'. Check your connection and sign-in, then retry checks.',true);
    ui['retry-review'].hidden = false;
  } finally {
    if (version === checkVersion) { checking = false; renderReview(); }
  }
}
ui['retry-review'].onclick = checkExistingPeople;
async function uploadPhoto(personId,row) {
  const photo = photoFor(row);
  if (!norm(row['Photo Filename'])) return;
  if (photo.issue || !photo.file) throw new Error(photo.issue || 'Photo is missing');
  const path = `people/${personId}/${Date.now()}-${safe(photo.file.name)}`;
  const up = await db.storage.from('learner-photos').upload(path,photo.file,{cacheControl:'3600',upsert:false});
  if (up.error) throw up.error;
  const set = await db.rpc('set_person_photo',{p_person_id:personId,p_photo_path:path});
  if (set.error) { await db.storage.from('learner-photos').remove([path]); throw set.error; }
  row.__photoSaved = true;
}
ui.import.onclick = async () => {
  if (ui.import.disabled || busy()) return;
  const list = parsed.filter(r => r.__state === 'ready' && !r.__personId && !r.__uncertain);
  if (!list.length || !confirm(`Import ${list.length} ready people? This creates person records only and does not create login accounts.`)) return;
  importing = true; ui.import.textContent = 'Importing…'; updateControls();
  let done = 0, failures = 0;
  try {
    for (const r of list) {
      message(`Importing person ${done+failures+1} of ${list.length}…`);
      let response;
      try {
        response = await db.rpc('bulk_import_person',{
          p_forename:r.Forename,p_surname:r.Surname,p_personal_email:r['Personal Email']||null,p_work_email:r['Work Email']||null,
          p_phone:r.Mobile||null,p_employee_number:r['Employee Number']||null,p_person_type:r.__type,p_job_title:r['Job Title']||null,
          p_employment_type:r['Employment Type']||null,p_start_date:dateVal(r['Start Date']),p_date_of_birth:dateVal(r.DOB),
          p_smart_learner_id:r['Smart Awards Learner ID']||null,p_smart_card_id:r['Smart Awards Card ID']||null,p_smart_user_id:r['Smart Awards User ID']||null,
          p_smart_email:r['Smart Awards Email']||null,p_photo_path:null,p_notes:r.Notes||null
        });
      } catch (_) { r.__uncertain = true; failures++; renderReview(); continue; }
      if (response.error) { r.__importError = response.error.message; failures++; renderReview(); continue; }
      if (!response.data) { r.__uncertain = true; failures++; renderReview(); continue; }
      r.__personId = response.data; r.__photoEntry = (photoMap.get(norm(r['Photo Filename'])) || [])[0]; done++;
      try { await uploadPhoto(r.__personId,r); }
      catch (error) { r.__photoError = error.message || 'Upload failed'; }
      renderReview();
    }
    const photoFailures = list.filter(r => r.__photoError).length;
    message(`${done} people imported. ${failures} could not be confirmed.${photoFailures ? ` ${photoFailures} photo upload(s) failed — see the table before leaving.` : ' Review the saved results below.'}`,failures > 0 || photoFailures > 0);
  } finally { importing = false; ui.import.textContent = 'Import Ready People'; renderReview(); }
};
window.addEventListener('beforeunload',event => {
  if (importing) { event.preventDefault(); event.returnValue = ''; }
});
if (!window.XLSX || !db) {
  message('The upload tools did not load. Refresh the page and check your connection.',true);
  for (const id of ['sheet','photos','photo-folder','import']) ui[id].disabled = true;
  document.getElementById('template').disabled = !window.XLSX;
}
})();

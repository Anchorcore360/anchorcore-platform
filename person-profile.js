(function () {
  const app = document.getElementById('app');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const id = new URLSearchParams(location.search).get('id');
  let db, person, companies = [], canEdit = false;
  const field = (key,label,type='text') => `<label>${label}<input id="person-${key}" type="${type}" value="${esc(person[key] || '')}" ${['forename','surname'].includes(key)?'required':''}></label>`;
  const companyName = () => companies.find(c => c.id === person.default_company_id)?.company_name || 'Company not assigned';
  function render() {
    const name = person.full_name || [person.forename,person.surname].filter(Boolean).join(' ') || 'Unnamed';
    const initials = name.split(/\s+/).filter(Boolean).map(s=>s[0]).slice(0,2).join('').toUpperCase();
    app.innerHTML = `<header class="head"><div id="person-photo" class="avatar">${esc(initials)}</div><div><h1>${esc(name)}</h1><p class="muted">${esc(person.email || 'No email recorded')}</p><span class="pill">${person.profile_id?'Linked login profile':'No login account'}</span></div></header>
      <p id="photo-status" class="muted" role="status"></p>
      <p><strong>Company:</strong> ${esc(companyName())}</p>
      <p class="notice">People without a company appear under External People. Assign Rapid Response Telecoms to move this person into its people list. Saving these details does not create a login account.</p>
      ${person.profile_id?`<a class="btn" href="learner-profile.html?id=${encodeURIComponent(person.profile_id)}">Open full learner profile</a>`:''}
      <form id="person-form"><fieldset id="person-fields" ${!canEdit||person.profile_id?'disabled':''}><legend>Person details</legend><div class="grid">
      ${field('forename','Forename')}${field('surname','Surname')}${field('personal_email','Personal email','email')}${field('work_email','Work email','email')}
      <label>Company<select id="person-company"><option value="">Company not assigned</option>${companies.filter(c=>c.active!==false||c.id===person.default_company_id).map(c=>`<option value="${esc(c.id)}" ${c.id===person.default_company_id?'selected':''}>${esc(c.company_name)}${c.active===false?' (inactive)':''}</option>`).join('')}</select></label>
      ${field('job_title','Job title')}${field('employee_number','Employee number')}${field('phone','Mobile')}${field('date_of_birth','Date of birth','date')}
      <label>Notes<textarea id="person-notes">${esc(person.notes || '')}</textarea></label></div>
      <p class="muted">Forename, surname and at least one email address are required. Other details can be added later.</p>
      <button id="save-person" class="btn primary" type="submit">Save changes</button></fieldset><p id="save-status" role="status" aria-live="polite"></p></form>`;
    document.getElementById('person-form').onsubmit = save;
    if (!canEdit) document.getElementById('save-status').textContent = 'Your account has read-only access to this record.';
    if (person.profile_id) document.getElementById('save-status').textContent = 'Use the full learner profile to edit this linked account.';
    if (person.photo_path) loadPhoto(person.photo_path,name);
  }
  async function loadPhoto(path,name) {
    try {
      const {data,error}=await db.storage.from('learner-photos').createSignedUrl(path,3600);
      if(error||!data?.signedUrl) throw error||Error('Photo unavailable');
      const image=document.createElement('img');image.src=data.signedUrl;image.alt=name;
      image.onerror=()=>{image.remove();document.getElementById('photo-status').textContent='The saved photo could not be loaded. Refresh to try again.'};
      document.getElementById('person-photo').appendChild(image);
    } catch (_) { document.getElementById('photo-status').textContent='The saved photo could not be loaded. Refresh to try again.'; }
  }
  async function save(event) {
    event.preventDefault();
    const fields=document.getElementById('person-fields'), status=document.getElementById('save-status');
    if(!canEdit||person.profile_id||fields.disabled)return;
    const value=key=>document.getElementById('person-'+key).value.trim();
    const patch=Object.fromEntries(['forename','surname','personal_email','work_email','job_title','employee_number','phone','date_of_birth','notes'].map(key=>[key,value(key)||null]));
    if(!patch.forename||!patch.surname||(!patch.personal_email&&!patch.work_email)){status.textContent='Enter forename, surname and at least one email address.';return;}
    if([patch.personal_email,patch.work_email].some(v=>v&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))){status.textContent='Enter valid email addresses.';return;}
    patch.default_company_id=value('company')||null;
    if(patch.default_company_id&&!companies.some(c=>c.id===patch.default_company_id&&(c.active!==false||c.id===person.default_company_id))){status.textContent='Choose a company from the list.';return;}
    patch.full_name=patch.forename+' '+patch.surname;patch.email=patch.work_email||patch.personal_email;patch.updated_at=new Date().toISOString();
    fields.disabled=true;status.textContent='Saving…';
    try {
      // Return the saved row: an RLS-denied update must not look like success.
      const {data,error}=await db.from('people').update(patch).eq('id',person.id).is('profile_id',null).select('*').single();
      if(error||!data)throw error||Error('No record was updated. Refresh and check your access.');
      person=data;render();document.getElementById('save-status').textContent='Changes saved. Return to Manage People to see the updated company grouping.';
    } catch(error) {status.textContent='Could not save: '+(error.message||'Connection failed.');fields.disabled=false;}
  }
  async function load() {
    if(!id)throw Error('No person was selected. Return to Manage People and choose Profile.');
    if(!window.supabase)throw Error('The profile tools could not load. Refresh and check your connection.');
    db=window.supabase.createClient('https://qgbpotjqggeodxqcwkgj.supabase.co','sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS');
    const {data:auth,error}=await db.auth.getUser();
    if(error&&error.name!=='AuthSessionMissingError')throw Error('Unable to verify your sign-in. Refresh and try again.');
    if(!auth?.user){app.innerHTML='<h1>Sign in to view this person</h1><p>Your session has ended.</p><a class="btn" href="portal.html">Sign in</a>';return;}
    const result=await db.from('people').select('*').eq('id',id).single();
    if(result.error||!result.data)throw result.error||Error('Person not found or access unavailable.');
    person=result.data;
    const [companyResult,permission]=await Promise.all([db.from('external_customers').select('id,company_name,active').order('company_name'),db.rpc('is_trainer')]);
    if(companyResult.error)throw companyResult.error;
    companies=companyResult.data||[];canEdit=!permission.error&&permission.data===true;
    if(!person.personal_email&&!person.work_email)person.personal_email=person.email||'';
    render();
  }
  load().catch(error=>{app.textContent='Unable to load profile: '+(error.message||'Please refresh and try again.');});
})();

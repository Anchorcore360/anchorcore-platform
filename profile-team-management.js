(function(){
  if(window.__rrtaProfileTeamManagement)return;
  window.__rrtaProfileTeamManagement=true;
  let directory=[],directReports=[];

  const roleOf=p=>String(p?.organisational_access_role||p?.portal_access_role||'operative').toLowerCase();
  const roleLabel=v=>({operative:'Operative',supervisor:'Supervisor',manager:'Manager',operations_manager:'Operations Manager'}[String(v||'').toLowerCase()]||'Operative');

  async function loadTeam(){
    if(typeof db==='undefined'||typeof learnerId==='undefined'||!learnerId)return;
    const {data,error}=await db.from('profiles').select('id,full_name,email,job_title,account_status,manager_1_id,organisational_access_role,portal_access_role').eq('account_status','active').order('full_name');
    if(error)throw error;
    directory=data||[];
    directReports=directory.filter(p=>p.manager_1_id===learnerId);
  }

  function allowedCandidate(p,currentRole){
    if(p.id===learnerId||p.manager_1_id===learnerId)return false;
    const role=roleOf(p);
    if(currentRole==='supervisor')return role==='operative';
    if(currentRole==='manager')return role==='supervisor'||role==='operative';
    if(currentRole==='operations_manager')return role==='manager'||role==='supervisor'||role==='operative';
    return false;
  }

  function ensurePanel(){
    const overview=document.getElementById('tab-overview');
    if(!overview||typeof learner==='undefined'||!learner)return null;
    const currentRole=roleOf(learner);
    let panel=document.getElementById('profileTeamPanel');
    if(!['supervisor','manager','operations_manager'].includes(currentRole)){
      panel?.remove();
      return null;
    }
    if(!panel){
      panel=document.createElement('article');
      panel.id='profileTeamPanel';
      panel.className='panel-card';
      panel.style.marginBottom='16px';
      const personal=document.getElementById('editProfileBtn2')?.closest('.panel-card');
      if(personal)personal.insertAdjacentElement('afterend',panel);else overview.prepend(panel);
    }
    panel.innerHTML=`<div class="panel-head-row"><div><h2>Team & Reporting</h2><p class="muted">${currentRole==='supervisor'?'Add operatives who report to this supervisor.':'Add supervisors or operatives who report to this manager.'}</p></div><button type="button" class="btn dark small" id="addTeamMemberBtn">+ Add Team Member</button></div><div class="record-list">${directReports.length?directReports.map(p=>`<div class="record"><div><strong>${esc(p.full_name||'Unnamed person')}</strong><small>${esc(roleLabel(roleOf(p)))} · ${esc(p.job_title||'Job title not set')}</small></div><button type="button" class="btn secondary small" data-remove-team="${p.id}">Remove</button></div>`).join(''):'<div class="empty">No people currently report to this person.</div>'}</div>`;
    panel.querySelector('#addTeamMemberBtn').onclick=()=>openAddTeamMember(currentRole);
    panel.querySelectorAll('[data-remove-team]').forEach(btn=>btn.onclick=()=>removeTeamMember(btn.dataset.removeTeam));
    return panel;
  }

  function openAddTeamMember(currentRole){
    const candidates=directory.filter(p=>allowedCandidate(p,currentRole));
    if(!candidates.length){alert('No eligible active people are available to add.');return}
    modal('Add Team Member',`<div class="form-grid"><label style="grid-column:1/-1">Person<select name="person_id" required><option value="">Select a person</option>${candidates.map(p=>`<option value="${p.id}">${esc(p.full_name||'Unnamed')} — ${esc(roleLabel(roleOf(p)))}${p.job_title?' · '+esc(p.job_title):''}</option>`).join('')}</select></label></div><div class="notice" style="margin-top:12px">This sets the selected person's primary reporting manager to ${esc(learner.full_name||'this person')}.</div>`,async form=>{
      const personId=form.get('person_id');
      if(!personId)throw new Error('Select a person to add.');
      const {error}=await db.from('profiles').update({manager_1_id:learnerId,updated_at:new Date().toISOString()}).eq('id',personId);
      if(error)throw error;
      await loadTeam();
      ensurePanel();
    });
  }

  async function removeTeamMember(personId){
    if(!confirm('Remove this person from the team?'))return;
    const {error}=await db.from('profiles').update({manager_1_id:null,updated_at:new Date().toISOString()}).eq('id',personId).eq('manager_1_id',learnerId);
    if(error){alert(error.message);return}
    await loadTeam();
    ensurePanel();
  }

  async function apply(){
    try{await loadTeam();ensurePanel()}catch(e){console.warn('Team management unavailable',e)}
  }

  const start=()=>setTimeout(apply,350);
  window.addEventListener('load',start);
  if(document.readyState==='complete'||document.readyState==='interactive')start();
  if(typeof render==='function'){
    const previous=render;
    render=async function(){const result=await previous.apply(this,arguments);setTimeout(apply,180);return result};
  }
})();
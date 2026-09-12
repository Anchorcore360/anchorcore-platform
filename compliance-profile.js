function complianceNormalize(v=''){return String(v||'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim()}
function complianceCode(v=''){const s=String(v||'').toUpperCase();const m=s.match(/\b(SA\d+[A-Z]?|S\d{3}|Q\d{2,3}|O\d+|IPAF\s*1B|EFAW\s*L?3|SHEA\s*TELECOMS)\b/);return m?m[1].replace(/\s+/g,''):''}
function complianceMatches(requirement,acc){const rc=complianceCode(requirement),ac=complianceCode(acc.accreditation_name);if(rc&&ac)return rc===ac;const r=complianceNormalize(requirement).replace(/ CERTIFIED/g,'').replace(/ AWARENESS FOR EMPLOYEES/g,'');const a=complianceNormalize(acc.accreditation_name);return r===a||a.includes(r)||r.includes(a)}
function complianceStatus(acc){if(!acc)return 'missing';if(!acc.expiry_date)return 'valid';const today=new Date();today.setHours(0,0,0,0);const end=new Date(acc.expiry_date+'T00:00:00');const days=Math.ceil((end-today)/86400000);if(days<0)return 'expired';if(days<=30)return 'expiring';return 'valid'}

async function analyseComplianceRole(role){
  const reqRes=await db.from('job_role_requirements').select('status,notes,compliance_item_id,compliance_items(id,name)').eq('job_role_id',role.job_role_id).eq('status','required');
  if(reqRes.error)throw reqRes.error;
  const reqs=reqRes.data||[];
  const analysed=reqs.map(r=>{const match=accreditations.find(a=>complianceMatches(r.compliance_items?.name||'',a));return{requirement:r.compliance_items?.name||'Requirement',match,status:complianceStatus(match)}});
  const covered=analysed.filter(x=>x.status==='valid'||x.status==='expiring').length;
  const missing=analysed.filter(x=>x.status==='missing').length;
  const expired=analysed.filter(x=>x.status==='expired').length;
  const expiring=analysed.filter(x=>x.status==='expiring').length;
  const total=analysed.length;
  const pct=total?Math.round((covered/total)*100):0;
  return {...role,analysed,covered,missing,expired,expiring,total,pct};
}

function complianceRoleCard(r,label){
  return `<div style="display:grid;grid-template-columns:94px 1fr;gap:15px;align-items:center;min-width:0;padding:8px 0">
    <div style="--pct:${r.pct};width:88px;height:88px;border-radius:50%;background:conic-gradient(#17824a calc(var(--pct)*1%),#e7ebee 0);display:grid;place-items:center">
      <div style="width:64px;height:64px;border-radius:50%;background:#fff;display:grid;place-items:center;text-align:center">
        <strong style="font-size:20px;line-height:1">${r.pct}%</strong><span style="font-size:9px;color:#667085">covered</span>
      </div>
    </div>
    <div style="min-width:0">
      <div style="font-size:10px;font-weight:850;letter-spacing:.06em;text-transform:uppercase;color:#9d0b1a;margin-bottom:3px">${label}</div>
      <div style="font-weight:850;font-size:16px;color:#252b31;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.job_roles?.name||'Job role')}</div>
      <div style="color:#667085;font-size:12px;margin-top:2px">${esc(r.job_roles?.division||'')} · ${r.covered} of ${r.total} covered</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:9px"><span class="pill pass">${r.covered} covered</span><span class="pill refer">${r.missing} missing</span>${r.expired?`<span class="pill refer">${r.expired} expired</span>`:''}${r.expiring?`<span class="pill assigned">${r.expiring} expiring</span>`:''}</div>
    </div>
  </div>`;
}

async function loadComplianceSnapshot(){
  const box=document.getElementById('complianceSnapshot');if(!box||!learner?.id)return;
  box.innerHTML='<div class="empty">Calculating role compliance…</div>';
  try{
    const roleRes=await db.from('profile_job_roles').select('job_role_id,is_primary,job_roles(id,name,division)').eq('profile_id',learner.id).order('is_primary',{ascending:false});
    if(roleRes.error)throw roleRes.error;
    const roles=roleRes.data||[];
    if(!roles.length){box.innerHTML='<div class="empty">No job roles have been assigned yet.</div>';return;}
    const primary=roles.find(r=>r.is_primary)||roles[0];
    const secondary=roles.find(r=>!r.is_primary&&r.job_role_id!==primary.job_role_id);
    const primaryData=await analyseComplianceRole(primary);
    const secondaryData=secondary?await analyseComplianceRole(secondary):null;
    box.innerHTML=`<button type="button" id="openComplianceDetail" style="width:100%;border:0;background:transparent;padding:0;text-align:left;cursor:pointer">
      <div style="display:grid;grid-template-columns:${secondaryData?'1fr 1fr':'1fr'};gap:18px;align-items:start">
        ${complianceRoleCard(primaryData,'Primary role')}
        ${secondaryData?complianceRoleCard(secondaryData,'Secondary role'):''}
      </div>
      <div style="margin-top:12px;color:#9d0b1a;font-weight:800;font-size:12px">View full compliance →</div>
    </button>`;
    const grid=box.querySelector('#openComplianceDetail > div');
    if(grid&&window.innerWidth<1100)grid.style.gridTemplateColumns='1fr';
    document.getElementById('openComplianceDetail').onclick=()=>location.href=`learner-compliance.html?id=${encodeURIComponent(learner.id)}`;
  }catch(e){box.innerHTML=`<div class="empty">Unable to calculate compliance: ${esc(e.message||'Unknown error')}</div>`}
}
const complianceOriginalRender=render;render=async function(){await complianceOriginalRender();await loadComplianceSnapshot();};

// Keep the History UI separate from the core learner profile so it only loads when needed.
(function(){const s=document.createElement('script');s.src='learner-history.js?v=20260912-1';document.body.appendChild(s)})();

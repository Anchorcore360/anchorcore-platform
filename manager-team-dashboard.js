(function(){
'use strict';
if(window.__rrtaManagerSkillsDashboard)return;
window.__rrtaManagerSkillsDashboard=true;
if((location.pathname.split('/').pop()||'').toLowerCase()!=='manager-team.html')return;
const URL_BASE='https://qgbpotjqggeodxqcwkgj.supabase.co',API_KEY='sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const code=v=>(String(v||'').toUpperCase().match(/\b(?:SA\d+[A-Z]?|S\d{3}|O\d+|IPAF\s*1B)\b/)||[])[0]?.replace(/\s+/g,'')||'';
const norm=v=>String(v||'').toUpperCase().replace(/&/g,' AND ').replace(/[^A-Z0-9]+/g,' ').trim();
const key=v=>code(v)||norm(v);
const matches=(req,cert)=>{const a=code(req),b=code(cert);return a&&b?(a===b||(a==='SA002'&&b==='SA006')):norm(req)===norm(cert)};
const start=new Date();start.setHours(0,0,0,0);
const days=d=>d&&/^\d{4}-\d{2}-\d{2}/.test(String(d))?Math.round((new Date(String(d).slice(0,10)+'T00:00:00')-start)/86400000):null;
const fmt=d=>d?new Date(String(d).slice(0,10)+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—';
const initials=n=>String(n||'?').split(/\s+/).slice(0,2).map(x=>x.charAt(0)).join('').toUpperCase();
const state=a=>!a?'missing':days(a.expiry_date)===null?'valid':days(a.expiry_date)<0?'expired':days(a.expiry_date)<=30?'expiring':'valid';
let db,members=[],certs=[],tasks=[],windowDays=30,search='',filter='all';
const style=document.createElement('style');
style.textContent=[
'body.rrta-skills{background:#1b2028;color:#f5f6f8}body.rrta-skills .top{background:#202630;color:#f8fafc;border-color:#414a56}body.rrta-skills .content{max-width:1640px;padding:26px 28px}body.rrta-skills .head h1{color:#fff}body.rrta-skills .head .muted{color:#b7c0ce}',
'body.rrta-skills .tabs button{background:#2b323e;color:#e2e7ee;border:1px solid #4c5564}body.rrta-skills .tabs button.active{background:#b20f22;border-color:#b20f22;color:#fff}body.rrta-skills #requestsView{color:#18202a}body.rrta-skills #requestsView .muted{color:#6f7a88}',
'body.rrta-skills #teamView .stat,body.rrta-skills #teamView .panel{background:#252c37;border:1px solid #414a58;color:#fff;box-shadow:none}body.rrta-skills #teamView .stat span{color:#bcc5d2;font-size:11px}body.rrta-skills #teamView .stats{grid-template-columns:repeat(4,minmax(0,1fr))}',
'.skill-dashboard{display:grid;gap:12px}.skill-charts{display:grid;grid-template-columns:minmax(225px,1fr) minmax(260px,1.25fr) minmax(245px,1fr);gap:12px}.skill-panel{min-width:0;padding:18px;border:1px solid #424b59;border-radius:13px;background:#252c37;color:#f3f5f8}.skill-panel h2{font-size:15px;margin:0 0 6px}.skill-sub{font-size:11px;color:#b8c3d2;margin:0 0 14px;line-height:1.5}.skill-muted{font-size:11px;color:#b8c3d2}',
'.skill-donut-box{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.skill-donut{height:132px;width:132px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#e33d50 0 var(--part),#444d5b var(--part) 100%)}.skill-donut b{display:grid;place-items:center;background:#252c37;width:96px;height:96px;border-radius:50%;font-size:27px}.skill-legend{display:grid;gap:12px;flex:1;min-width:120px}.skill-legend div{display:flex;align-items:center;justify-content:space-between;font-size:11px;gap:8px}.skill-legend small{color:#b8c3d2}',
'.skill-bar{margin-top:13px}.skill-bar-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:5px;font-size:11px}.skill-bar-head span{overflow-wrap:anywhere}.skill-bar-head b{white-space:nowrap}.skill-bar-track{height:10px;border-radius:10px;background:#434c5a;overflow:hidden}.skill-bar-track i{display:block;height:100%;background:#e34054;border-radius:10px}',
'.skill-forecast{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.skill-forecast div{background:#313948;border:1px solid #4c5664;border-radius:9px;padding:13px 9px;text-align:center}.skill-forecast b{display:block;font-size:25px}.skill-forecast small{color:#b8c3d2;font-size:10px}.skill-overdue{color:#ff7380}.skill-urgent{color:#f9bd70}',
'.skill-section-head{display:flex;align-items:end;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:13px}.skill-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.skill-controls input,.skill-controls select{background:#333c49;border:1px solid #5c6776;border-radius:7px;color:#fff;font:inherit;font-size:11px;padding:9px;min-height:36px}.skill-controls input{min-width:195px}.skill-controls button{min-height:34px;border:1px solid #647082;border-radius:8px;background:#384454;color:#fff;font-size:10px;font-weight:800;padding:7px 11px;cursor:pointer}.skill-controls button.active{background:#b20f22;border-color:#d43349}',
'.skill-table-wrap{overflow-x:auto;width:100%}.skill-table{border-collapse:collapse;width:100%;min-width:740px;color:#f4f6f8}.skill-table th{background:#343d4b;text-align:left;font-size:10px;color:#c7d0df;padding:11px}.skill-table td{font-size:11px;padding:11px;border-top:1px solid #434c59;vertical-align:middle}.skill-table tr:hover td{background:#2d3542}.skill-table a{color:#f5f7fa;text-decoration:none;font-weight:850}.skill-table a:hover{text-decoration:underline;color:#ff8896}.skill-pill{display:inline-block;border-radius:50px;font-size:10px;padding:5px 8px;background:#485363;color:#fff;white-space:nowrap}.skill-pill.expired,.skill-pill.missing{background:#63313c;color:#ffd5dd}.skill-pill.expiring{background:#65522c;color:#ffedc4}.skill-pill.valid{background:#285343;color:#d7f9e5}',
'.skill-request{display:inline-block;border-radius:8px;background:#b20f22;border:1px solid #d13147;padding:8px 10px;font-size:10px;font-weight:800;text-decoration:none;color:#fff;white-space:nowrap}.skill-avatar{display:inline-grid;place-items:center;height:31px;width:31px;border-radius:50%;background:#546071;color:#fff;font-size:10px;font-weight:900;margin-right:8px}.skill-progress{display:flex;align-items:center;gap:7px}.skill-progress i{height:8px;width:92px;background:#454f5e;border-radius:5px;overflow:hidden}.skill-progress em{display:block;height:100%;background:#43bc80;border-radius:5px}.skill-empty{color:#bfccd9;text-align:center;padding:26px 8px;font-size:12px}#teamGrid.skill-team-grid{display:block!important;grid-template-columns:none!important;overflow-x:auto}',
'@media(max-width:1200px){.skill-charts{grid-template-columns:repeat(2,minmax(0,1fr))}.skill-charts>:last-child{grid-column:1/-1}}@media(max-width:850px){body.rrta-skills #teamView .stats{grid-template-columns:repeat(2,minmax(0,1fr))}.skill-charts{grid-template-columns:1fr}.skill-charts>:last-child{grid-column:auto}}@media(max-width:540px){body.rrta-skills .content{padding:16px 12px 40px}.skill-forecast{grid-template-columns:repeat(2,minmax(0,1fr))}.skill-panel{padding:12px}}'
].join('\n');
document.head.appendChild(style);
async function byIds(table,select,column,ids){
 if(!ids.length)return [];
 const rows=[];
 for(let i=0;i<ids.length;i+=80){
  const r=await db.from(table).select(select).in(column,ids.slice(i,i+80));
  if(r.error)throw new Error('Cannot read '+table+': '+r.error.message);
  rows.push(...(r.data||[]));
 }
 return rows;
}
function preferredAccs(rows){
 const map=new Map();
 rows.forEach(a=>{const k=key(a.accreditation_name);if(!k)return;const prev=map.get(k);if(!prev||String(a.expiry_date||'9999-12-31')>String(prev.expiry_date||'9999-12-31'))map.set(k,a)});
 return [...map.values()];
}
async function load(){
 if(!window.supabase?.createClient)throw new Error('Supabase connection unavailable.');
 db=window.supabase.createClient(URL_BASE,API_KEY);
 const au=await db.auth.getUser();if(!au.data?.user)return;
 const id=au.data.user.id;
 const p=await db.from('profiles').select('id,full_name,employee_number,job_title,organisational_access_role,portal_access_role,account_status,manager_1_id,manager_2_id,manager_3_id').or('manager_1_id.eq.'+id+',manager_2_id.eq.'+id+',manager_3_id.eq.'+id).order('full_name');
 if(p.error)throw new Error(p.error.message);
 const people=(p.data||[]).filter(x=>!['inactive','archived'].includes(x.account_status)&&!['external'].includes(String(x.organisational_access_role||x.portal_access_role||'').toLowerCase()));
 const ids=people.map(x=>x.id);
 const [assign,acc]=await Promise.all([byIds('profile_job_roles','profile_id,job_role_id,is_primary','profile_id',ids),byIds('accreditations','learner_id,accreditation_name,expiry_date,status','learner_id',ids)]);
 const roleIds=[...new Set(assign.map(x=>x.job_role_id).filter(Boolean))];
 const [roleRows,req]=await Promise.all([byIds('job_roles','id,name','id',roleIds),byIds('job_role_requirements','job_role_id,compliance_item_id,status','job_role_id',roleIds)]);
 const active=req.filter(x=>String(x.status||'required').toLowerCase()!=='inactive');
 const items=await byIds('compliance_items','id,name','id',[...new Set(active.map(x=>x.compliance_item_id).filter(Boolean))]);
 const names=new Map(items.map(x=>[x.id,x.name])),roles=new Map(roleRows.map(x=>[x.id,x.name]));
 members=people.map(person=>{
  const linked=assign.filter(x=>x.profile_id===person.id).sort((a,b)=>Number(!!b.is_primary)-Number(!!a.is_primary));
  const rid=[...new Set(linked.map(x=>x.job_role_id))];
  const requirements=[...new Map(active.filter(x=>rid.includes(x.job_role_id)).map(x=>[x.compliance_item_id,x])).values()];
  const held=preferredAccs(acc.filter(x=>x.learner_id===person.id));
  const needed=requirements.map(r=>{
   const name=names.get(r.compliance_item_id)||'Unnamed requirement';
   const found=held.filter(a=>matches(name,a.accreditation_name)).sort((a,b)=>String(b.expiry_date||'9999-12-31').localeCompare(String(a.expiry_date||'9999-12-31')))[0]||null;
   return{name,cert:found,status:state(found)};
  });
  const count={valid:0,expiring:0,expired:0,missing:0};
  needed.forEach(n=>count[n.status]++);
  const total=needed.length,pct=total?Math.round(100*(count.valid+count.expiring)/total):null;
  return{person,role:roles.get(linked[0]?.job_role_id)||person.job_title||'Not assigned',held,needed,count,total,pct};
 });
 certs=members.flatMap(m=>m.held.filter(a=>a.expiry_date).map(a=>({person:m.person,name:a.accreditation_name,expiry:a.expiry_date,day:days(a.expiry_date)})));
 const seen=new Set();tasks=[];
 members.forEach(m=>{
  const add=(name,expiry,status)=>{const k=m.person.id+'|'+key(name);if(seen.has(k))return;seen.add(k);tasks.push({person:m.person,role:m.role,name,expiry,status,day:days(expiry)})};
  m.needed.filter(n=>n.status!=='valid').forEach(n=>add(n.name,n.cert?.expiry_date||null,n.status));
  m.held.filter(a=>a.expiry_date&&days(a.expiry_date)<=90).forEach(a=>add(a.accreditation_name,a.expiry_date,days(a.expiry_date)<0?'expired':'expiring'));
 });
 tasks.sort((a,b)=>((a.status==='expired'?0:a.status==='missing'?1:2)+(a.day==null?0:Math.max(0,a.day)/100))-((b.status==='expired'?0:b.status==='missing'?1:2)+(b.day==null?0:Math.max(0,b.day)/100)));
 render();
}
const link=(id,req)=>'manager-team.html?person='+encodeURIComponent(id)+'&requirement='+encodeURIComponent(req)+'#requests';
const prof=id=>'manager-member.html?id='+encodeURIComponent(id);
const table=(head,rows)=>'<div class="skill-table-wrap"><table class="skill-table"><thead><tr>'+head.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>';
function render(){
 const grid=document.getElementById('teamGrid'),stats=document.getElementById('teamStats'),host=document.getElementById('teamView');if(!grid||!stats||!host)return;
 document.body.classList.add('rrta-skills');const panel=grid.closest('.panel');
 let d=document.getElementById('rrtaSkillsDashboard');
 if(!d){d=document.createElement('div');d.id='rrtaSkillsDashboard';d.className='skill-dashboard';host.insertBefore(d,panel)}
 const numReq=members.reduce((s,m)=>s+m.total,0),current=members.reduce((s,m)=>s+m.count.valid+m.count.expiring,0);
 const pct=numReq?Math.round(100*current/numReq):null;
 const expired=certs.filter(c=>c.day<0).length,soon=certs.filter(c=>c.day>=0&&c.day<=30).length;
 const missing=members.reduce((s,m)=>s+m.count.missing+m.count.expired,0);
 const subs=members.filter(m=>String(m.person.organisational_access_role||m.person.portal_access_role||'').toLowerCase().includes('subcontractor')).length;
 stats.innerHTML='<div class="stat"><span>Team headcount</span><strong>'+members.length+'</strong><span>'+(members.length-subs)+' staff · '+subs+' subcontractors</span></div>'+
 '<div class="stat"><span>Job-role compliance</span><strong>'+(pct==null?'—':pct+'%')+'</strong><span>'+(numReq?current+' of '+numReq+' current requirements':'No requirements mapped')+'</span></div>'+
 '<div class="stat"><span>Expired / expiring in 30d</span><strong>'+(expired+soon)+'</strong><span>'+expired+' expired · '+soon+' expiring</span></div>'+
 '<div class="stat"><span>Missing / expired requirements</span><strong>'+missing+'</strong><span>'+members.filter(m=>!m.total).length+' people with no mapped requirements</span></div>';
 const roles=new Map(),gaps=new Map();
 members.forEach(m=>{const r=roles.get(m.role)||{people:0,total:0,current:0};r.people++;r.total+=m.total;r.current+=m.count.valid+m.count.expiring;roles.set(m.role,r);
  m.needed.filter(n=>n.status!=='valid').forEach(n=>{const k=key(n.name),g=gaps.get(k)||{name:n.name,count:0};g.count++;gaps.set(k,g)})});
 const roleBars=[...roles].sort((a,b)=>b[1].people-a[1].people).slice(0,6).map(([name,r])=>bar(name+' · '+r.people+' people',r.total?Math.round(100*r.current/r.total):null)).join('');
 const orderedGaps=[...gaps.values()].sort((a,b)=>b.count-a.count).slice(0,5);
 const gapBars=orderedGaps.map(x=>bar(x.name,x.count,orderedGaps[0].count,x.count+' people')).join('');
 const bucket=(a,b)=>certs.filter(c=>c.day>=a&&c.day<=b).length;
 d.innerHTML='<div class="skill-charts">'+
 '<section class="skill-panel"><h2>Competency overview</h2><p class="skill-sub">Requirements recorded against team job roles.</p><div class="skill-donut-box"><div class="skill-donut" style="--part:'+(pct||0)+'%"><b>'+(pct==null?'—':pct+'%')+'</b></div><div class="skill-legend"><div><small>Currently held</small><b>'+current+'</b></div><div><small>Missing / expired</small><b>'+Math.max(0,numReq-current)+'</b></div><div><small>No requirements mapped</small><b>'+members.filter(m=>!m.total).length+'</b></div></div></div></section>'+
 '<section class="skill-panel"><h2>Compliance by job role</h2><p class="skill-sub">See capability gaps by team role.</p>'+(roleBars||'<p class="skill-empty">No mapped roles to display.</p>')+'</section>'+
 '<section class="skill-panel"><h2>Top training needs</h2><p class="skill-sub">Requirements needing action across your team.</p>'+(gapBars||'<p class="skill-empty">No training gaps identified.</p>')+'</section></div>'+
 '<section class="skill-panel"><h2>Accreditation expiry forecast</h2><p class="skill-sub">Expiry dates for held accreditations. Already expired items remain visible.</p><div class="skill-forecast">'+
 '<div><b class="skill-overdue">'+expired+'</b><small>Already expired</small></div><div><b class="skill-urgent">'+bucket(0,30)+'</b><small>Next 30 days</small></div>'+
 '<div><b>'+bucket(31,60)+'</b><small>31–60 days</small></div><div><b>'+bucket(61,90)+'</b><small>61–90 days</small></div></div></section>'+
 '<section class="skill-panel"><div class="skill-section-head"><div><h2>What needs booking</h2><p class="skill-sub" style="margin:0">Expiry mapping and missing requirements. Request a course from RRTA.</p></div><div class="skill-controls"><label for="skillWindow" style="font-size:11px">Expiry window</label><select id="skillWindow"><option value="30">30 days</option><option value="60">60 days</option><option value="90">90 days</option></select></div></div><div id="skillActions"></div></section>';
 d.querySelector('#skillWindow').value=String(windowDays);
 d.querySelector('#skillWindow').addEventListener('change',e=>{windowDays=Number(e.target.value)||30;renderQueue()});
 panel.querySelector('h2').textContent='Team members';
 panel.querySelector('.manager-team-toolbar')?.remove();
 const oldToolbar=panel.querySelector('.skill-section-head');if(oldToolbar)oldToolbar.remove();
 const controls=document.createElement('div');controls.className='skill-section-head';
 controls.innerHTML='<p class="skill-sub" style="margin:0">Click a name to open the competency profile.</p><div class="skill-controls"><button data-skill-filter="all" class="active">All ('+members.length+')</button><button data-skill-filter="expiring">Expiring ('+members.filter(m=>m.held.some(c=>{const d=days(c.expiry_date);return d!==null&&d>=0&&d<=30})).length+')</button><button data-skill-filter="attention">Attention ('+members.filter(m=>m.count.expiring+m.count.expired+m.count.missing>0).length+')</button><input type="search" id="skillSearch" aria-label="Search team members" placeholder="Search team"><button id="skillExport">Export CSV</button></div>';
 grid.before(controls);grid.classList.add('skill-team-grid');
 controls.querySelectorAll('[data-skill-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.skillFilter;controls.querySelectorAll('[data-skill-filter]').forEach(x=>x.classList.toggle('active',x===b));renderTeam()}));
 controls.querySelector('#skillSearch').addEventListener('input',e=>{search=e.target.value.toLowerCase().trim();renderTeam()});
 controls.querySelector('#skillExport').addEventListener('click',exportCsv);
 renderQueue();renderTeam();
}
function bar(name,value,max=100,label){const width=value==null?0:Math.max(0,Math.min(100,Math.round(100*value/max)));return '<div class="skill-bar"><div class="skill-bar-head"><span>'+esc(name)+'</span><b>'+esc(label|| (value==null?'Not mapped':value+'%'))+'</b></div><div class="skill-bar-track"><i style="width:'+width+'%"></i></div></div>'}
function visibleTasks(){return tasks.filter(t=>t.status==='expired'||t.status==='missing'||(t.day!=null&&t.day>=0&&t.day<=windowDays))}
function renderQueue(){
 const out=document.getElementById('skillActions');if(!out)return;
 const list=visibleTasks();
 const rows=list.slice(0,50).map(t=>'<tr><td><a href="'+prof(t.person.id)+'">'+esc(t.person.full_name)+'</a></td><td><strong>'+esc(t.name)+'</strong><br><span class="skill-muted">'+esc(t.role)+'</span></td><td>'+fmt(t.expiry)+'</td><td><span class="skill-pill '+esc(t.status)+'">'+esc(t.status==='missing'?'Not held':t.status==='expired'?'Expired':t.day+' days')+'</span></td><td><a class="skill-request" href="'+esc(link(t.person.id,t.name))+'">Request training ↗</a></td></tr>');
 out.innerHTML=list.length?table(['Team member','Accreditation / requirement','Expires','Status','Next step'],rows)+(list.length>50?'<p class="skill-sub">Showing 50 of '+list.length+' actions. View individual profiles for the full record.</p>':''):'<div class="skill-empty">Nothing missing, expired or due within this window.</div>';
}
function visibleMembers(){return members.filter(m=>(filter!=='expiring'||m.held.some(c=>{const d=days(c.expiry_date);return d!==null&&d>=0&&d<=30}))&&(filter!=='attention'||m.count.expiring+m.count.expired+m.count.missing>0)&&(!search||[m.person.full_name,m.person.employee_number,m.role].some(v=>String(v||'').toLowerCase().includes(search))))}
function renderTeam(){
 const grid=document.getElementById('teamGrid');if(!grid)return;
 const list=visibleMembers();
 const rows=list.map(m=>{
  const upcoming=m.held.filter(c=>{const d=days(c.expiry_date);return d!==null&&d>=0&&d<=30}).length,bad=m.count.missing+m.count.expired;
  return '<tr><td><span class="skill-avatar">'+esc(initials(m.person.full_name))+'</span><a href="'+prof(m.person.id)+'">'+esc(m.person.full_name)+'</a><br><span class="skill-muted">'+esc(m.person.employee_number||'')+'</span></td>'+
  '<td>'+esc(m.role)+'</td><td><div class="skill-progress"><i><em style="width:'+(m.pct||0)+'%"></em></i><strong>'+(m.pct==null?'Not mapped':m.pct+'%')+'</strong></div></td>'+
  '<td>'+m.held.length+'</td><td><span class="skill-pill '+(upcoming?'expiring':'valid')+'">'+upcoming+'</span></td>'+
  '<td><span class="skill-pill '+(bad?'missing':'valid')+'">'+bad+'</span></td>'+
  '<td><a href="'+prof(m.person.id)+'">View →</a></td></tr>';
 });
 grid.innerHTML=list.length?table(['Team member','Job role','Compliance','Accreditations held','Expiring (30d)','Missing / expired','Profile'],rows):'<div class="skill-empty">No team members match this filter.</div>';
}
function exportCsv(){
 const lines=[['Team member','Employee number','Job role','Compliance %','Certifications held','Expiring within 30 days','Missing / expired requirements']];
 visibleMembers().forEach(m=>lines.push([m.person.full_name,m.person.employee_number||'',m.role,m.pct??'Not mapped',m.held.length,m.held.filter(c=>{const d=days(c.expiry_date);return d!=null&&d>=0&&d<=30}).length,m.count.missing+m.count.expired]));
 const csv=lines.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const uri=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=uri;a.download='RRTA-team-competency.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(uri),1000);
}
function init(n=0){
 const grid=document.getElementById('teamGrid');
 if(!window.supabase?.createClient||!grid||grid.querySelector('.empty')?.textContent.includes('Loading your team')){if(n<130)setTimeout(()=>init(n+1),150);return;}
 load().catch(e=>{const el=document.getElementById('teamView');if(el){const p=document.createElement('div');p.className='skill-panel';p.textContent='Competency dashboard unavailable. No data was changed. '+(e?.message||'Please refresh.');el.prepend(p)}console.error('RRTA competency dashboard',e)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();
})();

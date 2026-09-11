(function(){
  const labels={booked:'Booked',in_progress:'In progress',achieved:'Achieved',no_show:'No show',cancelled:'Cancelled'};
  function decorate(){
    document.querySelectorAll('.drawer').forEach(drawer=>{
      const bookingId=drawer.id.replace('drawer-','');
      let box=drawer.querySelector('[data-training-status-box]');
      const rows=(typeof attendees!=='undefined'?attendees:[]).filter(a=>a.booking_id===bookingId&&a.profile_id);
      if(!rows.length){ if(box) box.remove(); return; }
      if(!box){
        box=document.createElement('div');
        box.dataset.trainingStatusBox='1';
        box.style.cssText='margin-top:12px;padding:12px;border:1px solid #d9dee5;border-radius:9px;background:#fff';
        drawer.appendChild(box);
      }
      box.innerHTML=`<strong>Training status</strong><p class="muted" style="margin:4px 0 10px">Update each internal learner as the course progresses. This updates their learner Training Record automatically.</p>${rows.map(a=>`<div style="display:grid;grid-template-columns:minmax(220px,1fr) 180px;gap:10px;align-items:center;padding:8px 0;border-top:1px solid #eef1f4"><div><strong>${a.attendee_name||'Learner'}</strong></div><select data-attendee-status="${a.id}" style="padding:8px 9px;border:1px solid #cfd5dd;border-radius:7px;background:#fff">${Object.entries(labels).map(([v,l])=>`<option value="${v}" ${currentStatus(a)===v?'selected':''}>${l}</option>`).join('')}</select></div>`).join('')}`;
      box.querySelectorAll('[data-attendee-status]').forEach(sel=>sel.onchange=()=>saveStatus(sel.dataset.attendeeStatus,sel.value,sel));
    });
  }
  function currentStatus(a){
    const outcome=String(a.outcome||'').toLowerCase();
    const attendance=String(a.attendance_status||'').toLowerCase();
    if(['achieved','passed','completed','competent'].includes(outcome))return 'achieved';
    if(['in_progress','attending'].includes(attendance))return 'in_progress';
    if(attendance==='no_show')return 'no_show';
    if(attendance==='cancelled')return 'cancelled';
    return 'booked';
  }
  async function saveStatus(id,status,sel){
    sel.disabled=true;
    const payload=status==='achieved'?{attendance_status:'attended',outcome:'achieved'}:status==='in_progress'?{attendance_status:'in_progress',outcome:'pending'}:status==='no_show'?{attendance_status:'no_show',outcome:'pending'}:status==='cancelled'?{attendance_status:'cancelled',outcome:'pending'}:{attendance_status:'booked',outcome:'pending'};
    const {error}=await db.from('booking_attendees').update(payload).eq('id',id);
    sel.disabled=false;
    if(error){alert(error.message);return;}
    const a=attendees.find(x=>x.id===id); if(a)Object.assign(a,payload);
  }
  const root=document.getElementById('root');
  if(root)new MutationObserver(decorate).observe(root,{childList:true,subtree:true});
  decorate();
})();
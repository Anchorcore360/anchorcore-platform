async function loadRrtaTrainingRecord(){
  const list=document.getElementById('trainingList');
  if(!list||!learner?.id)return;
  const heading=document.querySelector('#tab-training .panel-head-row');
  if(heading){heading.innerHTML='<div><h2>RRTA training record</h2><p class="muted">Courses this operative has attended or completed at Rapid Response Training Academy. This will be populated from the booking system.</p></div>';}
  list.innerHTML='<div class="empty">Loading RRTA training history…</div>';
  try{
    const {data,error}=await db.from('training_records').select('id,training_date,completion_status,booking_reference,trainer_name,notes,courses(id,course_code,title,category,duration_days)').eq('learner_id',learner.id).order('training_date',{ascending:false});
    if(error)throw error;
    const rows=data||[];
    if(!rows.length){
      list.innerHTML='<div class="empty"><strong>No RRTA training recorded yet.</strong><br><span style="font-size:13px">When this operative is booked onto an RRTA course, their attendance/completion will appear here automatically from the booking system.</span></div>';
      return;
    }
    list.innerHTML=rows.map(r=>{
      const c=r.courses||{};
      const status=String(r.completion_status||'completed').replace('_',' ');
      const meta=[fmt(r.training_date),c.category||'RRTA',r.booking_reference?`Booking ${r.booking_reference}`:'',r.trainer_name?`Trainer: ${r.trainer_name}`:''].filter(Boolean).join(' · ');
      return `<div class="record"><div><strong>${esc(c.course_code||'RRTA')} — ${esc(c.title||'Training course')}</strong><small>${esc(meta)}</small></div><div><span class="status ${status==='completed'||status==='attended'?'live':'development'}">${esc(status)}</span></div></div>`;
    }).join('');
  }catch(e){
    list.innerHTML=`<div class="empty">Unable to load RRTA training history: ${esc(e.message||'Unknown error')}</div>`;
  }
}

const rrtaTrainingOriginalRender=render;
render=async function(){
  await rrtaTrainingOriginalRender();
  await loadRrtaTrainingRecord();
};

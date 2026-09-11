async function loadRrtaTrainingRecord(){
  const list=document.getElementById('trainingList');
  if(!list||!learner?.id)return;
  const heading=document.querySelector('#tab-training .panel-head-row');
  if(heading){heading.innerHTML='<div><h2>RRTA training record</h2><p class="muted">Courses this operative is booked onto, currently attending, or has achieved at Rapid Response Training Academy.</p></div>';}
  list.innerHTML='<div class="empty">Loading RRTA training history…</div>';
  try{
    const {data,error}=await db.from('training_records').select('id,training_date,end_date,completion_status,booking_reference,trainer_name,notes,course_title,location,courses(id,course_code,title,category,duration_days)').eq('learner_id',learner.id).order('training_date',{ascending:false});
    if(error)throw error;
    const rows=data||[];
    if(!rows.length){
      list.innerHTML='<div class="empty"><strong>No RRTA training recorded yet.</strong><br><span style="font-size:13px">When this operative is added to an RRTA booking it will appear here automatically.</span></div>';
      return;
    }
    const labels={booked:'Booked',in_progress:'In progress',achieved:'Achieved',cancelled:'Cancelled',no_show:'No show'};
    const cls={booked:'development',in_progress:'development',achieved:'live',cancelled:'expired',no_show:'expired'};
    list.innerHTML=rows.map(r=>{
      const c=r.courses||{};
      const status=String(r.completion_status||'booked');
      const dateText=r.end_date&&r.end_date!==r.training_date?`${fmt(r.training_date)} – ${fmt(r.end_date)}`:fmt(r.training_date);
      const meta=[dateText,c.category||'RRTA',r.location||'',r.booking_reference?`Booking ${r.booking_reference}`:'',r.trainer_name?`Trainer: ${r.trainer_name}`:''].filter(Boolean).join(' · ');
      const title=r.course_title||c.title||'Training course';
      const code=c.course_code||((title.match(/^([A-Z]+\d+[A-Z]?)/)||[])[1])||'RRTA';
      return `<div class="record"><div><strong>${esc(code)} — ${esc(title.replace(new RegExp('^'+code+'\\s*[-–—]?\\s*','i'),''))}</strong><small>${esc(meta)}</small></div><div><span class="status ${cls[status]||'development'}">${esc(labels[status]||status.replace('_',' '))}</span></div></div>`;
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

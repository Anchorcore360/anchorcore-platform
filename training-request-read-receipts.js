(function(){
  if(window.__rrtaTrainingRequestReadReceipts)return;window.__rrtaTrainingRequestReadReceipts=true;
  const URL='https://qgbpotjqggeodxqcwkgj.supabase.co',KEY='sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS';
  let db,userId,lastRequest=null;
  async function init(){if(!window.supabase?.createClient){setTimeout(init,180);return}db=window.supabase.createClient(URL,KEY);const u=await db.auth.getUser();userId=u.data?.user?.id;if(!userId)return;new MutationObserver(check).observe(document.body,{childList:true,subtree:true});check()}
  async function check(){if(!document.querySelector('.trc-overlay')||!window.__trcActive||window.__trcActive===lastRequest)return;lastRequest=window.__trcActive;try{const ev=await db.from('training_request_events').select('id,actor_id,event_type').eq('request_id',lastRequest);const rows=(ev.data||[]).filter(x=>x.actor_id!==userId&&['message','alternative_date_offered','date_approved','booking_confirmed','joining_instructions','status_changed'].includes(x.event_type));if(rows.length){const now=new Date().toISOString();await db.from('training_request_event_reads').upsert(rows.map(x=>({event_id:x.id,user_id:userId,read_at:now})),{onConflict:'event_id,user_id'})}}catch(_){}}
  init();
})();
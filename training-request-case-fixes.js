(function(){
  if(window.__rrtaTrainingRequestCaseFixes)return;window.__rrtaTrainingRequestCaseFixes=true;
  const URL='https://qgbpotjqggeodxqcwkgj.supabase.co',KEY='sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS';
  document.addEventListener('click',async e=>{
    const btn=e.target.closest('[data-act="joining"]');if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(!window.__trcActive||!window.supabase?.createClient)return;
    const db=window.supabase.createClient(URL,KEY),requestId=window.__trcActive;
    try{
      const [{data:u},{data:r,error}]=await Promise.all([db.auth.getUser(),db.from('training_requests').select('id,booked_booking_id,preferred_date').eq('id',requestId).single()]);
      if(error)throw error;if(!r?.booked_booking_id)throw new Error('This request is not linked to a confirmed booking yet.');
      const approved=await db.from('booking_joining_instruction_drafts').select('id').eq('booking_id',r.booked_booking_id).eq('status','approved').limit(1).maybeSingle();
      if(approved.error)throw approved.error;
      if(!approved.data){if(confirm('Joining instructions have not been approved yet. Open the joining-instruction editor now?'))location.href=`joining-instructions-preview.html?booking_id=${encodeURIComponent(r.booked_booking_id)}`;return;}
      const note=prompt('Message to include with the joining instructions:')||'Your joining instructions are ready to view.';
      const url=`joining-instructions-view.html?booking=${encodeURIComponent(r.booked_booking_id)}`;
      const ev=await db.from('training_request_events').insert({request_id:requestId,actor_id:u?.user?.id,actor_role:'academy',event_type:'joining_instructions',message:note,proposed_date:r.preferred_date||null,metadata:{url,booking_id:r.booked_booking_id}});
      if(ev.error)throw ev.error;
      const up=await db.from('training_requests').update({last_activity_at:new Date().toISOString(),waiting_on:'manager'}).eq('id',requestId);if(up.error)throw up.error;
      alert('Joining instructions sent. The manager and operative will now see an unread update, and opening the instructions will create a read receipt.');
      location.reload();
    }catch(err){alert(err.message||String(err));}
  },true);
})();
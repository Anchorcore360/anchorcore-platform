(function(){
  if(window.__rrtaTrainingRequestCaseFixes)return;window.__rrtaTrainingRequestCaseFixes=true;
  const URL='https://qgbpotjqggeodxqcwkgj.supabase.co',KEY='sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS';
  const client=()=>window.supabase?.createClient(URL,KEY);
  document.addEventListener('click',async e=>{
    const book=e.target.closest('[data-act="book"]');
    if(book){
      e.preventDefault();e.stopImmediatePropagation();
      if(!window.__trcActive||!window.supabase?.createClient)return;
      const db=client(),requestId=window.__trcActive;
      try{
        book.disabled=true;book.textContent='Creating booking…';
        const rpc=await db.rpc('create_pending_booking_from_training_request',{p_request_id:requestId});
        if(rpc.error)throw rpc.error;
        const bookingId=rpc.data;
        const au=await db.auth.getUser();
        await db.from('training_request_events').insert({request_id:requestId,actor_id:au.data?.user?.id,actor_role:'academy',event_type:'booking_confirmed',message:'Training request moved into Bookings as a provisional booking. Joining instructions are now managed per delegate.',metadata:{booking_id:bookingId,booking_status:'provisional'}});
        alert('Pending booking created. The learner is now on the Bookings screen and joining instructions can be prepared for them.');
        location.href=`booked-courses.html?booking=${encodeURIComponent(bookingId)}`;
      }catch(err){book.disabled=false;book.textContent='Confirm / Create Booking';alert(err.message||String(err));}
      return;
    }
    const btn=e.target.closest('[data-act="joining"]');if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(!window.__trcActive||!window.supabase?.createClient)return;
    const db=client(),requestId=window.__trcActive;
    try{
      const [{data:u},{data:r,error}]=await Promise.all([db.auth.getUser(),db.from('training_requests').select('id,booked_booking_id,preferred_date,requested_for_profile_id').eq('id',requestId).single()]);
      if(error)throw error;if(!r?.booked_booking_id)throw new Error('This request is not linked to a booking yet.');
      const attendee=await db.from('booking_attendees').select('id,attendee_name,joining_instructions_sent_at').eq('booking_id',r.booked_booking_id).eq('profile_id',r.requested_for_profile_id).maybeSingle();
      if(attendee.error)throw attendee.error;if(!attendee.data)throw new Error('The operative is not yet attached to this booking.');
      const approved=await db.from('booking_joining_instruction_drafts').select('id').eq('booking_id',r.booked_booking_id).eq('attendee_id',attendee.data.id).eq('status','approved').order('approved_at',{ascending:false}).limit(1).maybeSingle();
      if(approved.error)throw approved.error;
      if(!approved.data){if(confirm('Joining instructions for this operative have not been approved yet. Open the joining-instruction editor now?'))location.href=`joining-instructions-preview.html?booking_id=${encodeURIComponent(r.booked_booking_id)}&attendee_id=${encodeURIComponent(attendee.data.id)}`;return;}
      const note=prompt('Message to include with the joining instructions:')||'Your joining instructions are ready to view and acknowledge.';
      const url=`joining-instructions-view.html?booking=${encodeURIComponent(r.booked_booking_id)}`;
      const sentAt=new Date().toISOString();
      const upAtt=await db.from('booking_attendees').update({joining_instructions_sent_at:sentAt,booking_status:'joining_instructions_sent'}).eq('id',attendee.data.id);if(upAtt.error)throw upAtt.error;
      await db.from('bookings').update({joining_instructions_sent_at:sentAt,updated_at:sentAt}).eq('id',r.booked_booking_id);
      const ev=await db.from('training_request_events').insert({request_id:requestId,actor_id:u?.user?.id,actor_role:'academy',event_type:'joining_instructions',message:note,proposed_date:r.preferred_date||null,metadata:{url,booking_id:r.booked_booking_id,attendee_id:attendee.data.id}});
      if(ev.error)throw ev.error;
      const up=await db.from('training_requests').update({last_activity_at:sentAt,waiting_on:'operative'}).eq('id',requestId);if(up.error)throw up.error;
      alert(`Joining instructions sent to ${attendee.data.attendee_name||'the operative'}. They now need to open and acknowledge them.`);
      location.reload();
    }catch(err){alert(err.message||String(err));}
  },true);
})();
(function(){
function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()}
ready(()=>{
 const actions=document.querySelector('.head-actions'); if(!actions||!window.supabase)return;
 const btn=document.createElement('button'); btn.className='small dark'; btn.textContent='+ Add External Booking'; actions.prepend(btn);
 const modal=document.createElement('div'); modal.id='externalBookingModal'; modal.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,.48);z-index:9999;padding:5vh 20px;overflow:auto';
 modal.innerHTML=`<div style="max-width:760px;margin:auto;background:#fff;border-radius:14px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.25)">
 <div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><div><div class="eyebrow">External training</div><h2 style="margin:4px 0">Add External Booking</h2><p class="muted" style="margin:0">Log externally delivered training in the same confirmed-booking workflow.</p></div><button class="small" id="ebClose">Close</button></div>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px">
 <label style="grid-column:1/-1">Course / qualification<input id="ebCourse" style="width:100%;padding:10px;border:1px solid #cfd5dd;border-radius:8px"></label>
 <label>Provider<input id="ebProvider" style="width:100%;padding:10px;border:1px solid #cfd5dd;border-radius:8px"></label>
 <label>Location<input id="ebLocation" style="width:100%;padding:10px;border:1px solid #cfd5dd;border-radius:8px"></label>
 <label>Start date<input id="ebStart" type="date" style="width:100%;padding:10px;border:1px solid #cfd5dd;border-radius:8px"></label>
 <label>End date<input id="ebEnd" type="date" style="width:100%;padding:10px;border:1px solid #cfd5dd;border-radius:8px"></label>
 <label>Expected cost (£)<input id="ebCost" type="number" min="0" step="0.01" style="width:100%;padding:10px;border:1px solid #cfd5dd;border-radius:8px"></label>
 <label>PO / reference<input id="ebPO" style="width:100%;padding:10px;border:1px solid #cfd5dd;border-radius:8px"></label>
 <label>Status<select id="ebStatus" style="width:100%;padding:10px;border:1px solid #cfd5dd;border-radius:8px"><option value="confirmed">Confirmed</option><option value="provisional">Provisional</option></select></label>
 <label style="grid-column:1/-1">Notes<textarea id="ebNotes" rows="3" style="width:100%;padding:10px;border:1px solid #cfd5dd;border-radius:8px"></textarea></label></div>
 <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px"><button class="small" id="ebCancel">Cancel</button><button class="small dark" id="ebSave">Save External Booking</button></div></div>`;
 document.body.appendChild(modal);
 const close=()=>modal.style.display='none'; btn.onclick=()=>modal.style.display='block'; modal.querySelector('#ebClose').onclick=close; modal.querySelector('#ebCancel').onclick=close;
 modal.querySelector('#ebSave').onclick=async()=>{
   const course=modal.querySelector('#ebCourse').value.trim(),start=modal.querySelector('#ebStart').value,provider=modal.querySelector('#ebProvider').value.trim();
   if(!course||!start||!provider)return alert('Course, provider and start date are required.');
   const ref='EXT-'+new Date().getFullYear()+'-'+String(Date.now()).slice(-6);
   const payload={booking_reference:ref,course_title:course,start_date:start,end_date:modal.querySelector('#ebEnd').value||start,location:modal.querySelector('#ebLocation').value.trim()||provider,status:modal.querySelector('#ebStatus').value,booking_type:'course',delivery_type:'external',external_provider:provider,expected_external_cost:Number(modal.querySelector('#ebCost').value||0),purchase_order_reference:modal.querySelector('#ebPO').value.trim()||null,notes:modal.querySelector('#ebNotes').value.trim()||null,delegate_count:0,finance_status:'not_ready',quote_status:'not_required'};
   const {error}=await db.from('bookings').insert(payload); if(error)return alert(error.message);
   close(); location.reload();
 };
});
})();
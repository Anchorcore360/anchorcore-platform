(function(){
  const nameInput=document.getElementById('externalName');
  if(!nameInput)return;

  // Replace the single full-name field with separate forename and surname fields.
  const nameLabel=nameInput.closest('label');
  if(nameLabel){
    const forename=document.createElement('label');
    forename.innerHTML='Forename<input id="externalForename" autocomplete="given-name">';
    const surname=document.createElement('label');
    surname.innerHTML='Surname<input id="externalSurname" autocomplete="family-name">';
    nameLabel.replaceWith(forename,surname);
  }

  // Add date of birth alongside the other booking/contact fields.
  const phone=document.getElementById('externalPhone');
  if(phone?.closest('label') && !document.getElementById('externalDob')){
    const dob=document.createElement('label');
    dob.innerHTML='Date of birth<input id="externalDob" type="date">';
    phone.closest('label').after(dob);
  }

  const customerSelect=document.getElementById('externalCustomer');
  if(customerSelect?.closest('label')) customerSelect.closest('label').firstChild.textContent='Company name / saved customer';

  // Replace the new-external save action so the reusable record contains the requested booking fields.
  const addNew=document.getElementById('addNewExternal');
  if(addNew){
    addNew.onclick=async()=>{
      const forename=document.getElementById('externalForename')?.value.trim()||'';
      const surname=document.getElementById('externalSurname')?.value.trim()||'';
      if(!forename||!surname)return alert('Enter the learner forename and surname.');
      const customer=customers.find(c=>c.id===customerSelect.value);
      const company=customer?.company_name||'';
      const payload={
        customer_id:customerSelect.value||null,
        forename,
        surname,
        full_name:`${forename} ${surname}`.trim(),
        company_name:company||null,
        email:document.getElementById('externalEmail').value.trim()||null,
        phone:document.getElementById('externalPhone').value.trim()||null,
        date_of_birth:document.getElementById('externalDob').value||null,
        retention_review_date:document.getElementById('externalRetention').value||null,
        lawful_basis:'contract'
      };
      const {data:x,error}=await db.from('external_delegates').insert(payload).select().single();
      if(error)return alert(error.message);
      const {error:aerr}=await db.from('booking_attendees').insert({
        booking_id:booking.id,
        external_delegate_id:x.id,
        attendee_name:x.full_name,
        attendee_email:x.email||null,
        attendee_phone:x.phone||null,
        company_name:x.company_name||null,
        date_of_birth:x.date_of_birth||null
      });
      if(aerr)return alert(aerr.message);
      document.getElementById('externalForename').value='';
      document.getElementById('externalSurname').value='';
      document.getElementById('externalEmail').value='';
      document.getElementById('externalPhone').value='';
      document.getElementById('externalDob').value='';
      document.getElementById('externalRetention').value='';
      await load();
      await syncCount();
    };
  }

  // Preserve the same fields when reusing a previous external learner.
  const addSaved=document.getElementById('addSavedExternal');
  if(addSaved){
    addSaved.onclick=async()=>{
      const id=document.getElementById('savedExternal').value;
      if(!id)return alert('Select an external learner.');
      if(attendees.some(a=>a.external_delegate_id===id))return alert('This learner is already on the course.');
      const x=externals.find(v=>v.id===id);
      const {error}=await db.from('booking_attendees').insert({
        booking_id:booking.id,
        external_delegate_id:x.id,
        attendee_name:x.full_name,
        attendee_email:x.email||null,
        attendee_phone:x.phone||null,
        company_name:x.company_name||null,
        date_of_birth:x.date_of_birth||null
      });
      if(error)return alert(error.message);
      await load();
      await syncCount();
    };
  }

  // Internal employees already have these fields on their profile; copy them into the booking attendee snapshot.
  const addInternalBtn=document.getElementById('addInternal');
  if(addInternalBtn){
    addInternalBtn.onclick=async()=>{
      const id=document.getElementById('internalLearner').value;
      if(!id)return alert('Select an RRT employee.');
      if(attendees.some(a=>a.profile_id===id))return alert('This employee is already on the course.');
      const {data:l,error:perr}=await db.from('profiles').select('id,full_name,forename,surname,email,phone,date_of_birth,employee_number,organisation').eq('id',id).single();
      if(perr)return alert(perr.message);
      const {error}=await db.from('booking_attendees').insert({
        booking_id:booking.id,
        profile_id:l.id,
        attendee_name:l.full_name||`${l.forename||''} ${l.surname||''}`.trim(),
        attendee_email:l.email||null,
        attendee_phone:l.phone||null,
        company_name:l.organisation||null,
        date_of_birth:l.date_of_birth||null,
        employee_number:l.employee_number||null
      });
      if(error)return alert(error.message);
      await load();
      await syncCount();
    };
  }
})();
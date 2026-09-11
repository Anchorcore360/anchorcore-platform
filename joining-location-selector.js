(function(){
  async function initLocationSelector(){
    const waitForBooking=()=>new Promise(resolve=>{
      const tick=()=>{
        try{ if(typeof booking!=='undefined' && booking && typeof db!=='undefined') return resolve(); }catch(e){}
        setTimeout(tick,120);
      };
      tick();
    });
    await waitForBooking();
    const {data:locations,error}=await db.from('training_locations').select('*').eq('active',true).order('name');
    if(error||!locations?.length)return;
    const detailsPanel=document.querySelector('main.wrap section.panel:nth-of-type(2)');
    if(!detailsPanel||document.getElementById('joiningLocation'))return;
    const grid=detailsPanel.querySelector('.grid');
    if(!grid)return;
    const label=document.createElement('label');
    label.innerHTML='Training location<select id="joiningLocation"></select>';
    grid.insertBefore(label,grid.children[1]||null);
    const select=label.querySelector('select');
    select.innerHTML=locations.map(l=>`<option value="${String(l.name).replace(/"/g,'&quot;')}">${l.name}</option>`).join('');
    const current=locations.find(l=>l.name===booking.location) || locations[0];
    select.value=current.name;
    locationRow=current;
    if(!booking.location){
      booking.location=current.name;
      await db.from('bookings').update({location:current.name,updated_at:new Date().toISOString()}).eq('id',booking.id);
    }
    try{ render(); }catch(e){}
    const help=document.createElement('div');
    help.id='joiningLocationHelp';
    help.className='notice';
    help.style.gridColumn='1/-1';
    help.style.marginTop='4px';
    help.textContent=`Using ${current.name}: ${current.address}${current.postcode?`, ${current.postcode}`:''}`;
    grid.appendChild(help);
    select.addEventListener('change',async()=>{
      const chosen=locations.find(l=>l.name===select.value);
      if(!chosen)return;
      select.disabled=true;
      const {error:updateError}=await db.from('bookings').update({location:chosen.name,updated_at:new Date().toISOString()}).eq('id',booking.id);
      select.disabled=false;
      if(updateError){alert(updateError.message);select.value=booking.location||current.name;return;}
      booking.location=chosen.name;
      locationRow=chosen;
      const meta=document.getElementById('meta');
      if(meta) meta.textContent=`${booking.booking_reference} · ${fmt(booking.start_date)} · ${chosen.name}`;
      help.textContent=`Using ${chosen.name}: ${chosen.address}${chosen.postcode?`, ${chosen.postcode}`:''}`;
      try{render();}catch(e){}
    });
  }
  initLocationSelector().catch(()=>{});
})();
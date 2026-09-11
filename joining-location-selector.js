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
    select.innerHTML=locations.map(l=>`<option value="${String(l.name).replace(/"/g,'&quot;')}">${l.name}</option>`).join('')+'<option value="__external__">External / client address</option>';

    const custom=document.createElement('div');
    custom.id='externalLocationPanel';
    custom.style.gridColumn='1/-1';
    custom.style.display='none';
    custom.innerHTML=`<div class="grid" style="margin-top:4px;padding:14px;border:1px solid #d9dee5;border-radius:10px;background:#fafbfc">
      <label>Venue / site name<input id="externalVenueName" placeholder="e.g. Client training site"></label>
      <label>Postcode<input id="externalVenuePostcode" placeholder="Postcode"></label>
      <label style="grid-column:1/-1">Address<input id="externalVenueAddress" placeholder="Full training address"></label>
      <div style="grid-column:1/-1"><button type="button" class="btn secondary" id="applyExternalLocation">Use this address</button></div>
    </div>`;
    grid.appendChild(custom);

    const help=document.createElement('div');
    help.id='joiningLocationHelp';
    help.className='notice';
    help.style.gridColumn='1/-1';
    help.style.marginTop='4px';
    grid.appendChild(help);

    const matched=locations.find(l=>l.name===booking.location);
    if(matched){
      select.value=matched.name;
      locationRow=matched;
      help.textContent=`Using ${matched.name}: ${matched.address}${matched.postcode?`, ${matched.postcode}`:''}`;
    }else if(booking.location){
      select.value='__external__';
      custom.style.display='block';
      document.getElementById('externalVenueName').value=booking.location||'';
      document.getElementById('externalVenueAddress').value=booking.location_address||'';
      document.getElementById('externalVenuePostcode').value=booking.location_postcode||'';
      locationRow={name:booking.location,address:booking.location_address||'',postcode:booking.location_postcode||'',food_drink:'',parking:'',what3words:''};
      help.textContent=`Using external address: ${booking.location}${booking.location_address?` — ${booking.location_address}`:''}${booking.location_postcode?`, ${booking.location_postcode}`:''}`;
    }else{
      const first=locations[0];
      select.value=first.name;
      locationRow=first;
      booking.location=first.name;
      await db.from('bookings').update({location:first.name,location_address:null,location_postcode:null,updated_at:new Date().toISOString()}).eq('id',booking.id);
      help.textContent=`Using ${first.name}: ${first.address}${first.postcode?`, ${first.postcode}`:''}`;
    }
    try{render();}catch(e){}

    select.addEventListener('change',async()=>{
      if(select.value==='__external__'){
        custom.style.display='block';
        const name=document.getElementById('externalVenueName').value.trim()||'External / client site';
        const address=document.getElementById('externalVenueAddress').value.trim();
        const postcode=document.getElementById('externalVenuePostcode').value.trim();
        locationRow={name,address,postcode,food_drink:'',parking:'',what3words:''};
        help.textContent='Enter the external venue details below, then choose “Use this address”.';
        try{render();}catch(e){}
        return;
      }
      custom.style.display='none';
      const chosen=locations.find(l=>l.name===select.value);
      if(!chosen)return;
      select.disabled=true;
      const {error:updateError}=await db.from('bookings').update({location:chosen.name,location_address:null,location_postcode:null,updated_at:new Date().toISOString()}).eq('id',booking.id);
      select.disabled=false;
      if(updateError){alert(updateError.message);return;}
      booking.location=chosen.name; booking.location_address=null; booking.location_postcode=null;
      locationRow=chosen;
      const meta=document.getElementById('meta');
      if(meta) meta.textContent=`${booking.booking_reference} · ${fmt(booking.start_date)} · ${chosen.name}`;
      help.textContent=`Using ${chosen.name}: ${chosen.address}${chosen.postcode?`, ${chosen.postcode}`:''}`;
      try{render();}catch(e){}
    });

    document.getElementById('applyExternalLocation').addEventListener('click',async()=>{
      const name=document.getElementById('externalVenueName').value.trim();
      const address=document.getElementById('externalVenueAddress').value.trim();
      const postcode=document.getElementById('externalVenuePostcode').value.trim();
      if(!name||!address)return alert('Enter a venue/site name and full address.');
      const {error:updateError}=await db.from('bookings').update({location:name,location_address:address,location_postcode:postcode||null,updated_at:new Date().toISOString()}).eq('id',booking.id);
      if(updateError)return alert(updateError.message);
      booking.location=name; booking.location_address=address; booking.location_postcode=postcode||null;
      locationRow={name,address,postcode,food_drink:'',parking:'',what3words:''};
      const meta=document.getElementById('meta');
      if(meta) meta.textContent=`${booking.booking_reference} · ${fmt(booking.start_date)} · ${name}`;
      help.textContent=`Using external address: ${name} — ${address}${postcode?`, ${postcode}`:''}`;
      try{render();}catch(e){}
      alert('External training address applied to this booking.');
    });
  }
  initLocationSelector().catch(()=>{});

  function loadPdfTools(){
    if(window.jspdf?.jsPDF){const s=document.createElement('script');s.src='joining-pdf-attachment.js';document.body.appendChild(s);return;}
    const lib=document.createElement('script');
    lib.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
    lib.onload=()=>{const s=document.createElement('script');s.src='joining-pdf-attachment.js';document.body.appendChild(s)};
    document.head.appendChild(lib);
  }
  loadPdfTools();
})();
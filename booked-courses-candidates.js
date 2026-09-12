(function(){
let externalCustomers=[],externalContacts=[];
const esc2=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
async function loadExternalCandidates(){
  const [c,p]=await Promise.all([
    db.from('external_customers').select('id,company_name').eq('active',true).order('company_name'),
    db.from('external_customer_contacts').select('id,customer_id,full_name,email,phone').eq('active',true).order('full_name')
  ]);
  if(c.error||p.error)return;
  externalCustomers=c.data||[]; externalContacts=p.data||[];
  enhanceAll();
}
function companyName(id){return externalCustomers.find(c=>c.id===id)?.company_name||''}
function optionLabel(p){const company=companyName(p.customer_id);return `${p.full_name||'External delegate'}${company?' · '+company:''}${p.email?' · '+p.email:''}`}
function enhanceDrawer(drawer){
  if(!drawer||drawer.dataset.candidateEnhanced==='1')return;
  const id=drawer.id.replace('drawer-','');
  const list=drawer.querySelector('.delegate-list');
  if(!list)return;
  drawer.dataset.candidateEnhanced='1';
  const box=document.createElement('div');
  box.style.cssText='margin-top:12px;padding:12px;border:1px solid #d9dee5;border-radius:9px;background:#fff';
  box.innerHTML=`<strong>Add saved external candidate</strong><p class="muted" style="margin:4px 0 8px">Choose somebody already held in the External Customers database. This avoids entering the same person again on future courses.</p><div style="display:grid;grid-template-columns:minmax(260px,1fr) auto;gap:8px;align-items:end"><label>External candidate<select data-ext-select="${id}" style="width:100%;margin-top:5px;padding:9px 10px;border:1px solid #cfd5dd;border-radius:8px"><option value="">Select saved external candidate</option>${externalContacts.map(p=>`<option value="${p.id}">${esc2(optionLabel(p))}</option>`).join('')}</select></label><button class="small dark" data-add-ext="${id}">Add external candidate</button></div><div style="margin-top:8px"><a href="external-customers.html" style="font-size:12px">+ Add a new external customer / contact</a></div>`;
  list.parentNode.insertBefore(box,list);
  box.querySelector('[data-add-ext]').onclick=()=>addSavedExternal(id,box.querySelector('[data-ext-select]').value);
}
async function addSavedExternal(bookingId,contactId){
  if(!contactId)return alert('Select an external candidate.');
  const p=externalContacts.find(x=>x.id===contactId); if(!p)return;
  if(attendees.some(a=>a.booking_id===bookingId&&a.external_contact_id===contactId))return alert('This person is already on the booking.');
  const {error}=await db.from('booking_attendees').insert({booking_id:bookingId,external_customer_id:p.customer_id,external_contact_id:p.id,attendee_name:p.full_name,attendee_email:p.email||null});
  if(error)return alert(error.message);
  await load(); setTimeout(()=>document.getElementById('drawer-'+bookingId)?.classList.add('open'),0);
}
function enhanceAll(){document.querySelectorAll('.drawer').forEach(enhanceDrawer)}
const obs=new MutationObserver(()=>enhanceAll());
const rootEl=document.getElementById('root'); if(rootEl)obs.observe(rootEl,{childList:true,subtree:true});
loadExternalCandidates();
})();
(function(){if(window.__rrtaUnifiedNavLoader)return;window.__rrtaUnifiedNavLoader=true;const s=document.createElement('script');s.src='trainer-navigation.js';document.head.appendChild(s)})();
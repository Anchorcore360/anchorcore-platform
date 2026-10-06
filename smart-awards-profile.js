(function(){
  if(window.__rrtaSmartAwardsLoaded)return;window.__rrtaSmartAwardsLoaded=true;
  const db=window.db||window.supabase?.createClient?.('https://qgbpotjqggeodxqcwkgj.supabase.co','sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS');
  const params=new URLSearchParams(location.search);
  const rawProfileId=params.get('id');
  const rawPersonId=params.get('person_id');
  if(!db||(!rawProfileId&&!rawPersonId))return;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let current=null,target=null;

  function injectStyles(){if(document.getElementById('smartAwardsStyles'))return;const s=document.createElement('style');s.id='smartAwardsStyles';s.textContent='.sa-modal{position:fixed;inset:0;background:rgba(15,23,42,.52);z-index:2500;display:grid;place-items:center;padding:18px}.sa-card{width:min(760px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:14px;box-shadow:0 24px 70px rgba(0,0,0,.28);padding:22px}.sa-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:14px}.sa-head h2{margin:0 0 4px}.sa-close{border:0;background:transparent;font-size:24px;cursor:pointer}.sa-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.sa-grid label{font-size:11px;font-weight:800;color:#475467}.sa-grid input{width:100%;height:42px;border:1px solid #d3d9df;border-radius:8px;padding:0 11px;margin-top:5px;font:inherit}.sa-wide{grid-column:1/-1}.sa-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}.sa-btn{border:0;border-radius:8px;padding:10px 13px;font-weight:850;font-size:11px;cursor:pointer;text-decoration:none}.sa-primary{background:#b20f22;color:#fff}.sa-light{background:#fff;border:1px solid #d3d9df;color:#18202a}.sa-note{grid-column:1/-1;background:#f7f8fa;border:1px solid #e2e6ea;border-radius:9px;padding:10px 12px;font-size:11px;color:#475467}.sa-qr{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:7px}.sa-qr img{width:92px;height:92px;object-fit:contain;border:1px solid #d3d9df;border-radius:8px;background:#fff}.sa-status{font-size:11px;margin-top:10px}.sa-ok{color:#176b37}.sa-bad{color:#b42318}@media(max-width:620px){.sa-grid{grid-template-columns:1fr}.sa-wide,.sa-note{grid-column:auto}}';document.head.appendChild(s)}
  function targetActions(){return document.getElementById('smartAwardsTabBody')}
  function addButton(){if(document.getElementById('smartAwardsBtn')||document.getElementById('smartAwardsManageBtn'))return true;const host=targetActions();if(!host)return false;const b=document.createElement('button');b.id='smartAwardsBtn';b.type='button';b.className='btn secondary small';b.textContent='Add / Edit Smart Awards Details';b.onclick=openModal;host.appendChild(b);return true}

  async function resolveTarget(){
    if(target)return target;
    if(rawPersonId){
      const r=await db.from('people').select('id,profile_id').eq('id',rawPersonId).maybeSingle();
      if(r.error)throw r.error;if(r.data){target={type:'person',id:r.data.id,profile_id:r.data.profile_id};return target}
    }
    if(rawProfileId){
      let r=await db.from('people').select('id,profile_id').eq('id',rawProfileId).maybeSingle();
      if(r.error)throw r.error;if(r.data){target={type:'person',id:r.data.id,profile_id:r.data.profile_id};return target}
      r=await db.from('people').select('id,profile_id').eq('profile_id',rawProfileId).maybeSingle();
      if(r.error)throw r.error;if(r.data){target={type:'person',id:r.data.id,profile_id:r.data.profile_id};return target}
      target={type:'profile',id:rawProfileId};return target;
    }
    throw new Error('Unable to identify this person.');
  }

  async function load(){
    const t=await resolveTarget();
    if(t.type==='person'){
      const{data,error}=await db.from('people').select('full_name,smart_awards_learner_id,smart_awards_card_id,smart_awards_user_id,smart_awards_email,smart_awards_qr_path,smart_awards_nops_url').eq('id',t.id).single();
      if(error)throw error;
      current={
        full_name:data?.full_name||'',
        quartz:data?.smart_awards_learner_id||'',
        card:data?.smart_awards_card_id||'',
        user:data?.smart_awards_user_id||'',
        email:data?.smart_awards_email||'',
        qr_path:data?.smart_awards_qr_path||'',
        url:data?.smart_awards_nops_url||''
      };
    }else{
      const{data,error}=await db.from('profiles').select('full_name,smart_quartz_learner_id,smart_nops_card_id,smart_nops_user_id,smart_nops_qr_path,smart_nops_url,email').eq('id',t.id).single();
      if(error)throw error;
      current={
        full_name:data?.full_name||'',
        quartz:data?.smart_quartz_learner_id||'',
        card:data?.smart_nops_card_id||'',
        user:data?.smart_nops_user_id||'',
        email:data?.email||'',
        qr_path:data?.smart_nops_qr_path||'',
        url:data?.smart_nops_url||''
      };
    }
    return current;
  }
  async function qrUrl(path){if(!path)return'';const{data,error}=await db.storage.from('learner-documents').createSignedUrl(path,3600);return error?'':(data?.signedUrl||'')}

  async function openModal(){
    injectStyles();
    try{await load()}catch(e){alert(e.message||'Unable to load Smart Awards details.');return}
    const root=document.createElement('div');root.className='sa-modal';root.id='smartAwardsModal';const signed=await qrUrl(current.qr_path);
    root.innerHTML=`<div class="sa-card"><div class="sa-head"><div><h2>Smart Awards</h2><div style="color:#667085;font-size:12px">${esc(current.full_name||'Person')} · Optional awarding-body details</div></div><button class="sa-close" type="button" aria-label="Close">×</button></div><div class="sa-grid"><label>Quartz Learner ID<input id="saQuartz" value="${esc(current.quartz||'')}"></label><label>NOPS Card ID<input id="saCard" value="${esc(current.card||'')}"></label><label>NOPS User ID<input id="saUser" value="${esc(current.user||'')}"></label><label>Smart Awards Email<input id="saEmail" type="email" value="${esc(current.email||'')}"></label><label class="sa-wide">NOPS URL<input id="saUrl" type="url" placeholder="https://..." value="${esc(current.url||'')}"></label><div class="sa-wide"><label>NOPS QR Code / Image<input id="saQrFile" type="file" accept="image/*,.pdf"></label><div class="sa-qr">${signed?`<img src="${esc(signed)}" alt="NOPS QR Code"><a class="sa-btn sa-light" href="${esc(signed)}" target="_blank" rel="noopener">Open Current QR</a>`:'<span style="font-size:11px;color:#667085">No NOPS QR image uploaded.</span>'}</div></div><div class="sa-note">Smart Awards details are optional and are available on every person record, whether or not that person has portal access.</div></div><div id="saStatus" class="sa-status"></div><div class="sa-actions"><button type="button" class="sa-btn sa-light" id="saCancel">Cancel</button><button type="button" class="sa-btn sa-primary" id="saSave">Save Smart Awards Details</button></div></div>`;
    document.body.appendChild(root);
    root.querySelector('.sa-close').onclick=()=>root.remove();root.querySelector('#saCancel').onclick=()=>root.remove();root.onclick=e=>{if(e.target===root)root.remove()};root.querySelector('#saSave').onclick=()=>save(root)
  }

  async function save(root){
    const btn=root.querySelector('#saSave'),status=root.querySelector('#saStatus');btn.disabled=true;status.className='sa-status';status.textContent='Saving…';
    try{
      const t=await resolveTarget();let path=current.qr_path||null;const file=root.querySelector('#saQrFile').files?.[0];
      if(file){const clean=file.name.replace(/[^a-zA-Z0-9._-]+/g,'_');path=`smart-awards/${t.type}-${t.id}/${Date.now()}-${clean}`;const up=await db.storage.from('learner-documents').upload(path,file,{upsert:true,contentType:file.type||undefined});if(up.error)throw up.error}
      let error;
      if(t.type==='person'){
        ({error}=await db.from('people').update({
          smart_awards_learner_id:root.querySelector('#saQuartz').value.trim()||null,
          smart_awards_card_id:root.querySelector('#saCard').value.trim()||null,
          smart_awards_user_id:root.querySelector('#saUser').value.trim()||null,
          smart_awards_email:root.querySelector('#saEmail').value.trim()||null,
          smart_awards_qr_path:path,
          smart_awards_nops_url:root.querySelector('#saUrl').value.trim()||null,
          updated_at:new Date().toISOString()
        }).eq('id',t.id));
      }else{
        ({error}=await db.from('profiles').update({
          smart_quartz_learner_id:root.querySelector('#saQuartz').value.trim()||null,
          smart_nops_card_id:root.querySelector('#saCard').value.trim()||null,
          smart_nops_user_id:root.querySelector('#saUser').value.trim()||null,
          smart_nops_qr_path:path,
          smart_nops_url:root.querySelector('#saUrl').value.trim()||null,
          updated_at:new Date().toISOString()
        }).eq('id',t.id));
      }
      if(error)throw error;
      current=null;status.textContent='Smart Awards details saved.';status.className='sa-status sa-ok';setTimeout(()=>root.remove(),650)
    }catch(e){status.textContent=e.message||'Unable to save Smart Awards details.';status.className='sa-status sa-bad';btn.disabled=false}
  }

  injectStyles();if(!addButton()){const mo=new MutationObserver(()=>{if(addButton())mo.disconnect()});mo.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>mo.disconnect(),10000)}
})();
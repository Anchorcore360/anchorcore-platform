(function(){
  const code=value=>(String(value||'').toUpperCase().match(/\bSA\d+[A-Z]?\b/)||[])[0]||'';
  function pick(required,records,fallback){
    const requirement=code(required);
    if(requirement!=='SA002'&&requirement!=='SA006')return (records||[]).find(fallback);
    const candidates=(records||[]).filter(record=>{const held=code(record.accreditation_name);return held===requirement||(requirement==='SA002'&&held==='SA006')});
    // Prefer the certificate with the latest expiry, so an old expired record cannot hide current coverage.
    candidates.sort((a,b)=>String(b.expiry_date||'9999-12-31').localeCompare(String(a.expiry_date||'9999-12-31')));
    return candidates[0];
  }
  window.rrtaCompliancePick=pick;
  window.rrtaCoverageNote=(required,record)=>code(required)==='SA002'&&code(record?.accreditation_name)==='SA006'?'Covered by SA006':'';
})();

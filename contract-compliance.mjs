// Pure compliance calculation; no database access.
// IDs must be stable catalogue item IDs, not fuzzy course titles.
export function complianceFor({employeeId, roleIds=[], contractIds=[], roleRequirements=[], contractRequirements=[], qualifications=[], scope="combined", selectedContractId=null, selectedRoleId=null, today=new Date().toISOString().slice(0,10)}) {
  if (!["role","contract","combined"].includes(scope)) throw new Error("Invalid scope");
  const roleSet=new Set(roleIds.map(String)), contractSet=new Set(contractIds.map(String));
  if (selectedContractId!==null && !contractSet.has(String(selectedContractId))) throw new Error("Contract not assigned");
  if (selectedRoleId!==null && !roleSet.has(String(selectedRoleId))) throw new Error("Role not assigned");
  const needs=new Map();
  function add(rows, assigned, key, selected, kind) {
    for(const row of rows) {
      if(row.status!=="required" || !assigned.has(String(row[key])) || (selected!==null && String(row[key])!==String(selected))) continue;
      const id=String(row.compliance_item_id);
      if(!needs.has(id)) needs.set(id,{itemId:id,sources:[]});
      const sources=needs.get(id).sources, source={kind,id:String(row[key])};
      if(!sources.some(x=>x.kind===kind&&x.id===source.id)) sources.push(source);
    }
  }
  if(scope!=="contract") add(roleRequirements,roleSet,"job_role_id",selectedRoleId,"role");
  if(scope!=="role") add(contractRequirements,contractSet,"contract_id",selectedContractId,"contract");
  const items=[...needs.values()].map(item=>{
    const records=qualifications.filter(q=>String(q.employee_id)===String(employeeId)&&String(q.compliance_item_id)===item.itemId&&q.verified===true&&q.revoked!==true&&(!q.issue_date||q.issue_date<=today));
    const current=records.filter(q=>q.expiry_date?q.expiry_date>=today:q.no_expiry===true);
    const indefinite=current.some(q=>q.no_expiry===true&&!q.expiry_date);
    const latest=current.map(q=>q.expiry_date).filter(Boolean).sort().pop();
    const days=latest?(Date.parse(latest)-Date.parse(today))/86400000:null;
    const status=current.length?(indefinite||days>30?"valid":"expiring"):records.some(q=>q.expiry_date&&q.expiry_date<today)?"expired":records.length?"unverified":"missing";
    return {...item,status};
  });
  const covered=items.filter(x=>["valid","expiring"].includes(x.status)).length;
  return {scope,items,required:items.length,covered,score:items.length?Math.round(100*covered/items.length):null};
}

// Run: node --test tests/bulk-people-upload.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'../bulk-people-upload.js'),'utf8');
const person = (extra={}) => ({Forename:'Alex',Surname:'Example','Personal Email':'alex@example.test',...extra});
const photo = (name='alex.png',extra={}) => ({name,type:'image/png',size:100,lastModified:1,webkitRelativePath:'',...extra});
function app(options={}) {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id,{hidden:id==='review',disabled:id==='import',textContent:'',innerHTML:'',value:''});
    return elements.get(id);
  };
  const calls = [], revoked = [];
  const db = {
    from: table => ({ select: async () => options.lookup ? options.lookup(table) : {data:table==='external_customers'?[{id:'rrt',company_name:'Rapid Response Telecoms Ltd',active:true}]:[],error:null},update:patch=>({eq:()=>({select:()=>({single:async()=>{calls.push({name:'company-update',args:patch});return options.companyError?{error:{message:'Save denied'}}:{data:{id:'person-1'}}}})})}) }),
    rpc: async (name,args) => {
      calls.push({name,args});
      if (options.rpc) return options.rpc(name,args);
      return {data:name==='bulk_import_person'?'person-1':null,error:null};
    },
    storage:{from:()=>({upload:async (...args)=> {calls.push({name:'upload',args});return {error:options.photoError?{message:'Storage unavailable'}:null}},remove:async()=>({error:null})})}
  };
  const context = {
    document:{getElementById:get},supabase:{createClient:()=>db},confirm:()=>true,
    URL:{createObjectURL:f=>'blob:'+f.name,revokeObjectURL:url=>revoked.push(url)},
    Image:class {async decode(){if(this.src.includes('corrupt'))throw Error('bad image')}},
    XLSX:{read:data=>({SheetNames:['People'],Sheets:{People:JSON.parse(data)}}),utils:{sheet_to_json:(ws,opts)=>opts.header?[Object.keys(ws[0]||{})]:ws}},
    addEventListener:()=>{},console
  };
  context.window = context;
  vm.runInNewContext(source,context);
  return {
    get,calls,revoked,
    sheet:async rows=>{await get('sheet').onchange({target:{files:[{arrayBuffer:async()=>JSON.stringify(rows)}]}});if(!options.noAck){get('ack-no-company').checked=true;get('ack-no-company').onchange();}},
    photos:files=>get('photos').onchange({target:{files,value:'selected'}}),
    folder:files=>get('photo-folder').onchange({target:{files,value:'selected'}})
  };
}
test('spreadsheet reveals review section without named DOM globals',async()=>{
  const a=app(); await a.sheet([person()]);
  assert.equal(a.get('review').hidden,false);
  assert.equal(a.get('import').disabled,false);
  assert.match(a.get('preview').innerHTML,/Alex Example/);
});
test('missing photo blocks import, multiple selections append and matching is case insensitive',async()=>{
  const a=app(); await a.sheet([person({'Photo Filename':' ALEX.PNG '})]);
  assert.equal(a.get('import').disabled,true); assert.match(a.get('preview').innerHTML,/Missing photo/);
  await a.photos([photo('other.png')]); await a.photos([photo()]);
  assert.match(a.get('photo-summary').textContent,/2 photo file/);
  assert.match(a.get('preview').innerHTML,/Photo matched/); assert.match(a.get('preview').innerHTML,/<img /);
  assert.equal(a.get('import').disabled,false);
});
test('photos can be chosen first, and clearing them invalidates the review and releases previews',async()=>{
  const a=app(); await a.photos([photo()]); await a.sheet([person({'Photo Filename':'alex.png'})]);
  assert.equal(a.get('import').disabled,false); a.get('clear-photos').onclick();
  assert.equal(a.get('import').disabled,true); assert.equal(a.revoked.length,1);
});
test('folder and individual selections share matching; duplicate filenames are not silently overwritten',async()=>{
  const a=app(); await a.sheet([person({'Photo Filename':'alex.png'})]);
  await a.folder([photo('alex.png',{webkitRelativePath:'a/alex.png'}),photo('alex.png',{webkitRelativePath:'b/alex.png'})]);
  assert.match(a.get('preview').innerHTML,/Duplicate filename/); assert.equal(a.get('import').disabled,true);
});
test('reselecting the same file does not introduce a duplicate',async()=>{
  const a=app(); await a.photos([photo()]); await a.photos([photo()]);
  assert.match(a.get('photo-summary').textContent,/1 photo file/);
});
test('wrong type, oversized and corrupt photos block the matching row',async()=>{
  for (const [file,text] of [[photo('alex.png',{type:'image/gif'}),/Wrong file type/],[photo('alex.png',{size:5242881}),/exceeds 5MB/],[photo('corrupt.png'),/cannot be read/]]) {
    const a=app(); await a.photos([file]); await a.sheet([person({'Photo Filename':file.name})]);
    assert.match(a.get('preview').innerHTML,text); assert.equal(a.get('import').disabled,true);
  }
});
test('lookup failure stays visible and fails closed; retry recovers',async()=>{
  let fail=true; const a=app({lookup:()=>fail?{error:{message:'Access denied'}}:{data:[]}});
  await a.sheet([person()]);
  assert.equal(a.get('review').hidden,false); assert.equal(a.get('import').disabled,true);
  assert.match(a.get('upload-status').textContent,/Access denied/); assert.equal(a.get('retry-review').hidden,false);
  fail=false; await a.get('retry-review').onclick(); assert.equal(a.get('import').disabled,false);
});
test('old lookup completion cannot replace the newer spreadsheet review',async()=>{
  let resolveOld, count=0;
  const a=app({lookup:()=>++count<=3?new Promise(resolve=>{const old=resolveOld;resolveOld=()=>{old?.();resolve({data:[{email:'new@example.test'}]})}}):{data:[]}});
  const first=a.sheet([person()]); await new Promise(r=>setImmediate(r));
  await a.sheet([person({'Personal Email':'new@example.test'})]);
  resolveOld(); await first;
  assert.equal(a.get('import').disabled,false); assert.match(a.get('preview').innerHTML,/new@example.test/);
});
test('invalid and empty spreadsheets clear stale importable rows',async()=>{
  const a=app(); await a.sheet([person()]); await a.sheet([{Name:'Wrong template'}]);
  assert.equal(a.get('import').disabled,true); assert.match(a.get('upload-status').textContent,/Required columns/);
  await a.sheet([]); assert.equal(a.get('review').hidden,true);
});
test('spreadsheet text is escaped in the preview',async()=>{
  const a=app(); await a.sheet([person({Forename:'<img src=x onerror=alert(1)>','Photo Filename':'<script>.png'})]);
  assert.doesNotMatch(a.get('preview').innerHTML,/<img src=x|<script>/);
  assert.match(a.get('preview').innerHTML,/&lt;img/);
});
test('duplicate spreadsheet identifiers are blocked',async()=>{
  const a=app(); await a.sheet([person(),person({Forename:'Other'})]);
  assert.equal(a.get('import').disabled,true); assert.match(a.get('preview').innerHTML,/Email repeated/);
});
test('successful import confirms saved photo and does not allow the same row to import twice',async()=>{
  const a=app(); await a.photos([photo()]); await a.sheet([person({'Photo Filename':'alex.png'})]);
  await a.get('import').onclick();
  assert.match(a.get('preview').innerHTML,/Photo uploaded/); assert.match(a.get('preview').innerHTML,/Imported/);
  assert.equal(a.get('import').disabled,true); await a.get('import').onclick();
  assert.equal(a.calls.filter(c=>c.name==='bulk_import_person').length,1);
  assert.deepEqual(a.calls.map(c=>c.name),['bulk_import_person','upload','set_person_photo']);
  a.get('clear-photos').onclick();
  assert.equal(a.revoked.length,0);
  assert.match(a.get('preview').innerHTML,/Photo uploaded/);
});
test('photo upload failure remains in table and imported person cannot be duplicated',async()=>{
  const a=app({photoError:true}); await a.photos([photo()]); await a.sheet([person({'Photo Filename':'alex.png'})]);
  await a.get('import').onclick();
  assert.match(a.get('preview').innerHTML,/Photo upload failed/); assert.match(a.get('preview').innerHTML,/Person imported; photo failed/);
  assert.equal(a.get('import').disabled,true); assert.equal(a.calls.filter(c=>c.name==='set_person_photo').length,0);
});
test('uncertain import does not retry blindly',async()=>{
  const a=app({rpc:()=>{throw Error('Connection lost')}}); await a.sheet([person()]); await a.get('import').onclick();
  assert.match(a.get('preview').innerHTML,/Import status unknown/); assert.equal(a.get('import').disabled,true);
});

test('blank company requires acknowledgement before importing',async()=>{const a=app({noAck:true});await a.sheet([person()]);assert.match(a.get('preview').innerHTML,/No company assigned; will appear under External People/);assert.equal(a.get('import').disabled,true);a.get('ack-no-company').checked=true;a.get('ack-no-company').onchange();assert.equal(a.get('import').disabled,false)});
test('known company is saved after person creation',async()=>{const a=app({noAck:true});await a.sheet([person({Company:'Rapid Response Telecoms'})]);assert.equal(a.get('import').disabled,false);await a.get('import').onclick();assert.equal(a.calls.find(c=>c.name==='company-update').args.default_company_id,'rrt')});
test('unknown company blocks import',async()=>{const a=app();await a.sheet([person({Company:'Unknown Co'})]);assert.equal(a.get('import').disabled,true);assert.match(a.get('preview').innerHTML,/Company not found/)});
test('company save failure preserves created row and cannot duplicate it',async()=>{const a=app({companyError:true});await a.sheet([person({Company:'Rapid Response Telecoms Ltd'})]);await a.get('import').onclick();assert.match(a.get('preview').innerHTML,/company could not be saved/);assert.equal(a.get('import').disabled,true);assert.equal(a.calls.filter(c=>c.name==='bulk_import_person').length,1)});

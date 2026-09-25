const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const key='sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS';
const person={id:'person-1',full_name:'Test Operative',person_type:'workforce',email:'test@example.test',status:'active',photo_path:'people/person-1/photo.png',job_title:'Installer',employee_number:'EMP-1'};
async function page(file,options={}) {
  const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
  const elements={};
  for(const match of html.matchAll(/\bid="([^"]+)"/g)) elements[match[1]]={innerHTML:'',textContent:'',value:match[1]==='status'?'active':match[1]==='company'||match[1]==='manager'?'all':'',addEventListener(){},insertAdjacentHTML(){},classList:{toggle(){}}};
  const calls=[];
  const db={auth:{getUser:async()=>options.auth||{data:{user:{id:'admin'}}}},from(table){
    calls.push(table); let single=false,filter;
    const query={select(){return query},eq(k,v){filter=v;return query},single(){single=true;return query},maybeSingle(){single=true;return query},order(){return query},then(resolve,reject){
      let data=table==='people'?(single?(options.person||person):options.people||[person]):table==='profiles'?(single?{id:'admin',account_status:'active',permission_level:'super_user'}:options.profiles||[]):single?{company_name:'Test Company'}:options.companies||[];
      return Promise.resolve({data,error:options.peopleError&&table==='people'?{message:'Person unavailable'}:null}).then(resolve,reject);
    }};return query;
  },storage:{from(bucket){assert.equal(bucket,'learner-photos');return{async createSignedUrl(photo){calls.push(photo);return options.photoError?{error:{message:'Storage denied'}}:{data:{signedUrl:'https://test.invalid/'+photo}}}}}}};
  const context={...elements,document:{documentElement:{classList:{add(){}}},getElementById:id=>elements[id]},supabase:{createClient:(url,apiKey)=>{assert.equal(apiKey,key,'page must use the active project key');return db}},location:{search:'?view=external',href:''},URLSearchParams,console};
  context.window=context;vm.createContext(context);
  scripts.forEach(source=>vm.runInContext(source,context));
  await new Promise(resolve=>setImmediate(resolve));
  return {elements,calls,location:context.location};
}
test('Manage People displays imported photo and opens person record without a login profile',async()=>{
 const p=await page('manage-people.html');assert.match(p.elements.rows.innerHTML,/https:\/\/test.invalid\/people\/person-1\/photo.png/);assert.match(p.elements.rows.innerHTML,/person-profile.html\?id=person-1/);assert.match(p.elements.rows.innerHTML,/Installer/);assert.equal(p.location.href,'');
});
test('linked profiles keep their photo and learner profile destination',async()=>{
 const p=await page('manage-people.html',{people:[{...person,profile_id:'profile-1'}],profiles:[{id:'profile-1',photo_path:'profile-1/legacy.png'}]});assert.match(p.elements.rows.innerHTML,/profile-1\/legacy.png/);assert.match(p.elements.rows.innerHTML,/learner-profile.html\?id=profile-1/);
});
test('linked profile without photo falls back to the imported person photo',async()=>{
 const p=await page('manage-people.html',{people:[{...person,profile_id:'profile-1'}],profiles:[{id:'profile-1'}]});assert.match(p.elements.rows.innerHTML,/people\/person-1\/photo.png/);
});

test('unassigned people are classified as external and clearly labelled',async()=>{const p=await page('manage-people.html');assert.match(p.elements.rows.innerHTML,/Company not assigned/);assert.match(p.elements.rows.innerHTML,/No login account/)});
test('assigning RRT moves imported person out of External People',async()=>{const p=await page('manage-people.html',{people:[{...person,default_company_id:'rrt'}],companies:[{id:'rrt',company_name:'Rapid Response Telecoms Ltd'}]});assert.doesNotMatch(p.elements.rows.innerHTML,/Test Operative/)});

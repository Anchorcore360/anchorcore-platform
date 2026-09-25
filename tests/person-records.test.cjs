const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const key='sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS';
const person={id:'person-1',profile_id:null,full_name:'Test Operative',person_type:'workforce',email:'test@example.test',status:'active',photo_path:'people/person-1/photo.png',job_title:'Installer',employee_number:'EMP-1'};
async function page(file,options={}) {
  const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
  const elements={};
  for(const match of html.matchAll(/\bid="([^"]+)"/g)) elements[match[1]]={innerHTML:'',textContent:'',value:match[1]==='status'?'active':match[1]==='company'||match[1]==='manager'?'all':'',addEventListener(){},insertAdjacentHTML(){},classList:{toggle(){}}};
  const calls=[];
  const db={auth:{getUser:async()=>options.auth||{data:{user:{id:'admin'}}}},from(table){
    calls.push(table); let single=false,filter;
    const query={select(){return query},eq(k,v){filter=v;return query},is(){return query},limit(){return query},single(){single=true;return query},maybeSingle(){single=true;return query},order(){return query},then(resolve,reject){
      let data=table==='people'?(single?(options.person||person):options.people||[person]):table==='profiles'?(single?{id:'admin',account_status:'active',permission_level:'super_user'}:options.profiles||[]):single?{company_name:'Test Company'}:[];
      return Promise.resolve({data,error:options.peopleError&&table==='people'?{message:'Person unavailable'}:null}).then(resolve,reject);
    }};return query;
  },storage:{from(bucket){assert.equal(bucket,'learner-photos');return{async createSignedUrl(photo){calls.push(photo);return options.photoError?{error:{message:'Storage denied'}}:{data:{signedUrl:'https://test.invalid/'+photo}}}}}}};
  const context={...elements,document:{documentElement:{classList:{add(){}}},getElementById:id=>elements[id]},supabase:{createClient:(url,apiKey)=>{assert.equal(apiKey,key,'page must use the active project key');return db}},location:{search:'?id=person-1',href:''},URLSearchParams,console};
  context.window=context;vm.createContext(context);
  scripts.forEach(source=>vm.runInContext(source,context));
  await new Promise(resolve=>setImmediate(resolve));
  return {elements,calls,location:context.location};
}
test('Manage People displays imported photo and opens person record without a login profile',async()=>{
 const p=await page('manage-people.html');assert.match(p.elements.rows.innerHTML,/https:\/\/test.invalid\/people\/person-1\/photo.png/);assert.match(p.elements.rows.innerHTML,/person-profile.html\?id=person-1/);assert.match(p.elements.rows.innerHTML,/Installer/);assert.equal(p.location.href,'');
 assert.match(p.elements.rows.innerHTML,/No Portal Access/);assert.doesNotMatch(p.elements.rows.innerHTML,/External · No Access/);
});
test('linked profiles keep their photo and learner profile destination',async()=>{
 const p=await page('manage-people.html',{people:[{...person,profile_id:'profile-1'}],profiles:[{id:'profile-1',photo_path:'profile-1/legacy.png'}]});assert.match(p.elements.rows.innerHTML,/profile-1\/legacy.png/);assert.match(p.elements.rows.innerHTML,/learner-profile.html\?id=profile-1/);
});
test('linked profile without photo falls back to the imported person photo',async()=>{
 const p=await page('manage-people.html',{people:[{...person,profile_id:'profile-1'}],profiles:[{id:'profile-1'}]});assert.match(p.elements.rows.innerHTML,/people\/person-1\/photo.png/);
});
test('person page loads the saved image for a signed-in viewer without redirecting',async()=>{
 const p=await page('person-profile.html');assert.equal(p.location.href,'');assert.match(p.elements.app.innerHTML,/people\/person-1\/photo.png/);assert.match(p.elements.app.innerHTML,/Workforce · No login account/);assert.match(p.elements.app.innerHTML,/EMP-1/);assert.deepEqual(p.calls,['people','people/person-1/photo.png','person_relationships','person_job_roles','accreditations','booking_attendees','accreditation_catalog']);
});
test('missing photo keeps initials and still opens person record',async()=>{
 const p=await page('person-profile.html',{person:{...person,photo_path:null}});assert.match(p.elements.app.innerHTML,/class="avatar">TO/);assert.equal(p.location.href,'');
 for(const section of ['Compliance Job Roles','Accreditations','Bookings','Enable Portal Access','Edit Profile'])assert.ok(p.elements.app.innerHTML.includes(section),section);
 assert.ok(!p.calls.includes('profiles'),'employee loading must not require a login profile');
});
test('photo access errors do not hide person details or send viewer to login',async()=>{
 const p=await page('person-profile.html',{photoError:true});assert.match(p.elements.app.innerHTML,/saved photo could not be loaded/);assert.match(p.elements.app.innerHTML,/Test Operative/);assert.equal(p.location.href,'');
});
test('signed-out viewers are still sent to sign-in',async()=>{
 const p=await page('person-profile.html',{auth:{data:{user:null},error:{name:'AuthSessionMissingError'}}});assert.equal(p.location.href,'portal.html');assert.equal(p.calls.length,0);
});
test('temporary authentication errors are shown instead of a misleading login redirect',async()=>{
 const p=await page('person-profile.html',{auth:{data:{user:null},error:{name:'AuthRetryableFetchError'}}});assert.equal(p.location.href,'');assert.match(p.elements.app.textContent,/Unable to verify your sign-in/);assert.equal(p.calls.length,0);
});
test('database errors are shown without redirecting to login',async()=>{
 const p=await page('person-profile.html',{peopleError:true});assert.equal(p.location.href,'');assert.match(p.elements.app.textContent,/Person unavailable/);
});

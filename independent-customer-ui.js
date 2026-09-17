(function(){
const page=(location.pathname.split('/').pop()||'').toLowerCase();
if(page!=='finance-quotes.html')return;
function boot(){const form=document.getElementById('quoteForm'),company=document.getElementById('company');if(!form||!company)return false;if(document.getElementById('customerType'))return true;
const label=company.closest('label');const typeLabel=document.createElement('label');typeLabel.innerHTML='Customer type<select id="customerType"><option value="company">Company</option><option value="independent">Independent</option></select>';label.parentNode.insertBefore(typeLabel,label);
const addressLabel=document.createElement('label');addressLabel.className='full';addressLabel.innerHTML='Customer address<textarea id="customerAddress" placeholder="Required for independent customers"></textarea>';const billing=document.getElementById('billingAddress')?.closest('label');billing?.parentNode.insertBefore(addressLabel,billing);
const type=document.getElementById('customerType'),address=document.getElementById('customerAddress');function sync(){const independent=type.value==='independent';label.style.display=independent?'none':'';company.required=!independent;if(independent)company.value='';address.required=independent;const cn=document.getElementById('contactName');if(cn)cn.required=independent}type.onchange=sync;sync();
form.addEventListener('submit',async e=>{if(e.defaultPrevented)return;sessionStorage.setItem('rrtaQuoteCustomerType',type.value);sessionStorage.setItem('rrtaQuoteCustomerAddress',address.value.trim())},true);
const original=window.fetch;return true}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{let n=0,t=setInterval(()=>{if(boot()||++n>30)clearInterval(t)},100)},{once:true});else boot();
})();
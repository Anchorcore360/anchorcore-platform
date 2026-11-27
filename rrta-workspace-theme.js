/* Shared, device-local workspace appearance preference. */
(function(){
 const key='rrta-workspace-theme',allowed=['light','slate','dark'];
 function read(){try{const v=localStorage.getItem(key);return allowed.includes(v)?v:'slate'}catch(e){return 'slate'}}
 function apply(value,save=false){if(!allowed.includes(value))value='slate';document.documentElement.dataset.rrtaTheme=value;if(document.body)document.body.dataset.rrtaTheme=value;document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===value)));if(save)try{localStorage.setItem(key,value)}catch(e){}}
 apply(read());
 function init(){apply(read());document.querySelectorAll('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.themeChoice,true)))}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('storage',e=>{if(e.key===key)apply(read())});
})();
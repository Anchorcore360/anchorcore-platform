(function(){
  if(window.__rrtaAcademyPageShell)return;window.__rrtaAcademyPageShell=true;
  function loadNav(){if(document.querySelector('script[data-rrta-platform-nav]'))return;const s=document.createElement('script');s.src='trainer-navigation.js';s.dataset.rrtaPlatformNav='1';document.head.appendChild(s)}
  function boot(){
    const existing=document.querySelector('aside.side,aside.booking-side,.shell > aside.sidebar');
    if(existing){loadNav();return;}
    const direct=[...document.body.children].filter(el=>!['SCRIPT','STYLE'].includes(el.tagName));
    const wrapper=document.createElement('div');wrapper.className='rrta-generated-shell';
    const side=document.createElement('aside');side.className='side rrta-generated-side';
    const main=document.createElement('div');main.className='rrta-generated-main';
    direct.forEach(el=>main.appendChild(el));wrapper.append(side,main);document.body.insertBefore(wrapper,document.body.firstChild);
    const style=document.createElement('style');style.textContent=`.rrta-generated-shell{display:grid;grid-template-columns:258px minmax(0,1fr);min-height:100vh}.rrta-generated-main{min-width:0}.rrta-generated-main>.site-header{display:none!important}.rrta-generated-main>main{max-width:none!important;margin:0!important}.rrta-generated-side{min-height:100vh}@media(max-width:1000px){.rrta-generated-shell{grid-template-columns:1fr}}`;document.head.appendChild(style);
    loadNav();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
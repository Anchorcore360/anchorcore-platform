(function(){
  function addLink(){
    const compliance=[...document.querySelectorAll('#trainerDashboardScreen .sidebar a.side-link')].find(a=>a.textContent.trim()==='Compliance');
    if(!compliance||document.querySelector('#trainerDashboardScreen .sidebar a[href="evidence-review.html"]'))return;
    const link=document.createElement('a');
    link.className='side-link';link.href='evidence-review.html';
    link.innerHTML='<span class="side-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h5M8 16h3"/><path d="m15 16 2 2 4-5"/></svg></span><span>Evidence Review</span>';
    compliance.insertAdjacentElement('afterend',link);
  }
  document.addEventListener('DOMContentLoaded',addLink);setTimeout(addLink,300);
})();
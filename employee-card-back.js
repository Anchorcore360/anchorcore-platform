/* Shared back artwork is independent of employee number and hidden on screen. */
(()=>{
const front=document.getElementById('download');
const button=document.createElement('button');button.id='downloadBack';button.type='button';button.textContent='Download back of card';button.disabled=true;button.style.cssText='display:block;margin-top:10px';front.after(button);
const message=document.createElement('small');message.setAttribute('role','status');button.after(message);
const artwork=new Image();artwork.onload=()=>{button.disabled=false};artwork.onerror=()=>{message.textContent='Unable to load back artwork. Refresh to try again.'};artwork.src='assets/employee-card-back-clean.svg';
button.onclick=()=>{button.disabled=true;message.textContent='';try{const canvas=document.createElement('canvas');canvas.width=1016;canvas.height=638;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,1016,638);ctx.drawImage(artwork,0,0,1016,638);canvas.toBlob(blob=>{button.disabled=false;if(!blob){message.textContent='Unable to create back download.';return}const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='rrt-employee-card-back.png';link.style.display='none';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)},'image/png')}catch(error){button.disabled=false;message.textContent='Unable to download the back: '+error.message}};
})();

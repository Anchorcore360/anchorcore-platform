(function () {
  const page = location.pathname.split('/').pop();
  const params = new URLSearchParams(location.search);
  if (page === 'learner-compliance.html') {
    const style = document.createElement('style');
    style.textContent = '#requirements .req{grid-template-columns:minmax(0,1.4fr) .5fr .7fr auto}.accreditation-actions{display:flex;align-items:center;justify-content:flex-end;gap:7px;white-space:nowrap}.accreditation-actions .btn{padding:7px 10px;font-size:11px}.accreditation-upload{width:32px;height:32px;border:1px solid #b20f22;color:#b20f22;background:#fff;border-radius:8px;display:grid;place-items:center;cursor:pointer}.accreditation-upload svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.9}@media(max-width:900px){#requirements .req{grid-template-columns:1fr}.accreditation-actions{justify-self:end}}';
    document.head.appendChild(style);
    const root = document.getElementById('requirements');
    function decorate() {
      root.querySelectorAll('.req').forEach(row => {
        if (row.querySelector('.accreditation-actions')) return;
        const requirement = row.querySelector('strong').textContent.trim();
        const actions = document.createElement('div');
        actions.className = 'accreditation-actions';
        if (row.querySelector('.missing,.expired,.expiring')) {
        const link = document.createElement('a');
        link.className = 'btn dark book-course';
        link.textContent = 'Book Course';
        link.href = 'training-schedule.html?' + new URLSearchParams({person: params.get('id'), requirement});
        actions.appendChild(link);
        }
        const upload = document.createElement('button');
        upload.type = 'button';
        upload.className = 'accreditation-upload';
        upload.title = 'Upload certificate for ' + requirement;
        upload.setAttribute('aria-label', upload.title);
        upload.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M5 14v6h14v-6"/></svg>';
        upload.onclick = () => openAccModal(requirement);
        actions.appendChild(upload);
        row.appendChild(actions);
      });
    }
    new MutationObserver(decorate).observe(root, {childList:true, subtree:true});
    decorate();
  }
  if (page === 'training-schedule.html' && params.get('person')) {
    const notice = document.createElement('div');
    notice.className = 'panel';
    notice.textContent = 'Booking training for requirement: ' + (params.get('requirement') || 'Selected training') + '. Choose a suitable course date, then confirm the employee on Add Learners. If no date is available, add a scheduled course or arrange external training.';
    document.getElementById('scheduleRoot').before(notice);
    const back = document.createElement('a');
    back.className = 'btn secondary';
    back.textContent = 'Back to compliance';
    back.href = 'learner-compliance.html?' + new URLSearchParams({id:params.get('person')});
    notice.appendChild(document.createElement('br'));
    notice.appendChild(back);
  }
  if (page === 'add-learners.html' && params.get('person')) {
    const select = document.getElementById('internalLearner');
    function preselect() {
      const person = params.get('person');
      if ([...select.options].some(option => option.value === person)) select.value = person;
    }
    new MutationObserver(preselect).observe(select, {childList:true});
    preselect();
  }
})();

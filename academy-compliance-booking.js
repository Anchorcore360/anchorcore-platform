(function () {
  const page = location.pathname.split('/').pop();
  const params = new URLSearchParams(location.search);
  if (page === 'learner-compliance.html') {
    const root = document.getElementById('requirements');
    function decorate() {
      root.querySelectorAll('.req').forEach(row => {
        if (!row.querySelector('.missing,.expired,.expiring') || row.querySelector('.book-course')) return;
        const requirement = row.querySelector('strong').textContent.trim();
        const link = document.createElement('a');
        link.className = 'btn dark book-course';
        link.textContent = 'Book Course';
        link.style.cssText = 'padding:6px 9px;font-size:12px;margin-left:10px;white-space:nowrap';
        link.href = 'training-schedule.html?' + new URLSearchParams({person: params.get('id'), requirement});
        row.lastElementChild.appendChild(link);
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

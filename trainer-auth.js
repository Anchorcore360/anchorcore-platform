// Live Supabase trainer authentication and dashboard layer.
(function () {
  let acLearners = [];
  let acAssignments = [];
  let acAttempts = [];

  async function acLoadProfile(userId) {
    const { data, error } = await db.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    profile = data;
    return data;
  }

  async function acLoadTrainerData() {
    const learnersRes = await db.from('profiles').select('*').eq('role', 'learner').order('full_name');
    if (learnersRes.error) throw learnersRes.error;
    const assignmentsRes = await db.from('assignments').select('id, learner_id, course_id, status, assigned_at, due_date, completed_at').order('assigned_at', { ascending: false });
    if (assignmentsRes.error) throw assignmentsRes.error;
    const attemptsRes = await db.from('assessment_attempts').select('id, learner_id, course_id, score, passed, started_at, completed_at').order('completed_at', { ascending: false });
    if (attemptsRes.error) throw attemptsRes.error;

    acLearners = learnersRes.data || [];
    acAssignments = assignmentsRes.data || [];
    acAttempts = attemptsRes.data || [];
  }

  function acRenderLearners() {
    if (!acLearners.length) {
      $('learnersTable').innerHTML = '<p class="muted">No learners have been created yet.</p>';
      return;
    }

    $('learnersTable').innerHTML = `
      <div class="table-wrap"><table class="table"><thead><tr>
        <th>Learner</th><th>Organisation</th><th>Employee no.</th><th>Job title</th><th>Learning status</th>
      </tr></thead><tbody>
      ${acLearners.map(learner => {
        const assignment = acAssignments.find(a => a.learner_id === learner.id);
        const latest = acAttempts.find(a => a.learner_id === learner.id);
        let status = '<span class="pill none">Not assigned</span>';
        if (assignment) status = `<span class="pill assigned">${esc(assignment.status || 'assigned')}</span>`;
        if (latest?.passed) status = `<span class="pill pass">Passed · ${latest.score}%</span>`;
        if (latest && !latest.passed) status = `<span class="pill refer">Refer · ${latest.score}%</span>`;
        return `<tr>
          <td><strong>${esc(learner.full_name)}</strong><br><small>${esc(learner.email || '')}</small></td>
          <td>${esc(learner.organisation || '—')}</td>
          <td>${esc(learner.employee_number || '—')}</td>
          <td>${esc(learner.job_title || '—')}</td>
          <td>${status}</td>
        </tr>`;
      }).join('')}
      </tbody></table></div>`;
  }

  function acRenderResults() {
    if (!acAttempts.length) {
      $('resultsTable').innerHTML = '<p class="muted">No assessment results have been recorded yet.</p>';
      return;
    }

    $('resultsTable').innerHTML = `
      <div class="table-wrap"><table class="table"><thead><tr>
        <th>Learner</th><th>Date</th><th>Score</th><th>Result</th>
      </tr></thead><tbody>
      ${acAttempts.map(a => {
        const learner = acLearners.find(l => l.id === a.learner_id);
        return `<tr>
          <td>${esc(learner?.full_name || 'Learner')}</td>
          <td>${fmtDate(a.completed_at)}</td>
          <td>${a.score}%</td>
          <td><span class="pill ${a.passed ? 'pass' : 'refer'}">${a.passed ? 'PASS' : 'REFER'}</span></td>
        </tr>`;
      }).join('')}
      </tbody></table></div>`;
  }

  function acRenderTrainer() {
    $('trainerStats').innerHTML = `
      <div class="stat"><span>Learners</span><strong>${acLearners.length}</strong></div>
      <div class="stat alert"><span>Assigned learning</span><strong>${acAssignments.filter(a => a.status === 'assigned').length}</strong></div>
      <div class="stat"><span>Passed</span><strong>${acAttempts.filter(a => a.passed === true).length}</strong></div>
      <div class="stat"><span>Assessment attempts</span><strong>${acAttempts.length}</strong></div>`;

    const recent = acAttempts.slice(0, 5);
    $('recentActivity').innerHTML = recent.length ? recent.map(a => {
      const learner = acLearners.find(l => l.id === a.learner_id);
      return `<div class="activity"><span class="dot"></span><div><strong>${esc(learner?.full_name || 'Learner')}</strong><small>${a.passed ? 'Passed' : 'Referred'} · ${a.score}% · ${fmtDate(a.completed_at)}</small></div></div>`;
    }).join('') : '<p class="muted">No assessment activity yet.</p>';

    acRenderLearners();
    acRenderResults();
  }

  function acTrainerView(name) {
    document.querySelectorAll('.trainer-view').forEach(view => view.classList.remove('active'));
    $('trainer-' + name)?.classList.add('active');
    document.querySelectorAll('[data-trainer-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.trainerView === name);
    });
    if (name === 'learners') acRenderLearners();
    if (name === 'results') acRenderResults();
  }

  async function acEnterPortal(userId) {
    const p = await acLoadProfile(userId);

    if (p.role === 'trainer') {
      await acLoadTrainerData();
      setHeaderUser(p.full_name, 'trainer');
      acRenderTrainer();
      showScreen('trainer');
      return;
    }

    if (p.role === 'learner') {
      await loadLearnerData(userId);
      setHeaderUser(profile.full_name, 'learner');
      renderLearner();
      showScreen('learner');
      return;
    }

    throw new Error('This account does not have an authorised portal role.');
  }

  $('loginForm').onsubmit = async function (event) {
    event.preventDefault();
    hideLoginError();
    const email = $('loginEmail').value.trim().toLowerCase();
    const password = $('loginPassword').value;

    try {
      const { data, error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      session = data.session;
      await acEnterPortal(data.user.id);
    } catch (error) {
      console.error('Login failed:', error);
      await db.auth.signOut();
      session = null;
      profile = null;
      showLoginError('Email or password not recognised.');
    }
  };

  document.querySelectorAll('[data-trainer-view]').forEach(btn => {
    btn.onclick = () => acTrainerView(btn.dataset.trainerView);
  });

  const trainerDemo = document.querySelector('[data-demo="trainer"]');
  if (trainerDemo) {
    trainerDemo.textContent = 'Use Wesley trainer login';
    trainerDemo.onclick = () => {
      $('loginEmail').value = 'wesley.marsden@rapidresonstelecoms.com';
      $('loginPassword').value = '';
      $('loginPassword').focus();
    };
  }

  // If a valid session exists when this layer loads, route it by role.
  db.auth.getSession().then(async ({ data }) => {
    if (!data.session) return;
    try {
      session = data.session;
      await acEnterPortal(data.session.user.id);
    } catch (error) {
      console.error('Session routing failed:', error);
    }
  });
})();

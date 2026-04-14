const state = {
  user: null,
  publicData: { tournaments: [], teams: [], matches: [] },
  lookups: null,
};

const el = {
  status: document.getElementById('status'),
  loginForm: document.getElementById('loginForm'),
  logoutBtn: document.getElementById('logoutBtn'),
  userBox: document.getElementById('userBox'),
  userName: document.getElementById('userName'),
  userRole: document.getElementById('userRole'),
  refreshPublicBtn: document.getElementById('refreshPublicBtn'),

  tournamentCards: document.getElementById('tournamentCards'),
  matchesBody: document.getElementById('matchesBody'),

  adminPanel: document.getElementById('adminPanel'),
  leaderPanel: document.getElementById('leaderPanel'),
  participantPanel: document.getElementById('participantPanel'),

  adminTournamentForm: document.getElementById('adminTournamentForm'),
  adminTeamForm: document.getElementById('adminTeamForm'),
  adminPlayerForm: document.getElementById('adminPlayerForm'),
  adminMatchForm: document.getElementById('adminMatchForm'),
  adminResultForm: document.getElementById('adminResultForm'),

  adminTeamTournament: document.getElementById('adminTeamTournament'),
  adminLeaderSelect: document.getElementById('adminLeaderSelect'),
  adminPlayerTeam: document.getElementById('adminPlayerTeam'),
  adminMatchTournament: document.getElementById('adminMatchTournament'),
  adminMatchTeam1: document.getElementById('adminMatchTeam1'),
  adminMatchTeam2: document.getElementById('adminMatchTeam2'),
  adminResultMatch: document.getElementById('adminResultMatch'),

  leaderTeamForm: document.getElementById('leaderTeamForm'),
  leaderPlayerForm: document.getElementById('leaderPlayerForm'),
  leaderTournament: document.getElementById('leaderTournament'),
  leaderTeamSelect: document.getElementById('leaderTeamSelect'),
  leaderTeamsBody: document.getElementById('leaderTeamsBody'),

  participantJoinForm: document.getElementById('participantJoinForm'),
  participantTeamSelect: document.getElementById('participantTeamSelect'),
};

const roleLabels = {
  admin: 'Admin',
  leader: 'Lagleder',
  participant: 'Deltaker',
};

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.error || 'Ukjent feil.');
  }

  return payload;
}

function showStatus(message, isError = false) {
  if (!message) {
    el.status.classList.add('hidden');
    el.status.textContent = '';
    el.status.classList.remove('error');
    return;
  }

  el.status.textContent = message;
  el.status.classList.remove('hidden');
  if (isError) {
    el.status.classList.add('error');
  } else {
    el.status.classList.remove('error');
  }
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('nb-NO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatResult(match) {
  if (match.score1 === null || match.score2 === null || match.score1 === undefined || match.score2 === undefined) {
    return 'Ikke spilt';
  }
  return `${match.score1} - ${match.score2}`;
}

function setOptions(select, items, mapFn, placeholder) {
  const options = [];
  if (placeholder) {
    options.push(`<option value="">${placeholder}</option>`);
  }

  for (const item of items) {
    const mapped = mapFn(item);
    options.push(`<option value="${mapped.value}">${mapped.label}</option>`);
  }

  select.innerHTML = options.join('');
}

function renderPublicData() {
  const { tournaments, matches } = state.publicData;

  el.tournamentCards.innerHTML = tournaments
    .map(
      (tournament) => `
      <article class="tournament-card">
        <p class="name">${escapeHtml(tournament.name)}</p>
        <p>${escapeHtml(tournament.date)}</p>
        <p class="muted">Lag registrert: ${tournament.team_count}</p>
      </article>
    `
    )
    .join('');

  el.matchesBody.innerHTML = matches
    .map(
      (match) => `
      <tr>
        <td>${escapeHtml(match.tournament_name)}</td>
        <td>${escapeHtml(formatDate(match.kickoff))}</td>
        <td>${escapeHtml(match.team1_name)} vs ${escapeHtml(match.team2_name)}</td>
        <td>${escapeHtml(formatResult(match))}</td>
      </tr>
    `
    )
    .join('');

  if (!matches.length) {
    el.matchesBody.innerHTML = '<tr><td colspan="4">Ingen kamper registrert ennå.</td></tr>';
  }
}

function renderAuthState() {
  const user = state.user;
  const loggedIn = Boolean(user);

  el.loginForm.classList.toggle('hidden', loggedIn);
  el.userBox.classList.toggle('hidden', !loggedIn);

  if (loggedIn) {
    el.userName.textContent = user.name;
    el.userRole.textContent = roleLabels[user.role] || user.role;
  }

  el.adminPanel.classList.toggle('hidden', user?.role !== 'admin');
  el.leaderPanel.classList.toggle('hidden', user?.role !== 'leader');
  el.participantPanel.classList.toggle('hidden', user?.role !== 'participant');
}

function renderRoleData() {
  if (!state.user || !state.lookups) {
    return;
  }

  const tournaments = state.lookups.tournaments || [];
  const teams = state.lookups.teams || [];
  const matches = state.lookups.matches || [];

  setOptions(el.participantTeamSelect, teams, (team) => ({
    value: team.id,
    label: `${team.name} (${team.tournament_name})`,
  }), 'Velg lag');

  if (state.user.role === 'admin') {
    setOptions(el.adminTeamTournament, tournaments, (tournament) => ({
      value: tournament.id,
      label: `${tournament.name} (${tournament.date})`,
    }), 'Velg turnering');

    setOptions(el.adminMatchTournament, tournaments, (tournament) => ({
      value: tournament.id,
      label: `${tournament.name} (${tournament.date})`,
    }), 'Velg turnering');

    setOptions(el.adminPlayerTeam, teams, (team) => ({
      value: team.id,
      label: `${team.name} (${team.tournament_name})`,
    }), 'Velg lag');

    setOptions(el.adminMatchTeam1, teams, (team) => ({
      value: team.id,
      label: `${team.name} (${team.tournament_name})`,
    }), 'Velg lag 1');

    setOptions(el.adminMatchTeam2, teams, (team) => ({
      value: team.id,
      label: `${team.name} (${team.tournament_name})`,
    }), 'Velg lag 2');

    setOptions(el.adminLeaderSelect, state.lookups.leaders || [], (leader) => ({
      value: leader.id,
      label: `${leader.name} (${leader.username})`,
    }), 'Ingen lagleder valgt');

    setOptions(el.adminResultMatch, matches, (match) => ({
      value: match.id,
      label: `${match.team1_name} vs ${match.team2_name} (${formatDate(match.kickoff)})`,
    }), 'Velg kamp');
  }

  if (state.user.role === 'leader') {
    setOptions(el.leaderTournament, tournaments, (tournament) => ({
      value: tournament.id,
      label: `${tournament.name} (${tournament.date})`,
    }), 'Velg turnering');

    setOptions(el.leaderTeamSelect, state.lookups.myTeams || [], (team) => ({
      value: team.id,
      label: `${team.name} (${team.tournament_name})`,
    }), 'Velg eget lag');

    const myTeams = state.lookups.myTeams || [];
    el.leaderTeamsBody.innerHTML = myTeams
      .map(
        (team) => `
        <tr>
          <td>${escapeHtml(team.name)}</td>
          <td>${escapeHtml(team.tournament_name)}</td>
        </tr>
      `
      )
      .join('');

    if (!myTeams.length) {
      el.leaderTeamsBody.innerHTML = '<tr><td colspan="2">Ingen lag registrert ennå.</td></tr>';
    }
  }
}

async function refreshPublicData() {
  const publicData = await api('/api/public/dashboard');
  state.publicData = publicData;
  renderPublicData();
}

async function refreshUserAndRoleData() {
  const me = await api('/api/auth/me');
  state.user = me.user;
  renderAuthState();

  if (state.user) {
    state.lookups = await api('/api/secure/lookups');
  } else {
    state.lookups = null;
  }

  renderRoleData();
}

async function reloadAll() {
  await refreshPublicData();
  await refreshUserAndRoleData();
}

function toPayload(formElement) {
  return Object.fromEntries(new FormData(formElement).entries());
}

function attachEvents() {
  el.refreshPublicBtn.addEventListener('click', async () => {
    try {
      await refreshPublicData();
      showStatus('Offentlig visning er oppdatert.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  el.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const payload = toPayload(el.loginForm);
      await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      el.loginForm.reset();
      await reloadAll();
      showStatus('Innlogging vellykket.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  el.logoutBtn.addEventListener('click', async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
      await reloadAll();
      showStatus('Du er logget ut.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  el.adminTournamentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const payload = toPayload(el.adminTournamentForm);
      await api('/api/admin/tournaments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      el.adminTournamentForm.reset();
      await reloadAll();
      showStatus('Turnering opprettet.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  el.adminTeamForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const payload = toPayload(el.adminTeamForm);
      if (!payload.leaderUserId) {
        delete payload.leaderUserId;
      }

      await api('/api/admin/teams', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      el.adminTeamForm.reset();
      await reloadAll();
      showStatus('Lag registrert.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  el.adminPlayerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const payload = toPayload(el.adminPlayerForm);
      await api('/api/admin/players', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      el.adminPlayerForm.reset();
      await reloadAll();
      showStatus('Spiller lagt til.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  el.adminMatchForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const payload = toPayload(el.adminMatchForm);
      await api('/api/admin/matches', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      el.adminMatchForm.reset();
      await reloadAll();
      showStatus('Kamp satt opp.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  el.adminResultForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const payload = toPayload(el.adminResultForm);
      const matchId = payload.matchId;
      await api(`/api/admin/matches/${matchId}/result`, {
        method: 'PATCH',
        body: JSON.stringify({ score1: payload.score1, score2: payload.score2 }),
      });
      el.adminResultForm.reset();
      await reloadAll();
      showStatus('Resultat registrert.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  el.leaderTeamForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const payload = toPayload(el.leaderTeamForm);
      await api('/api/leader/teams', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      el.leaderTeamForm.reset();
      await reloadAll();
      showStatus('Eget lag opprettet.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  el.leaderPlayerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const payload = toPayload(el.leaderPlayerForm);
      await api('/api/leader/players', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      el.leaderPlayerForm.reset();
      await reloadAll();
      showStatus('Spiller lagt til i eget lag.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  el.participantJoinForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const payload = toPayload(el.participantJoinForm);
      await api('/api/participant/join-team', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      el.participantJoinForm.reset();
      await reloadAll();
      showStatus('Du er meldt på laget.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function boot() {
  try {
    attachEvents();
    await reloadAll();
  } catch (error) {
    showStatus(error.message, true);
  }
}

boot();

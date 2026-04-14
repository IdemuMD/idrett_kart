const path = require('node:path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { db, initializeDatabase } = require('./db');

initializeDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'idrett-kart-utvikling',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    },
  })
);

app.use(express.static(path.join(__dirname, '..', 'public')));

function getUserFromSession(req) {
  if (!req.session.userId) {
    return null;
  }

  return db
    .prepare(
      `SELECT id, name, username, role, age
       FROM users
       WHERE id = ?`
    )
    .get(req.session.userId);
}

function requireAuth(req, res, next) {
  const user = getUserFromSession(req);
  if (!user) {
    return res.status(401).json({ error: 'Du må være logget inn.' });
  }

  req.user = user;
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Mangler bruker i sesjon.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Du har ikke tilgang til dette.' });
    }

    next();
  };
}

function listTournaments() {
  return db
    .prepare(
      `SELECT t.id, t.name, t.date,
              COUNT(DISTINCT te.id) AS team_count
       FROM tournaments t
       LEFT JOIN teams te ON te.tournament_id = t.id
       GROUP BY t.id
       ORDER BY t.date ASC, t.id ASC`
    )
    .all();
}

function listTeams() {
  return db
    .prepare(
      `SELECT te.id, te.name, te.tournament_id, t.name AS tournament_name,
              te.leader_user_id, u.name AS leader_name
       FROM teams te
       INNER JOIN tournaments t ON t.id = te.tournament_id
       LEFT JOIN users u ON u.id = te.leader_user_id
       ORDER BY t.date ASC, te.name ASC`
    )
    .all();
}

function listMatches() {
  return db
    .prepare(
      `SELECT m.id, m.tournament_id, t.name AS tournament_name,
              m.team1_id, te1.name AS team1_name,
              m.team2_id, te2.name AS team2_name,
              m.kickoff, m.score1, m.score2
       FROM matches m
       INNER JOIN tournaments t ON t.id = m.tournament_id
       INNER JOIN teams te1 ON te1.id = m.team1_id
       INNER JOIN teams te2 ON te2.id = m.team2_id
       ORDER BY m.kickoff ASC, m.id ASC`
    )
    .all();
}

function listPlayersForAdmin() {
  return db
    .prepare(
      `SELECT p.id, p.name, p.age, p.team_id, te.name AS team_name, p.user_id
       FROM players p
       INNER JOIN teams te ON te.id = p.team_id
       ORDER BY te.name ASC, p.name ASC`
    )
    .all();
}

app.get('/api/public/dashboard', (req, res) => {
  res.json({
    tournaments: listTournaments(),
    teams: listTeams(),
    matches: listMatches(),
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Brukernavn og passord er påkrevd.' });
  }

  const user = db
    .prepare(
      `SELECT id, name, username, role, age, password_hash
       FROM users
       WHERE username = ?`
    )
    .get(String(username).trim());

  if (!user) {
    return res.status(401).json({ error: 'Ugyldig brukernavn eller passord.' });
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Ugyldig brukernavn eller passord.' });
  }

  req.session.userId = user.id;

  res.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      age: user.age,
    },
  });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getUserFromSession(req);
  res.json({ user });
});

app.get('/api/secure/lookups', requireAuth, (req, res) => {
  const lookup = {
    tournaments: listTournaments(),
    teams: listTeams(),
    matches: listMatches(),
  };

  if (req.user.role === 'admin') {
    lookup.leaders = db
      .prepare(
        `SELECT id, name, username
         FROM users
         WHERE role = 'leader'
         ORDER BY name ASC`
      )
      .all();
  }

  if (req.user.role === 'leader') {
    lookup.myTeams = db
      .prepare(
        `SELECT te.id, te.name, te.tournament_id, t.name AS tournament_name
         FROM teams te
         INNER JOIN tournaments t ON t.id = te.tournament_id
         WHERE te.leader_user_id = ?
         ORDER BY t.date ASC, te.name ASC`
      )
      .all(req.user.id);
  }

  res.json(lookup);
});

app.get('/api/admin/overview', requireAuth, requireRole('admin'), (req, res) => {
  res.json({
    users: db
      .prepare(
        `SELECT id, name, username, role, age, created_at
         FROM users
         ORDER BY id ASC`
      )
      .all(),
    tournaments: listTournaments(),
    teams: listTeams(),
    players: listPlayersForAdmin(),
    matches: listMatches(),
  });
});

app.post('/api/admin/tournaments', requireAuth, requireRole('admin'), (req, res) => {
  const { name, date } = req.body || {};

  if (!name || !date) {
    return res.status(400).json({ error: 'Navn og dato er påkrevd.' });
  }

  const insert = db
    .prepare('INSERT INTO tournaments (name, date) VALUES (?, ?)')
    .run(String(name).trim(), String(date).trim());

  res.status(201).json({ id: insert.lastInsertRowid });
});

app.post('/api/admin/teams', requireAuth, requireRole('admin'), (req, res) => {
  const { name, tournamentId, leaderUserId } = req.body || {};

  if (!name || !tournamentId) {
    return res.status(400).json({ error: 'Lagnavn og turnering er påkrevd.' });
  }

  const tournament = db
    .prepare('SELECT id FROM tournaments WHERE id = ?')
    .get(Number(tournamentId));

  if (!tournament) {
    return res.status(404).json({ error: 'Fant ikke turnering.' });
  }

  try {
    const insert = db
      .prepare(
        `INSERT INTO teams (name, tournament_id, leader_user_id)
         VALUES (?, ?, ?)`
      )
      .run(String(name).trim(), Number(tournamentId), leaderUserId ? Number(leaderUserId) : null);

    res.status(201).json({ id: insert.lastInsertRowid });
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Lagnavnet finnes allerede i denne turneringen.' });
    }
    return res.status(500).json({ error: 'Kunne ikke opprette lag.' });
  }
});

app.post('/api/admin/players', requireAuth, requireRole('admin'), (req, res) => {
  const { name, age, teamId } = req.body || {};

  if (!name || Number.isNaN(Number(age)) || !teamId) {
    return res.status(400).json({ error: 'Navn, alder og lag er påkrevd.' });
  }

  const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(Number(teamId));
  if (!team) {
    return res.status(404).json({ error: 'Fant ikke lag.' });
  }

  const insert = db
    .prepare(
      `INSERT INTO players (name, age, team_id)
       VALUES (?, ?, ?)`
    )
    .run(String(name).trim(), Number(age), Number(teamId));

  res.status(201).json({ id: insert.lastInsertRowid });
});

app.post('/api/admin/matches', requireAuth, requireRole('admin'), (req, res) => {
  const { tournamentId, team1Id, team2Id, kickoff } = req.body || {};

  if (!tournamentId || !team1Id || !team2Id || !kickoff) {
    return res.status(400).json({ error: 'Turnering, lag og tidspunkt er påkrevd.' });
  }

  if (Number(team1Id) === Number(team2Id)) {
    return res.status(400).json({ error: 'Et lag kan ikke spille mot seg selv.' });
  }

  const teams = db
    .prepare('SELECT id, tournament_id FROM teams WHERE id IN (?, ?)')
    .all(Number(team1Id), Number(team2Id));

  if (teams.length !== 2) {
    return res.status(404).json({ error: 'Ett eller begge lag finnes ikke.' });
  }

  const allInTournament = teams.every((team) => team.tournament_id === Number(tournamentId));
  if (!allInTournament) {
    return res.status(400).json({ error: 'Begge lag må tilhøre valgt turnering.' });
  }

  const insert = db
    .prepare(
      `INSERT INTO matches (tournament_id, team1_id, team2_id, kickoff)
       VALUES (?, ?, ?, ?)`
    )
    .run(Number(tournamentId), Number(team1Id), Number(team2Id), String(kickoff).trim());

  res.status(201).json({ id: insert.lastInsertRowid });
});

app.patch('/api/admin/matches/:id/result', requireAuth, requireRole('admin'), (req, res) => {
  const { score1, score2 } = req.body || {};

  if (Number.isNaN(Number(score1)) || Number.isNaN(Number(score2))) {
    return res.status(400).json({ error: 'Resultat må være heltall.' });
  }

  const matchId = Number(req.params.id);
  const existing = db.prepare('SELECT id FROM matches WHERE id = ?').get(matchId);
  if (!existing) {
    return res.status(404).json({ error: 'Fant ikke kamp.' });
  }

  db.prepare('UPDATE matches SET score1 = ?, score2 = ? WHERE id = ?').run(Number(score1), Number(score2), matchId);
  res.json({ ok: true });
});

app.post('/api/leader/teams', requireAuth, requireRole('leader'), (req, res) => {
  const { name, tournamentId } = req.body || {};

  if (!name || !tournamentId) {
    return res.status(400).json({ error: 'Lagnavn og turnering er påkrevd.' });
  }

  const tournament = db.prepare('SELECT id FROM tournaments WHERE id = ?').get(Number(tournamentId));
  if (!tournament) {
    return res.status(404).json({ error: 'Fant ikke turnering.' });
  }

  try {
    const insert = db
      .prepare(
        `INSERT INTO teams (name, tournament_id, leader_user_id)
         VALUES (?, ?, ?)`
      )
      .run(String(name).trim(), Number(tournamentId), req.user.id);

    res.status(201).json({ id: insert.lastInsertRowid });
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Lagnavnet finnes allerede i denne turneringen.' });
    }

    return res.status(500).json({ error: 'Kunne ikke opprette lag.' });
  }
});

app.post('/api/leader/players', requireAuth, requireRole('leader'), (req, res) => {
  const { name, age, teamId } = req.body || {};

  if (!name || Number.isNaN(Number(age)) || !teamId) {
    return res.status(400).json({ error: 'Navn, alder og lag er påkrevd.' });
  }

  const team = db
    .prepare('SELECT id FROM teams WHERE id = ? AND leader_user_id = ?')
    .get(Number(teamId), req.user.id);

  if (!team) {
    return res.status(403).json({ error: 'Du kan kun legge til spillere i egne lag.' });
  }

  const insert = db
    .prepare(
      `INSERT INTO players (name, age, team_id)
       VALUES (?, ?, ?)`
    )
    .run(String(name).trim(), Number(age), Number(teamId));

  res.status(201).json({ id: insert.lastInsertRowid });
});

app.post('/api/participant/join-team', requireAuth, requireRole('participant'), (req, res) => {
  const { teamId, age } = req.body || {};

  if (!teamId) {
    return res.status(400).json({ error: 'Du må velge et lag.' });
  }

  const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(Number(teamId));
  if (!team) {
    return res.status(404).json({ error: 'Fant ikke lag.' });
  }

  const safeAge = Number.isNaN(Number(age)) ? req.user.age || 0 : Number(age);
  if (!safeAge || safeAge < 1) {
    return res.status(400).json({ error: 'Alder må være gyldig.' });
  }

  const existing = db.prepare('SELECT id FROM players WHERE user_id = ?').get(req.user.id);

  if (existing) {
    db.prepare('UPDATE players SET team_id = ?, age = ? WHERE user_id = ?').run(Number(teamId), safeAge, req.user.id);
  } else {
    db.prepare(
      `INSERT INTO players (name, age, team_id, user_id)
       VALUES (?, ?, ?, ?)`
    ).run(req.user.name, safeAge, Number(teamId), req.user.id);
  }

  res.json({ ok: true });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Uventet feil i serveren.' });
});

app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});

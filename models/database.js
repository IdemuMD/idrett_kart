const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'app.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'leader', 'participant')),
      age INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tournament_id INTEGER NOT NULL,
      leader_user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, tournament_id),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (leader_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      team_id INTEGER NOT NULL,
      user_id INTEGER UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      team1_id INTEGER NOT NULL,
      team2_id INTEGER NOT NULL,
      kickoff TEXT NOT NULL,
      score1 INTEGER,
      score2 INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      CHECK (team1_id != team2_id),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (team1_id) REFERENCES teams(id) ON DELETE RESTRICT,
      FOREIGN KEY (team2_id) REFERENCES teams(id) ON DELETE RESTRICT
    );
  `);
}

function seedUsers() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count > 0) return;

  const insertUser = db.prepare(`
    INSERT INTO users (name, username, password_hash, role, age)
    VALUES (?, ?, ?, ?, ?)
  `);

  const users = [
    ['Turneringsadmin', 'admin', bcrypt.hashSync('admin123', 10), 'admin', null],
    ['Lagleder Eksempel', 'lagleder', bcrypt.hashSync('leder123', 10), 'leader', null],
    ['Spiller Eksempel', 'deltaker', bcrypt.hashSync('spiller123', 10), 'participant', 13],
  ];

  const tx = db.transaction(() => {
    for (const user of users) {
      insertUser.run(...user);
    }
  });

  tx();
}

function seedDemoData() {
  const tournamentsCount = db.prepare('SELECT COUNT(*) AS c FROM tournaments').get().c;
  if (tournamentsCount > 0) return;

  const admin = db.prepare(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`).get();
  const leader = db.prepare(`SELECT id FROM users WHERE role = 'leader' LIMIT 1`).get();

  const insertTournament = db.prepare(`INSERT INTO tournaments (name, date) VALUES (?, ?)`);
  const insertTeam = db.prepare(`INSERT INTO teams (name, tournament_id, leader_user_id) VALUES (?, ?, ?)`);
  const insertPlayer = db.prepare(`INSERT INTO players (name, age, team_id, user_id) VALUES (?, ?, ?, ?)`);
  const insertMatch = db.prepare(`INSERT INTO matches (tournament_id, team1_id, team2_id, kickoff, score1, score2) VALUES (?, ?, ?, ?, ?, ?)`);

  const tx = db.transaction(() => {
    const tournament = insertTournament.run('Vaarturnering 2026', '2026-05-20');
    const tournamentId = tournament.lastInsertRowid;

    const teamA = insertTeam.run('Trollstien IL', tournamentId, leader?.id || null).lastInsertRowid;
    const teamB = insertTeam.run('Fjellby FK', tournamentId, admin?.id || null).lastInsertRowid;

    insertPlayer.run('Mia Hansen', 12, teamA, null);
    insertPlayer.run('Noah Berg', 13, teamA, null);
    insertPlayer.run('Ella Nilsen', 12, teamB, null);
    insertPlayer.run('Levi Solberg', 13, teamB, null);

    insertMatch.run(tournamentId, teamA, teamB, '2026-05-20T12:00:00', 2, 1);
    insertMatch.run(tournamentId, teamB, teamA, '2026-05-20T14:00:00', null, null);
  });

  tx();
}

function initializeDatabase() {
  migrate();
  seedUsers();
  seedDemoData();
}

module.exports = { db, initializeDatabase };


const { db } = require('./database');

function list() {
  return db.prepare(`
    SELECT te.id, te.name, te.tournament_id, t.name AS tournament_name,
           te.leader_user_id, u.name AS leader_name
    FROM teams te
    INNER JOIN tournaments t ON t.id = te.tournament_id
    LEFT JOIN users u ON u.id = te.leader_user_id
    ORDER BY t.date ASC, te.name ASC
  `).all();
}

function create(name, tournamentId, leaderUserId) {
  return db.prepare(`
    INSERT INTO teams (name, tournament_id, leader_user_id)
    VALUES (?, ?, ?)
  `).run(name, tournamentId, leaderUserId);
}

function listForLeader(leaderId) {
  return db.prepare(`
    SELECT te.id, te.name, te.tournament_id, t.name AS tournament_name
    FROM teams te
    INNER JOIN tournaments t ON t.id = te.tournament_id
    WHERE te.leader_user_id = ?
    ORDER BY t.date ASC, te.name ASC
  `).all(leaderId);
}

module.exports = { list, create, listForLeader };


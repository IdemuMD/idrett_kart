const { db } = require('./database');

function listForAdmin() {
  return db.prepare(`
    SELECT p.id, p.name, p.age, p.team_id, te.name AS team_name, p.user_id
    FROM players p
    INNER JOIN teams te ON te.id = p.team_id
    ORDER BY te.name ASC, p.name ASC
  `).all();
}

function create(name, age, teamId) {
  return db.prepare(`
    INSERT INTO players (name, age, team_id)
    VALUES (?, ?, ?)
  `).run(name, age, teamId);
}

module.exports = { listForAdmin, create };


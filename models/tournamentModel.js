const { db } = require('./database');

function list() {
  return db.prepare(`
    SELECT t.id, t.name, t.date,
           COUNT(DISTINCT te.id) AS team_count
    FROM tournaments t
    LEFT JOIN teams te ON te.tournament_id = t.id
    GROUP BY t.id
    ORDER BY t.date ASC, t.id ASC
  `).all();
}

function create(name, date) {
  return db.prepare('INSERT INTO tournaments (name, date) VALUES (?, ?)').run(name, date);
}

module.exports = { list, create };


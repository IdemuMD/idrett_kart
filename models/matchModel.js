const { db } = require('./database');

function list() {
  return db.prepare(`
    SELECT m.id, m.tournament_id, t.name AS tournament_name,
           m.team1_id, te1.name AS team1_name,
           m.team2_id, te2.name AS team2_name,
           m.kickoff, m.score1, m.score2
    FROM matches m
    INNER JOIN tournaments t ON t.id = m.tournament_id
    INNER JOIN teams te1 ON te1.id = m.team1_id
    INNER JOIN teams te2 ON te2.id = m.team2_id
    ORDER BY m.kickoff ASC, m.id ASC
  `).all();
}

function create(tournamentId, team1Id, team2Id, kickoff) {
  return db.prepare(`
    INSERT INTO matches (tournament_id, team1_id, team2_id, kickoff)
    VALUES (?, ?, ?, ?)
  `).run(tournamentId, team1Id, team2Id, kickoff);
}

function updateResult(matchId, score1, score2) {
  db.prepare('UPDATE matches SET score1 = ?, score2 = ? WHERE id = ?')
    .run(score1, score2, matchId);
}

module.exports = { list, create, updateResult };


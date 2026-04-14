const matchModel = require('../models/matchModel');
const teamModel = require('../models/teamModel');

async function create(req, res) {
  const { tournamentId, team1Id, team2Id, kickoff } = req.body || {};

  if (!tournamentId || !team1Id || !team2Id || !kickoff) {
    return res.status(400).json({ error: 'Turnering, lag og tidspunkt er påkrevd.' });
  }

  if (String(team1Id) === String(team2Id)) {
    return res.status(400).json({ error: 'Et lag kan ikke spille mot seg selv.' });
  }

  const [team1, team2] = await Promise.all([
    teamModel.findById(team1Id),
    teamModel.findById(team2Id),
  ]);

  if (!team1 || !team2) {
    return res.status(404).json({ error: 'Ett eller begge lag finnes ikke.' });
  }

  if (String(team1.tournament_id) !== String(tournamentId) || String(team2.tournament_id) !== String(tournamentId)) {
    return res.status(400).json({ error: 'Begge lag må tilhøre valgt turnering.' });
  }

  const match = await matchModel.create(tournamentId, team1Id, team2Id, String(kickoff).trim());

  return res.status(201).json({ id: match._id.toString() });
}

async function updateResult(req, res) {
  const { score1, score2 } = req.body || {};
  const matchId = req.params.id;

  if (Number.isNaN(Number(score1)) || Number.isNaN(Number(score2))) {
    return res.status(400).json({ error: 'Resultat må være heltall.' });
  }

  const match = await matchModel.findById(matchId);
  if (!match) {
    return res.status(404).json({ error: 'Fant ikke kamp.' });
  }

  await matchModel.updateResult(matchId, Number(score1), Number(score2));

  return res.json({ ok: true });
}

module.exports = {
  create,
  updateResult,
};

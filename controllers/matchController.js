const matchModel = require('../models/matchModel');
const teamModel = require('../models/teamModel');
const tournamentModel = require('../models/tournamentModel');

function create(req, res) {
  const { tournamentId, team1Id, team2Id, kickoff } = req.body || {};

  if (!tournamentId || !team1Id || !team2Id || !kickoff) {
    return res.status(400).json({ error: 'Turnering, lag og tidspunkt er påkrevd.' });
  }

  if (Number(team1Id) === Number(team2Id)) {
    return res.status(400).json({ error: 'Et lag kan ikke spille mot seg selv.' });
  }

  const teams = teamModel.list().filter(t => [team1Id, team2Id].includes(t.id));
  if (teams.length !== 2) {
    return res.status(404).json({ error: 'Ett eller begge lag finnes ikke.' });
  }

  const allInTournament = teams.every(team => team.tournament_id == tournamentId);
  if (!allInTournament) {
    return res.status(400).json({ error: 'Begge lag må tilhøre valgt turnering.' });
  }

  const result = matchModel.create(Number(tournamentId), Number(team1Id), Number(team2Id), String(kickoff).trim());

  res.status(201).json({ id: result.lastInsertRowid });
}

function updateResult(req, res) {
  const { score1, score2 } = req.body || {};
  const matchId = Number(req.params.id);

  if (Number.isNaN(Number(score1)) || Number.isNaN(Number(score2))) {
    return res.status(400).json({ error: 'Resultat må være heltall.' });
  }

  const matches = matchModel.list();
  const match = matches.find(m => m.id == matchId);
  if (!match) {
    return res.status(404).json({ error: 'Fant ikke kamp.' });
  }

  matchModel.updateResult(matchId, Number(score1), Number(score2));

  res.json({ ok: true });
}

module.exports = { create, updateResult };


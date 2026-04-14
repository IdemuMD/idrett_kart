const tournamentModel = require('../models/tournamentModel');
const teamModel = require('../models/teamModel');
const matchModel = require('../models/matchModel');

function getPublicDashboard(req, res) {
  res.json({
    tournaments: tournamentModel.list(),
    teams: teamModel.list(),
    matches: matchModel.list(),
  });
}

function listLookups(req, res) {
  const lookups = {
    tournaments: tournamentModel.list(),
    teams: teamModel.list(),
    matches: matchModel.list(),
  };

  if (req.user.role === 'admin') {
    const userModel = require('../models/userModel');
    lookups.leaders = userModel.listLeaders();
  }

  if (req.user.role === 'leader') {
    lookups.myTeams = teamModel.listForLeader(req.user.id);
  }

  res.json(lookups);
}

function createTournament(req, res) {
  const { name, date } = req.body || {};

  if (!name || !date) {
    return res.status(400).json({ error: 'Navn og dato er påkrevd.' });
  }

  const result = tournamentModel.create(String(name).trim(), String(date).trim());

  res.status(201).json({ id: result.lastInsertRowid });
}

module.exports = { getPublicDashboard, listLookups, createTournament };


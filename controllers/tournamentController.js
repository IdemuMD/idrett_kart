const matchModel = require('../models/matchModel');
const teamModel = require('../models/teamModel');
const tournamentModel = require('../models/tournamentModel');
const userModel = require('../models/userModel');

async function getPublicDashboard(req, res) {
  const [tournaments, teams, matches] = await Promise.all([
    tournamentModel.list(),
    teamModel.list(),
    matchModel.list(),
  ]);

  return res.json({
    matches,
    teams,
    tournaments,
  });
}

async function listLookups(req, res) {
  const [tournaments, teams, matches] = await Promise.all([
    tournamentModel.listSimple(),
    teamModel.list(),
    matchModel.list(),
  ]);

  const lookups = {
    matches,
    teams,
    tournaments,
  };

  if (req.user?.role === 'admin') {
    lookups.leaders = await userModel.listLeaders();
  }

  if (req.user?.role === 'leader') {
    lookups.myTeams = await teamModel.listForLeader(req.user.id);
  }

  return res.json(lookups);
}

async function createTournament(req, res) {
  const { name, date } = req.body || {};

  if (!name || !date) {
    return res.status(400).json({ error: 'Navn og dato er påkrevd.' });
  }

  const tournament = await tournamentModel.create(String(name).trim(), String(date).trim());

  return res.status(201).json({ id: tournament._id.toString() });
}

module.exports = {
  createTournament,
  getPublicDashboard,
  listLookups,
};

const matchModel = require('../models/matchModel');
const teamModel = require('../models/teamModel');
const tournamentModel = require('../models/tournamentModel');

async function home(req, res) {
  const [tournaments, teams, matches] = await Promise.all([
    tournamentModel.listSimple(),
    teamModel.list(),
    matchModel.list(),
  ]);

  return res.render('index', {
    matches,
    pageTitle: 'Idrettskart - Turneringssystem',
    success: req.query.success || '',
    teams,
    tournaments,
    error: req.query.error || '',
  });
}

async function loginPage(req, res) {
  return res.render('login', {
    currentUser: req.user,
    error: req.query.error || '',
    pageTitle: 'Logg inn',
    success: req.query.success || '',
  });
}

module.exports = {
  home,
  loginPage,
};

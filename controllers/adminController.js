const playerModel = require('../models/playerModel');
const userModel = require('../models/userModel');
const matchModel = require('../models/matchModel');
const teamModel = require('../models/teamModel');
const tournamentModel = require('../models/tournamentModel');

async function getOverview(req, res) {
  try {
    const [users, players, tournaments, teams, matches] = await Promise.all([
      userModel.listUsers(),
      playerModel.listForAdmin(),
      tournamentModel.list(),
      teamModel.list(),
      matchModel.list(),
    ]);

    const safeDate = (value) => {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? 'Ugyldig dato' : date.toLocaleDateString('nb-NO');
    };

    const safeTime = (value) => {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? 'Ugyldig tid' : date.toLocaleString('nb-NO');
    };

    const viewModel = {
      currentUser: req.user,
      error: req.query.error || '',
      success: req.query.success || '',
      users: Array.isArray(users) ? users : [],
      players: Array.isArray(players) ? players : [],
      teams: Array.isArray(teams) ? teams : [],
      tournaments: Array.isArray(tournaments) ? tournaments : [],
      matches: Array.isArray(matches) ? matches : [],
      recentMatches: (Array.isArray(matches) ? matches : []).slice(0, 5).map((match) => ({
        ...match,
        displayTime: safeTime(match.time),
      })),
      recentPlayers: (Array.isArray(players) ? players : []).slice(0, 5),
      recentTeams: (Array.isArray(teams) ? teams : []).slice(0, 5),
      recentTournaments: (Array.isArray(tournaments) ? tournaments : []).slice(0, 5).map((tournament) => ({
        ...tournament,
        displayDate: safeDate(tournament.date),
      })),
    };

    return res.render('admin', viewModel);
  } catch (error) {
    console.error('Failed to render admin page:', error);
    return res.status(500).render('index', {
      currentUser: req.user,
      error: 'Kunne ikke åpne admin-siden.',
      matches: [],
      pageTitle: 'Serverfeil',
      success: '',
      teams: [],
      tournaments: [],
    });
  }
}

module.exports = {
  getOverview,
};

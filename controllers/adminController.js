const playerModel = require('../models/playerModel');
const userModel = require('../models/userModel');
const matchModel = require('../models/matchModel');
const teamModel = require('../models/teamModel');
const tournamentModel = require('../models/tournamentModel');

const roleOptions = ['participant', 'leader', 'admin'];

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
      roleOptions,
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

async function updateUserRole(req, res) {
  const userId = req.params.id;
  const role = String(req.body?.role || '').trim();

  if (req.user?.id === userId) {
    return res.redirect('/admin?error=' + encodeURIComponent('Du kan ikke endre din egen rolle her.'));
  }

  if (!roleOptions.includes(role)) {
    return res.redirect('/admin?error=' + encodeURIComponent('Ugyldig rolle valgt.'));
  }

  const updatedUser = await userModel.updateRole(userId, role);

  if (!updatedUser) {
    return res.redirect('/admin?error=' + encodeURIComponent('Fant ikke brukeren.'));
  }

  return res.redirect('/admin?success=' + encodeURIComponent(`Rollen til ${updatedUser.name} ble oppdatert til ${updatedUser.role}.`));
}

async function deleteUser(req, res) {
  const userId = req.params.id;

  if (req.user?.id === userId) {
    return res.redirect('/admin?error=' + encodeURIComponent('Du kan ikke slette din egen bruker.'));
  }

  const deletedUser = await userModel.deleteUser(userId);

  if (!deletedUser) {
    return res.redirect('/admin?error=' + encodeURIComponent('Fant ikke brukeren.'));
  }

  return res.redirect('/admin?success=' + encodeURIComponent(`Brukeren ${deletedUser.name} ble slettet.`));
}

module.exports = {
  getOverview,
  deleteUser,
  updateUserRole,
};

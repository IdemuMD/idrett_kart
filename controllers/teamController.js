const teamModel = require('../models/teamModel');
const tournamentModel = require('../models/tournamentModel');

function redirectWithMessage(res, path, message, type = 'error') {
  return res.redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

async function index(req, res) {
  const [teams, tournaments] = await Promise.all([
    teamModel.list(),
    tournamentModel.listSimple(),
  ]);

  return res.render('teams', {
    error: req.query.error || '',
    success: req.query.success || '',
    teams,
    tournaments,
  });
}

async function create(req, res) {
  const { name, tournamentId } = req.body || {};

  if (!name || !tournamentId) {
    return redirectWithMessage(res, '/teams', 'Lagnavn og turnering er påkrevd.');
  }

  const tournamentExists = await tournamentModel.existsById(tournamentId);
  if (!tournamentExists) {
    return redirectWithMessage(res, '/teams', 'Fant ikke turnering.');
  }

  await teamModel.create({
    name: String(name).trim(),
    tournament: tournamentId,
  });

  return redirectWithMessage(res, '/teams', 'Laget ble opprettet.', 'success');
}

async function update(req, res) {
  const { name, tournamentId } = req.body || {};

  if (!name || !tournamentId) {
    return redirectWithMessage(res, '/teams', 'Lagnavn og turnering er påkrevd.');
  }

  await teamModel.update(req.params.id, {
    name: String(name).trim(),
    tournament: tournamentId,
  });

  return redirectWithMessage(res, '/teams', 'Laget ble oppdatert.', 'success');
}

async function remove(req, res) {
  await teamModel.remove(req.params.id);
  return redirectWithMessage(res, '/teams', 'Laget ble slettet.', 'success');
}

module.exports = {
  create,
  index,
  remove,
  update,
};

const playerModel = require('../models/playerModel');
const teamModel = require('../models/teamModel');

function redirectWithMessage(res, path, message, type = 'error') {
  return res.redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

async function index(req, res) {
  const [players, teams] = await Promise.all([
    playerModel.list(),
    teamModel.list(),
  ]);

  return res.render('players', {
    error: req.query.error || '',
    players,
    success: req.query.success || '',
    teams,
  });
}

async function create(req, res) {
  const { name, age, teamId } = req.body || {};

  if (!name || Number.isNaN(Number(age)) || !teamId) {
    return redirectWithMessage(res, '/players', 'Navn, alder og lag er påkrevd.');
  }

  const team = await teamModel.findById(teamId);
  if (!team) {
    return redirectWithMessage(res, '/players', 'Fant ikke lag.');
  }

  await playerModel.create({
    age: Number(age),
    name: String(name).trim(),
    team: teamId,
  });

  return redirectWithMessage(res, '/players', 'Spilleren ble opprettet.', 'success');
}

async function update(req, res) {
  const { name, age, teamId } = req.body || {};

  if (!name || Number.isNaN(Number(age)) || !teamId) {
    return redirectWithMessage(res, '/players', 'Navn, alder og lag er påkrevd.');
  }

  const team = await teamModel.findById(teamId);
  if (!team) {
    return redirectWithMessage(res, '/players', 'Fant ikke lag.');
  }

  await playerModel.update(req.params.id, {
    age: Number(age),
    name: String(name).trim(),
    team: teamId,
  });

  return redirectWithMessage(res, '/players', 'Spilleren ble oppdatert.', 'success');
}

async function remove(req, res) {
  await playerModel.remove(req.params.id);
  return redirectWithMessage(res, '/players', 'Spilleren ble slettet.', 'success');
}

module.exports = {
  create,
  index,
  remove,
  update,
};

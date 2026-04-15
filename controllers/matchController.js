const matchModel = require('../models/matchModel');
const teamModel = require('../models/teamModel');

function redirectWithMessage(res, path, message, type = 'error') {
  return res.redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

async function index(req, res) {
  const [matches, teams] = await Promise.all([
    matchModel.list(),
    teamModel.list(),
  ]);

  return res.render('matches', {
    error: req.query.error || '',
    matches,
    success: req.query.success || '',
    teams,
  });
}

async function create(req, res) {
  const { team1Id, team2Id, time, result } = req.body || {};

  if (!team1Id || !team2Id || !time) {
    return redirectWithMessage(res, '/matches', 'Lag og tidspunkt er påkrevd.');
  }

  if (String(team1Id) === String(team2Id)) {
    return redirectWithMessage(res, '/matches', 'Et lag kan ikke spille mot seg selv.');
  }

  const [team1, team2] = await Promise.all([
    teamModel.findById(team1Id),
    teamModel.findById(team2Id),
  ]);

  if (!team1 || !team2) {
    return redirectWithMessage(res, '/matches', 'Ett eller begge lag finnes ikke.');
  }

  const parsedTime = new Date(String(time));
  if (Number.isNaN(parsedTime.getTime())) {
    return redirectWithMessage(res, '/matches', 'Tidspunktet er ugyldig.');
  }

  await matchModel.create({
    result: String(result || '').trim(),
    team1: team1Id,
    team2: team2Id,
    time: parsedTime,
  });

  return redirectWithMessage(res, '/matches', 'Kampen ble opprettet.', 'success');
}

async function update(req, res) {
  const { team1Id, team2Id, time, result } = req.body || {};

  if (!team1Id || !team2Id || !time) {
    return redirectWithMessage(res, '/matches', 'Lag og tidspunkt er påkrevd.');
  }

  if (String(team1Id) === String(team2Id)) {
    return redirectWithMessage(res, '/matches', 'Et lag kan ikke spille mot seg selv.');
  }

  const parsedTime = new Date(String(time));
  if (Number.isNaN(parsedTime.getTime())) {
    return redirectWithMessage(res, '/matches', 'Tidspunktet er ugyldig.');
  }

  await matchModel.update(req.params.id, {
    result: String(result || '').trim(),
    team1: team1Id,
    team2: team2Id,
    time: parsedTime,
  });

  return redirectWithMessage(res, '/matches', 'Kampen ble oppdatert.', 'success');
}

async function remove(req, res) {
  await matchModel.remove(req.params.id);
  return redirectWithMessage(res, '/matches', 'Kampen ble slettet.', 'success');
}

module.exports = {
  create,
  index,
  remove,
  update,
};

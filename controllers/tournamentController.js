const tournamentModel = require('../models/tournamentModel');
const teamModel = require('../models/teamModel');
const matchModel = require('../models/matchModel');

function redirectWithMessage(res, path, message, type = 'error') {
  return res.redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

async function index(req, res) {
  const tournaments = await tournamentModel.list();
  return res.render('tournaments', {
    error: req.query.error || '',
    success: req.query.success || '',
    tournament: {},
    tournaments,
  });
}

async function createTournament(req, res) {
  const { name, date } = req.body || {};

  if (!name || !date) {
    return redirectWithMessage(res, '/tournaments', 'Navn og dato er påkrevd.');
  }

  const parsedDate = new Date(String(date));
  if (Number.isNaN(parsedDate.getTime())) {
    return redirectWithMessage(res, '/tournaments', 'Datoen er ugyldig.');
  }

  await tournamentModel.create({
    name: String(name).trim(),
    date: parsedDate,
  });

  return redirectWithMessage(res, '/tournaments', 'Turneringen ble opprettet.', 'success');
}

async function updateTournament(req, res) {
  const { name, date } = req.body || {};

  if (!name || !date) {
    return redirectWithMessage(res, '/tournaments', 'Navn og dato er påkrevd.');
  }

  const parsedDate = new Date(String(date));
  if (Number.isNaN(parsedDate.getTime())) {
    return redirectWithMessage(res, '/tournaments', 'Datoen er ugyldig.');
  }

  await tournamentModel.update(req.params.id, {
    name: String(name).trim(),
    date: parsedDate,
  });

  return redirectWithMessage(res, '/tournaments', 'Turneringen ble oppdatert.', 'success');
}

async function deleteTournament(req, res) {
  await tournamentModel.remove(req.params.id);
  return redirectWithMessage(res, '/tournaments', 'Turneringen ble slettet.', 'success');
}

module.exports = {
  createTournament,
  deleteTournament,
  index,
  updateTournament,
};

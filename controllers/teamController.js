const teamModel = require('../models/teamModel');
const tournamentModel = require('../models/tournamentModel');
const userModel = require('../models/userModel');

function redirectWithMessage(res, path, message, type = 'error') {
  return res.redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

async function index(req, res) {
  const [teams, tournaments] = await Promise.all([
    teamModel.list(),
    tournamentModel.listSimple(),
  ]);

  let filteredTeams = teams;
  if (req.user?.role === 'leader') {
    filteredTeams = teams.filter((t) => String(t.contact_leader_id) === String(req.user.id));
  }

  // Send alltid leaders-listen til view. EJS skjuler/viser basert på rolle,
  // men dette hindrer at dropdown blir tom ved avvik i rolle-/locals.
  const leaders = await userModel.listLeaders();

  return res.render('teams', {
    error: req.query.error || '',
    success: req.query.success || '',
    teams: filteredTeams,
    tournaments,
    leaders,
  });
}

async function create(req, res) {
  const { name, tournamentId, contact_leader, contact_phone } = req.body || {};

  if (!name || !tournamentId) {
    return redirectWithMessage(res, '/teams', 'Lagnavn og turnering er påkrevd.');
  }

  const tournamentExists = await tournamentModel.existsById(tournamentId);
  if (!tournamentExists) {
    return redirectWithMessage(res, '/teams', 'Fant ikke turnering.');
  }

  const normalizedContactLeader = contact_leader ? String(contact_leader) : null;
  if (normalizedContactLeader) {
    const leaderUser = await userModel.findById(normalizedContactLeader);
    if (!leaderUser || leaderUser.role !== 'leader') {
      return redirectWithMessage(res, '/teams', 'Kontaktperson må være en lagleder (leader).');
    }
  }

  await teamModel.create({
    name: String(name).trim(),
    tournament: tournamentId,
    contact_leader: normalizedContactLeader,
    contact_phone: contact_phone?.trim() || '',
  });

  return redirectWithMessage(res, '/teams', 'Laget ble opprettet.', 'success');
}

async function createForLeader(req, res) {
  const { name, tournamentId, contact_leader, contact_phone } = req.body || {};

  if (!req.user || req.user.role !== 'leader') {
    return res.redirect('/?error=' + encodeURIComponent('Kun lagledere kan registrere lag.'));
  }

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
    contact_leader: req.user.id, // Self as contact
    contact_phone: contact_phone?.trim() || '',
  });

  return redirectWithMessage(res, '/teams', 'Ditt lag ble opprettet.', 'success');
}

async function update(req, res) {
  const { name, tournamentId, contact_leader, contact_phone } = req.body || {};
  const role = req.user?.role;

  if (role !== 'admin' && role !== 'leader') {
    return redirectWithMessage(res, '/teams', 'Du har ikke tilgang til å oppdatere lag.');
  }

  // Hent eksisterende lag for å kunne oppdatere selektivt (leader kan kun oppdatere telefon).
  const existing = await teamModel.findById(req.params.id);
  if (!existing) {
    return redirectWithMessage(res, '/teams', 'Fant ikke lag.');
  }

  if (role === 'leader' && String(existing.contact_leader_id) !== String(req.user.id)) {
    return redirectWithMessage(res, '/teams', 'Du kan bare oppdatere telefonnummer for ditt eget lag.');
  }

  // Normaliser innkommende felter.
  const normalizedContactPhone = contact_phone?.trim() ?? existing.contact_phone ?? '';

  if (role === 'leader') {
    await teamModel.update(req.params.id, {
      name: existing.name,
      tournament: existing.tournament_id,
      contact_leader: existing.contact_leader_id,
      contact_phone: normalizedContactPhone,
    });

    return redirectWithMessage(res, '/teams', 'Telefonnummer ble oppdatert.', 'success');
  }

  // Admin: full oppdatering.
  if (!name || !tournamentId) {
    return redirectWithMessage(res, '/teams', 'Lagnavn og turnering er påkrevd.');
  }

  const normalizedContactLeader = contact_leader ? String(contact_leader) : null;
  if (normalizedContactLeader) {
    const leaderUser = await userModel.findById(normalizedContactLeader);
    if (!leaderUser || leaderUser.role !== 'leader') {
      return redirectWithMessage(res, '/teams', 'Kontaktperson må være en lagleder (leader).');
    }
  }

  await teamModel.update(req.params.id, {
    name: String(name).trim(),
    tournament: tournamentId,
    contact_leader: normalizedContactLeader,
    contact_phone: contact_phone?.trim() || '',
  });

  return redirectWithMessage(res, '/teams', 'Laget ble oppdatert.', 'success');
}

async function remove(req, res) {
  await teamModel.remove(req.params.id);
  return redirectWithMessage(res, '/teams', 'Laget ble slettet.', 'success');
}

module.exports = {
  create,
  createForLeader,
  index,
  remove,
  update,
};


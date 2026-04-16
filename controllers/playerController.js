const playerModel = require('../models/playerModel');
const teamModel = require('../models/teamModel');

function redirectWithMessage(res, path, message, type = 'error') {
  return res.redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

async function index(req, res) {
  const role = req.user?.role;
  let teams = await teamModel.list();
  let players = [];

  if (role === 'participant') {
    players = await playerModel.findForParticipantByName(req.user.name);
    if (players.length) {
      // Ved eksisterende påmelding trenger vi ikke velge lag på nytt.
      players = players.slice(0, 1);
      teams = [];
    }
  } else if (role === 'leader') {
    const leaderTeamIds = new Set(
      teams
        .filter((t) => String(t.contact_leader_id) === String(req.user.id))
        .map((t) => String(t.id)),
    );

    teams = teams.filter((t) => leaderTeamIds.has(String(t.id)));

    const allPlayers = await playerModel.list();
    players = allPlayers.filter(
      (p) => p.team_id && leaderTeamIds.has(String(p.team_id)),
    );
  } else {
    players = await playerModel.list();
  }

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

async function createForLeader(req, res) {
  const { name, age, teamId } = req.body || {};

  if (!req.user || req.user.role !== 'leader') {
    return res.redirect('/?error=' + encodeURIComponent('Kun lagledere kan legge til spillere.'));
  }

  if (!name || Number.isNaN(Number(age)) || !teamId) {
    return redirectWithMessage(res, '/players', 'Navn, alder og lag er påkrevd.');
  }

  const team = await teamModel.findById(teamId);
  if (!team) {
    return redirectWithMessage(res, '/players', 'Fant ikke lag.');
  }

  if (String(team.contact_leader_id) !== String(req.user.id)) {
    return redirectWithMessage(res, '/players', 'Du kan bare legge til spillere i ditt eget lag.');
  }

  await playerModel.create({
    age: Number(age),
    name: String(name).trim(),
    team: teamId,
  });

  return redirectWithMessage(res, '/players', 'Spilleren ble lagt til.', 'success');
}

async function createForParticipant(req, res) {
  const { age, teamId } = req.body || {};

  if (!req.user || req.user.role !== 'participant') {
    return res.redirect('/?error=' + encodeURIComponent('Kun deltakere kan melde seg på.'));
  }

  const existingPlayers = await playerModel.findForParticipantByName(req.user.name);
  if (existingPlayers.length) {
    const teamName = existingPlayers[0].team_name || 'et lag';
    return redirectWithMessage(res, '/players', `Du er allerede registrert på: ${teamName}.`, 'success');
  }

  if (Number.isNaN(Number(age)) || !teamId) {
    return redirectWithMessage(res, '/players', 'Alder og lag er påkrevd.');
  }

  const team = await teamModel.findById(teamId);
  if (!team) {
    return redirectWithMessage(res, '/players', 'Fant ikke lag.');
  }

  await playerModel.create({
    age: Number(age),
    name: String(req.user.name).trim(),
    team: teamId,
  });

  return redirectWithMessage(res, '/players', 'Du er registrert som deltaker.', 'success');
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
  createForLeader,
  createForParticipant,
  index,
  remove,
  update,
};


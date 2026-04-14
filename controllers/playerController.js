const playerModel = require('../models/playerModel');
const teamModel = require('../models/teamModel');

async function ensureTeamExists(teamId) {
  const team = await teamModel.findById(teamId);
  return team;
}

async function create(req, res) {
  const { name, age, teamId } = req.body || {};

  if (!name || Number.isNaN(Number(age)) || !teamId) {
    return res.status(400).json({ error: 'Navn, alder og lag er påkrevd.' });
  }

  const team = await ensureTeamExists(teamId);
  if (!team) {
    return res.status(404).json({ error: 'Fant ikke lag.' });
  }

  const player = await playerModel.create(
    String(name).trim(),
    Number(age),
    teamId,
  );

  return res.status(201).json({ id: player._id.toString() });
}

async function joinTeam(req, res) {
  const { teamId, age } = req.body || {};
  const safeAge = Number.isNaN(Number(age)) ? req.user.age || 0 : Number(age);

  if (!teamId) {
    return res.status(400).json({ error: 'Du må velge et lag.' });
  }

  const team = await ensureTeamExists(teamId);
  if (!team) {
    return res.status(404).json({ error: 'Fant ikke lag.' });
  }

  if (!safeAge || safeAge < 1) {
    return res.status(400).json({ error: 'Alder må være gyldig.' });
  }

  await playerModel.upsertForParticipant({
    age: safeAge,
    name: req.user.name,
    teamId,
    userId: req.user.id,
  });

  return res.json({ ok: true });
}

module.exports = {
  create,
  joinTeam,
};

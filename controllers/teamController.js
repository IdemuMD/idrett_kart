const teamModel = require('../models/teamModel');
const tournamentModel = require('../models/tournamentModel');

async function validateTournament(tournamentId) {
  const exists = await tournamentModel.existsById(tournamentId);
  return Boolean(exists);
}

async function create(req, res) {
  const { name, tournamentId, leaderUserId } = req.body || {};

  if (!name || !tournamentId) {
    return res.status(400).json({ error: 'Lagnavn og turnering er påkrevd.' });
  }

  const tournamentExists = await validateTournament(tournamentId);
  if (!tournamentExists) {
    return res.status(404).json({ error: 'Fant ikke turnering.' });
  }

  try {
    const team = await teamModel.create(
      String(name).trim(),
      tournamentId,
      leaderUserId ? leaderUserId : null,
    );

    return res.status(201).json({ id: team._id.toString() });
  } catch (error) {
    if (String(error.message).includes('duplicate key')) {
      return res.status(409).json({ error: 'Lagnavnet finnes allerede i denne turneringen.' });
    }

    return res.status(500).json({ error: 'Kunne ikke opprette lag.' });
  }
}

async function createForLeader(req, res) {
  const { name, tournamentId } = req.body || {};

  if (!name || !tournamentId) {
    return res.status(400).json({ error: 'Lagnavn og turnering er påkrevd.' });
  }

  const tournamentExists = await validateTournament(tournamentId);
  if (!tournamentExists) {
    return res.status(404).json({ error: 'Fant ikke turnering.' });
  }

  try {
    const team = await teamModel.create(String(name).trim(), tournamentId, req.user.id);
    return res.status(201).json({ id: team._id.toString() });
  } catch (error) {
    if (String(error.message).includes('duplicate key')) {
      return res.status(409).json({ error: 'Lagnavnet finnes allerede i denne turneringen.' });
    }

    return res.status(500).json({ error: 'Kunne ikke opprette lag.' });
  }
}

module.exports = {
  create,
  createForLeader,
};

const teamModel = require('../models/teamModel');
const tournamentModel = require('../models/tournamentModel');

function create(req, res) {
  const { name, tournamentId, leaderUserId } = req.body || {};

  if (!name || !tournamentId) {
    return res.status(400).json({ error: 'Lagnavn og turnering er påkrevd.' });
  }

  const tournament = tournamentModel.list().find(t => t.id == tournamentId);
  if (!tournament) {
    return res.status(404).json({ error: 'Fant ikke turnering.' });
  }

  try {
    const result = teamModel.create(String(name).trim(), Number(tournamentId), leaderUserId ? Number(leaderUserId) : null);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Lagnavnet finnes allerede i denne turneringen.' });
    }
    return res.status(500).json({ error: 'Kunne ikke opprette lag.' });
  }
}

function createForLeader(req, res) {
  const { name, tournamentId } = req.body || {};

  if (!name || !tournamentId) {
    return res.status(400).json({ error: 'Lagnavn og turnering er påkrevd.' });
  }

  const tournament = tournamentModel.list().find(t => t.id == tournamentId);
  if (!tournament) {
    return res.status(404).json({ error: 'Fant ikke turnering.' });
  }

  try {
    const result = teamModel.create(String(name).trim(), Number(tournamentId), req.user.id);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Lagnavnet finnes allerede i denne turneringen.' });
    }
    return res.status(500).json({ error: 'Kunne ikke opprette lag.' });
  }
}

module.exports = { create, createForLeader };


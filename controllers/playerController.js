const playerModel = require('../models/playerModel');
const teamModel = require('../models/teamModel');

function create(req, res) {
  const { name, age, teamId } = req.body || {};

  if (!name || Number.isNaN(Number(age)) || !teamId) {
    return res.status(400).json({ error: 'Navn, alder og lag er påkrevd.' });
  }

  const team = teamModel.list().find(t => t.id == teamId);
  if (!team) {
    return res.status(404).json({ error: 'Fant ikke lag.' });
  }

  const result = playerModel.create(String(name).trim(), Number(age), Number(teamId));

  res.status(201).json({ id: result.lastInsertRowid });
}

function joinTeam(req, res) {
  const { teamId, age } = req.body || {};
  const safeAge = Number.isNaN(Number(age)) ? req.user.age || 0 : Number(age);

  if (!teamId) {
    return res.status(400).json({ error: 'Du må velge et lag.' });
  }

  const team = teamModel.list().find(t => t.id == teamId);
  if (!team) {
    return res.status(404).json({ error: 'Fant ikke lag.' });
  }

  if (!safeAge || safeAge < 1) {
    return res.status(400).json({ error: 'Alder må være gyldig.' });
  }

  const playerModel = require('../models/playerModel');
  const existing = playerModel.listForAdmin().find(p => p.user_id == req.user.id);

  if (existing) {
    db.prepare('UPDATE players SET team_id = ?, age = ? WHERE user_id = ?')
      .run(Number(teamId), safeAge, req.user.id);
  } else {
    playerModel.create(req.user.name, safeAge, Number(teamId));
  }

  res.json({ ok: true });
}

module.exports = { create, joinTeam };


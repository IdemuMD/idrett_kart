const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

function login(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Brukernavn og passord er påkrevd.' });
  }

  const user = userModel.findByUsername(String(username).trim());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Ugyldig brukernavn eller passord.' });
  }

  req.session.userId = user.id;

  res.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      age: user.age,
    },
  });
}

function logout(req, res) {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
}

function me(req, res) {
  const user = req.user; // from middleware
  res.json({ user });
}

module.exports = { login, logout, me };


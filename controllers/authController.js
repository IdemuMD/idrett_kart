const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

function publicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    age: user.age ?? null,
  };
}

async function login(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Brukernavn og passord er påkrevd.' });
  }

  const user = await userModel.findByUsername(String(username).trim());

  if (!user) {
    return res.status(401).json({ error: 'Ugyldig brukernavn eller passord.' });
  }

  const isPasswordValid = await bcrypt.compare(String(password), user.password_hash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Ugyldig brukernavn eller passord.' });
  }

  req.session.userId = user._id.toString();

  return res.json({
    user: publicUser({
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      role: user.role,
      age: user.age,
    }),
  });
}

async function logout(req, res) {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
}

async function me(req, res) {
  return res.json({ user: publicUser(req.user) });
}

module.exports = {
  login,
  logout,
  me,
};

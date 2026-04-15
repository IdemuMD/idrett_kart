const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

function publicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    role: user.role,
  };
}

async function login(req, res) {
  const { username, name, password } = req.body || {};
  const loginName = String(username || name || '').trim();

  if (!loginName || !password) {
    return res.redirect('/login?error=' + encodeURIComponent('Navn og passord er påkrevd.'));
  }

  const user = await userModel.findByName(loginName);

  if (!user) {
    return res.redirect('/login?error=' + encodeURIComponent('Ugyldig navn eller passord.'));
  }

  const isPasswordValid = await bcrypt.compare(String(password), user.password);
  if (!isPasswordValid) {
    return res.redirect('/login?error=' + encodeURIComponent('Ugyldig navn eller passord.'));
  }

  req.session.userId = user._id.toString();

  return res.redirect('/?success=' + encodeURIComponent(`Velkommen, ${user.name}.`));
}

async function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/?success=' + encodeURIComponent('Du er logget ut.'));
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

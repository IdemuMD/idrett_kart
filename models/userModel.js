const { db } = require('./database');

function findByUsername(username) {
  return db.prepare(`
    SELECT id, name, username, role, age, password_hash
    FROM users WHERE username = ?
  `).get(username);
}

function findById(id) {
  return db.prepare(`
    SELECT id, name, username, role, age
    FROM users WHERE id = ?
  `).get(id);
}

function listUsers() {
  return db.prepare(`
    SELECT id, name, username, role, age, created_at
    FROM users ORDER BY id ASC
  `).all();
}

function listLeaders() {
  return db.prepare(`
    SELECT id, name, username
    FROM users WHERE role = 'leader'
    ORDER BY name ASC
  `).all();
}

module.exports = {
  findByUsername,
  findById,
  listUsers,
  listLeaders,
};


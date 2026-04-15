const { User, toClientDoc } = require('./mongoModels');

async function findByName(name) {
  return User.findOne({ name: String(name).trim() });
}

async function findById(id) {
  return User.findById(id).select('name role created_at updated_at').lean();
}

async function listUsers() {
  const users = await User.find().sort({ created_at: 1, name: 1 }).lean();
  return users.map(toClientDoc);
}

async function listLeaders() {
  const leaders = await User.find({ role: 'leader' }).sort({ name: 1 }).lean();
  return leaders.map(toClientDoc);
}

async function createUser(data) {
  return User.create(data);
}

async function updateRole(id, role) {
  return User.findByIdAndUpdate(
    id,
    { role: String(role).trim() },
    { new: true, runValidators: true },
  ).lean();
}

async function deleteUser(id) {
  return User.findByIdAndDelete(id).lean();
}

module.exports = {
  createUser,
  deleteUser,
  findById,
  findByName,
  listLeaders,
  listUsers,
  updateRole,
};

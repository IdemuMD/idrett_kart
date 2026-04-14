const { User, toClientDoc } = require('./mongoModels');

async function findByUsername(username) {
  return User.findOne({ username }).lean();
}

async function findById(id) {
  return User.findById(id).select('name username role age created_at').lean();
}

async function listUsers() {
  const users = await User.find().sort({ created_at: 1, name: 1 }).lean();
  return users.map(toClientDoc);
}

async function listLeaders() {
  const leaders = await User.find({ role: 'leader' })
    .select('name username role created_at')
    .sort({ name: 1 })
    .lean();

  return leaders.map(toClientDoc);
}

module.exports = {
  findById,
  findByUsername,
  listLeaders,
  listUsers,
};

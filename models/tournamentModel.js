const { Tournament, toClientDoc } = require('./mongoModels');

async function list() {
  const tournaments = await Tournament.find().sort({ date: 1, name: 1 }).lean();
  return tournaments.map(toClientDoc);
}

async function findById(id) {
  const tournament = await Tournament.findById(id).lean();
  return tournament ? toClientDoc(tournament) : null;
}

async function create(data) {
  return Tournament.create(data);
}

async function existsById(id) {
  return Tournament.exists({ _id: id });
}

async function listSimple() {
  const tournaments = await Tournament.find().sort({ date: 1, name: 1 }).lean();
  return tournaments.map(toClientDoc);
}

async function update(id, data) {
  return Tournament.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

async function remove(id) {
  return Tournament.findByIdAndDelete(id);
}

module.exports = {
  create,
  findById,
  existsById,
  list,
  listSimple,
  remove,
  update,
};

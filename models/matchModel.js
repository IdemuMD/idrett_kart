const { Match, toClientDoc } = require('./mongoModels');

function mapMatch(match) {
  const client = toClientDoc(match);
  return {
    ...client,
    team1_id: match.team1?._id?.toString() || match.team1?.toString?.() || client.team1 || null,
    team1_name: match.team1?.name || client.team1_name || '',
    team2_id: match.team2?._id?.toString() || match.team2?.toString?.() || client.team2 || null,
    team2_name: match.team2?.name || client.team2_name || '',
  };
}

async function list() {
  const matches = await Match.find()
    .populate('team1', 'name')
    .populate('team2', 'name')
    .sort({ time: 1, created_at: 1 })
    .lean();

  return matches.map(mapMatch);
}

async function findById(id) {
  const match = await Match.findById(id)
    .populate('team1', 'name')
    .populate('team2', 'name')
    .lean();

  return match ? mapMatch(match) : null;
}

async function create(data) {
  return Match.create(data);
}

async function update(id, data) {
  return Match.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

async function remove(id) {
  return Match.findByIdAndDelete(id);
}

module.exports = {
  create,
  findById,
  list,
  remove,
  update,
};

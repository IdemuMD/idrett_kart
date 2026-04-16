const { Player, toClientDoc } = require('./mongoModels');

function mapPlayer(player) {
  const client = toClientDoc(player);
  return {
    ...client,
    team_id: player.team?._id?.toString() || player.team?.toString?.() || client.team || null,
    team_name: player.team?.name || client.team_name || '',
  };
}

async function listForAdmin() {
  const players = await Player.find()
    .populate('team', 'name')
    .sort({ name: 1 })
    .lean();

  return players.map(mapPlayer);
}

async function list() {
  return listForAdmin();
}

async function findById(id) {
  const player = await Player.findById(id).populate('team', 'name').lean();
  return player ? mapPlayer(player) : null;
}

async function create(data) {
  return Player.create(data);
}

async function update(id, data) {
  return Player.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

async function remove(id) {
  return Player.findByIdAndDelete(id);
}

async function findForParticipantByName(participantName) {
  const name = String(participantName || '').trim();
  if (!name) return [];

  const players = await Player.find({ name })
    .populate('team', 'name')
    .lean();

  return players.map(mapPlayer);
}

module.exports = {
  create,
  findById,
  list,
  listForAdmin,
  findForParticipantByName,
  remove,
  update,
};

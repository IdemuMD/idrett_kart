const { Player, toClientDoc } = require('./mongoModels');

function mapPlayer(player) {
  const client = toClientDoc(player);
  return {
    ...client,
    team_id: player.team_id?._id?.toString() || player.team_id?.toString?.() || client.team_id || null,
    team_name: player.team_id?.name || client.team_name || '',
    user_id: player.user_id?._id?.toString() || player.user_id?.toString?.() || client.user_id || null,
  };
}

async function listForAdmin() {
  const players = await Player.find()
    .populate('team_id', 'name')
    .sort({ name: 1 })
    .lean();

  return players.map(mapPlayer);
}

async function create(name, age, teamId, userId = null) {
  return Player.create({
    name,
    age,
    team_id: teamId,
    user_id: userId || null,
  });
}

async function findByUserId(userId) {
  const player = await Player.findOne({ user_id: userId })
    .populate('team_id', 'name')
    .lean();

  return player ? mapPlayer(player) : null;
}

async function upsertForParticipant({ userId, name, age, teamId }) {
  const existing = await Player.findOne({ user_id: userId });

  if (existing) {
    existing.name = name;
    existing.age = age;
    existing.team_id = teamId;
    await existing.save();
    return existing;
  }

  return Player.create({
    name,
    age,
    team_id: teamId,
    user_id: userId,
  });
}

module.exports = {
  create,
  findByUserId,
  listForAdmin,
  upsertForParticipant,
};

const { Team, toClientDoc } = require('./mongoModels');

function mapTeam(team) {
  const client = toClientDoc(team);
  return {
    ...client,
    tournament_id: team.tournament_id?._id?.toString() || team.tournament_id?.toString?.() || client.tournament_id || null,
    tournament_name: team.tournament_id?.name || client.tournament_name || '',
    leader_user_id: team.leader_user_id?._id?.toString() || team.leader_user_id?.toString?.() || client.leader_user_id || null,
    leader_name: team.leader_user_id?.name || client.leader_name || '',
  };
}

async function list() {
  const teams = await Team.find()
    .populate('tournament_id', 'name date')
    .populate('leader_user_id', 'name username')
    .sort({ name: 1 })
    .lean();

  return teams.map(mapTeam);
}

async function create(name, tournamentId, leaderUserId = null) {
  return Team.create({
    name,
    tournament_id: tournamentId,
    leader_user_id: leaderUserId || null,
  });
}

async function listForLeader(leaderId) {
  const teams = await Team.find({ leader_user_id: leaderId })
    .populate('tournament_id', 'name date')
    .sort({ name: 1 })
    .lean();

  return teams.map(mapTeam);
}

async function existsByTournament(name, tournamentId) {
  return Team.exists({ name, tournament_id: tournamentId });
}

async function findById(id) {
  const team = await Team.findById(id)
    .populate('tournament_id', 'name date')
    .populate('leader_user_id', 'name username')
    .lean();

  return team ? mapTeam(team) : null;
}

async function listForTournament(tournamentId) {
  const teams = await Team.find({ tournament_id: tournamentId })
    .populate('tournament_id', 'name date')
    .populate('leader_user_id', 'name username')
    .sort({ name: 1 })
    .lean();

  return teams.map(mapTeam);
}

module.exports = {
  create,
  existsByTournament,
  findById,
  list,
  listForLeader,
  listForTournament,
};

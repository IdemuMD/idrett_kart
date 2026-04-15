const { Team, toClientDoc } = require('./mongoModels');

function mapTeam(team) {
  const client = toClientDoc(team);
  return {
    ...client,
    tournament_id: team.tournament?._id?.toString() || team.tournament?.toString?.() || client.tournament || null,
    tournament_name: team.tournament?.name || client.tournament_name || '',
  };
}

async function list() {
  const teams = await Team.find()
    .populate('tournament', 'name date')
    .sort({ name: 1 })
    .lean();

  return teams.map(mapTeam);
}

async function listForTournament(tournamentId) {
  const teams = await Team.find({ tournament: tournamentId })
    .populate('tournament', 'name date')
    .sort({ name: 1 })
    .lean();

  return teams.map(mapTeam);
}

async function findById(id) {
  const team = await Team.findById(id).populate('tournament', 'name date').lean();
  return team ? mapTeam(team) : null;
}

async function create(data) {
  return Team.create(data);
}

async function update(id, data) {
  return Team.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

async function remove(id) {
  return Team.findByIdAndDelete(id);
}

module.exports = {
  create,
  findById,
  list,
  listForTournament,
  remove,
  update,
};

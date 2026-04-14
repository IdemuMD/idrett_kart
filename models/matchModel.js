const { Match, toClientDoc } = require('./mongoModels');

function mapMatch(match) {
  const client = toClientDoc(match);
  return {
    ...client,
    tournament_id: match.tournament_id?._id?.toString() || match.tournament_id?.toString?.() || client.tournament_id || null,
    tournament_name: match.tournament_id?.name || client.tournament_name || '',
    team1_id: match.team1_id?._id?.toString() || match.team1_id?.toString?.() || client.team1_id || null,
    team1_name: match.team1_id?.name || client.team1_name || '',
    team2_id: match.team2_id?._id?.toString() || match.team2_id?.toString?.() || client.team2_id || null,
    team2_name: match.team2_id?.name || client.team2_name || '',
  };
}

async function list() {
  const matches = await Match.find()
    .populate('tournament_id', 'name date')
    .populate('team1_id', 'name')
    .populate('team2_id', 'name')
    .sort({ kickoff: 1, created_at: 1 })
    .lean();

  return matches.map(mapMatch);
}

async function create(tournamentId, team1Id, team2Id, kickoff) {
  return Match.create({
    tournament_id: tournamentId,
    team1_id: team1Id,
    team2_id: team2Id,
    kickoff,
  });
}

async function updateResult(matchId, score1, score2) {
  return Match.findByIdAndUpdate(
    matchId,
    {
      score1,
      score2,
    },
    {
      new: true,
    },
  );
}

async function findById(id) {
  const match = await Match.findById(id)
    .populate('tournament_id', 'name date')
    .populate('team1_id', 'name')
    .populate('team2_id', 'name')
    .lean();

  return match ? mapMatch(match) : null;
}

module.exports = {
  create,
  findById,
  list,
  updateResult,
};

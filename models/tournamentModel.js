const { Tournament, toClientDoc } = require('./mongoModels');

async function list() {
  const tournaments = await Tournament.aggregate([
    {
      $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: 'tournament_id',
        as: 'teams',
      },
    },
    {
      $addFields: {
        team_count: { $size: '$teams' },
      },
    },
    {
      $project: {
        teams: 0,
      },
    },
    {
      $sort: {
        date: 1,
        _id: 1,
      },
    },
  ]);

  return tournaments.map((tournament) => ({
    ...toClientDoc(tournament),
    team_count: tournament.team_count || 0,
  }));
}

async function create(name, date) {
  return Tournament.create({ name, date });
}

async function existsById(id) {
  return Tournament.exists({ _id: id });
}

async function listSimple() {
  const tournaments = await Tournament.find().sort({ date: 1, name: 1 }).lean();
  return tournaments.map(toClientDoc);
}

module.exports = {
  create,
  existsById,
  list,
  listSimple,
};

const { connectDatabase } = require('../config/database');
const { Match, Player, Team, Tournament, User } = require('./mongoModels');

async function seedUsers() {
  const seeds = [
    { name: 'admin', role: 'admin', password: 'admin123' },
    { name: 'leader', role: 'leader', password: 'leader123' },
    { name: 'participant', role: 'participant', password: 'participant123' },
  ];

  for (const seed of seeds) {
    const existing = await User.findOne({ name: seed.name });
    if (!existing) {
      await User.create(seed);
    }
  }
}

async function seedDemoData() {
  const tournamentCount = await Tournament.countDocuments();
  if (tournamentCount > 0) {
    return;
  }

  const tournament = await Tournament.create({
    name: 'Varturnering 2026',
    date: new Date('2026-05-20T00:00:00.000Z'),
  });

  const teamA = await Team.create({
    name: 'Trollstien IL',
    tournament: tournament._id,
  });

  const teamB = await Team.create({
    name: 'Fjellby FK',
    tournament: tournament._id,
  });

  await Player.create([
    {
      name: 'Mia Hansen',
      age: 12,
      team: teamA._id,
    },
    {
      name: 'Noah Berg',
      age: 13,
      team: teamA._id,
    },
    {
      name: 'Ella Nilsen',
      age: 12,
      team: teamB._id,
    },
    {
      name: 'Levi Solberg',
      age: 13,
      team: teamB._id,
    },
  ]);

  await Match.create([
    {
      team1: teamA._id,
      team2: teamB._id,
      time: new Date('2026-05-20T12:00:00.000Z'),
      result: '2-1',
    },
    {
      team1: teamB._id,
      team2: teamA._id,
      time: new Date('2026-05-20T14:00:00.000Z'),
      result: '',
    },
  ]);
}

async function initializeDatabase() {
  await connectDatabase();
  await seedUsers();
  await seedDemoData();
}

module.exports = {
  initializeDatabase,
};

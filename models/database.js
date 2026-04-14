const bcrypt = require('bcryptjs');
const { connectMongo } = require('./mongodbConnection');
const { Match, Player, Team, Tournament, User } = require('./mongoModels');

async function seedUsers() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return;
  }

  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedLeaderPassword = await bcrypt.hash('leder123', 10);
  const hashedParticipantPassword = await bcrypt.hash('spiller123', 10);

  await User.create([
    {
      name: 'Turneringsadmin',
      username: 'admin',
      password_hash: hashedAdminPassword,
      role: 'admin',
      age: null,
    },
    {
      name: 'Lagleder Eksempel',
      username: 'lagleder',
      password_hash: hashedLeaderPassword,
      role: 'leader',
      age: null,
    },
    {
      name: 'Spiller Eksempel',
      username: 'deltaker',
      password_hash: hashedParticipantPassword,
      role: 'participant',
      age: 13,
    },
  ]);
}

async function seedDemoData() {
  const tournamentCount = await Tournament.countDocuments();
  if (tournamentCount > 0) {
    return;
  }

  const admin = await User.findOne({ role: 'admin' });
  const leader = await User.findOne({ role: 'leader' });
  const participant = await User.findOne({ role: 'participant' });

  const tournament = await Tournament.create({
    name: 'Vaarturnering 2026',
    date: '2026-05-20',
  });

  const teamA = await Team.create({
    name: 'Trollstien IL',
    tournament_id: tournament._id,
    leader_user_id: leader?._id || null,
  });

  const teamB = await Team.create({
    name: 'Fjellby FK',
    tournament_id: tournament._id,
    leader_user_id: admin?._id || null,
  });

  await Player.create([
    {
      name: 'Mia Hansen',
      age: 12,
      team_id: teamA._id,
      user_id: participant?._id || null,
    },
    {
      name: 'Noah Berg',
      age: 13,
      team_id: teamA._id,
    },
    {
      name: 'Ella Nilsen',
      age: 12,
      team_id: teamB._id,
    },
    {
      name: 'Levi Solberg',
      age: 13,
      team_id: teamB._id,
    },
  ]);

  await Match.create([
    {
      tournament_id: tournament._id,
      team1_id: teamA._id,
      team2_id: teamB._id,
      kickoff: '2026-05-20T12:00:00',
      score1: 2,
      score2: 1,
    },
    {
      tournament_id: tournament._id,
      team1_id: teamB._id,
      team2_id: teamA._id,
      kickoff: '2026-05-20T14:00:00',
      score1: null,
      score2: null,
    },
  ]);
}

async function initializeDatabase() {
  await connectMongo();
  await seedUsers();
  await seedDemoData();
}

module.exports = {
  initializeDatabase,
};

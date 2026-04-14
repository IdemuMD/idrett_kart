const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: false },
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'leader', 'participant'] },
    age: { type: Number, default: null },
  },
  schemaOptions,
);

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: String, required: true },
  },
  schemaOptions,
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tournament_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    leader_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  schemaOptions,
);

teamSchema.index({ name: 1, tournament_id: 1 }, { unique: true });

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1 },
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  schemaOptions,
);

playerSchema.index({ user_id: 1 }, { unique: true, sparse: true });

const matchSchema = new mongoose.Schema(
  {
    tournament_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    team1_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    team2_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    kickoff: { type: String, required: true },
    score1: { type: Number, default: null },
    score2: { type: Number, default: null },
  },
  schemaOptions,
);

matchSchema.index({ kickoff: 1 });

function toClientDoc(document) {
  if (!document) {
    return null;
  }

  const plain = typeof document.toObject === 'function' ? document.toObject() : { ...document };
  const client = {
    ...plain,
    id: plain._id ? plain._id.toString() : plain.id,
  };

  delete client._id;
  delete client.__v;
  return client;
}

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Tournament = mongoose.models.Tournament || mongoose.model('Tournament', tournamentSchema);
const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);
const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);

module.exports = {
  Match,
  Player,
  Team,
  Tournament,
  User,
  toClientDoc,
};

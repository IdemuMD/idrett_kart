const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
  },
  schemaOptions,
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  },
  schemaOptions,
);

teamSchema.index({ name: 1, tournament: 1 }, { unique: true });

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1 },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  },
  schemaOptions,
);

const matchSchema = new mongoose.Schema(
  {
    team1: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    team2: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    time: { type: Date, required: true },
    result: { type: String, default: '' },
  },
  schemaOptions,
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    role: { type: String, required: true, enum: ['admin', 'leader', 'participant'] },
    password: { type: String, required: true },
  },
  schemaOptions,
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (error) {
    return next(error);
  }
});

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

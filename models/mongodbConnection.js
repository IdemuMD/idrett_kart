const mongoose = require('mongoose');

const DEFAULT_MONGO_URI = 'mongodb://idrett:kart123@10.12.2.231:27017/idrett_kart?authSource=idrett_kart';

async function connectMongo() {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB koblet til');
  } catch (error) {
    console.error('MongoDB-tilkobling feilet:', error.message);
    throw error;
  }
}

module.exports = { connectMongo };

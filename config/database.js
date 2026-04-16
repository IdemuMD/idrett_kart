const mongoose = require('mongoose');

const DEFAULT_MONGO_URI = 'mongodb://10.12.2.231:27017/turneringDB';

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: 'turneringDB',
      directConnection: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

module.exports = {
  connectDatabase,
  DEFAULT_MONGO_URI,
};

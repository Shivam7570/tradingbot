const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/trading-bot';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to MongoDB at ' + mongoUri);
  } catch (err) {
    console.warn('⚠️  MongoDB not reached on local port 27017.');
    console.warn('⚠️  Running bot in In-Memory Demo Mode (data active while server runs).');
  }
}

module.exports = connectDB;



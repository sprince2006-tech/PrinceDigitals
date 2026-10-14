const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('💡 No MONGODB_URI set. Launching local in-memory MongoDB instance for development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        isConnected = true;
        console.log(`✅ Development in-memory MongoDB connected: ${memUri}`);

        // Auto-seed sample collections if empty
        const Collection = require('../models/Collection');
        const count = await Collection.countDocuments();
        if (count === 0) {
          const { sampleCollections } = require('../utils/seedData');
          const Product = require('../models/Product');
          for (const colData of sampleCollections) {
            const { products, ...colFields } = colData;
            const createdCol = await Collection.create(colFields);
            for (const prodData of products) {
              await Product.create({ ...prodData, collectionId: createdCol._id });
            }
          }
          console.log('✅ Auto-seeded luxury sample collections into development database!');
        }
        return conn;
      } catch (memErr) {
        console.warn('Could not launch in-memory MongoDB:', memErr.message);
      }
    }
    console.warn('⚠️ MONGODB_URI is not set. Database operations will not function until configured.');
    return null;
  }

  try {
    // Disable query buffering so disconnected queries fail fast instead of hanging requests
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      dbName: process.env.MONGODB_DB_NAME || 'princedigitals',
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('✅ MongoDB connection established');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('✅ MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting reconnection...');
      isConnected = false;
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    // In production, do not crash immediately so health checks can report status
    isConnected = false;
    return null;
  }
};

const disconnectDB = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected cleanly');
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  isDbConnected: () => mongoose.connection && mongoose.connection.readyState === 1,
};

require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

let server;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  server = app.listen(PORT, HOST, () => {
    console.log(`
======================================================
  👑 PRINCE DIGITAL API SERVER
  🚀 Environment: ${process.env.NODE_ENV || 'development'}
  🌐 Listening on: http://${HOST}:${PORT}
  🩺 Health check: http://${HOST}:${PORT}/health
======================================================
    `);
  });
};

// Handle process termination gracefully
const handleShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();

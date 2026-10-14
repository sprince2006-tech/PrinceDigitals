const mongoose = require('mongoose');
const { errorResponse } = require('../utils/response');

/**
 * Middleware: ensureDbConnected
 * Protects API routes from hanging when MongoDB Atlas is disconnecting or reconnecting.
 * Ready states:
 * 0: disconnected
 * 1: connected
 * 2: connecting
 * 3: disconnecting
 */
const ensureDbConnected = async (req, res, next) => {
  const readyState = mongoose.connection ? mongoose.connection.readyState : 0;

  if (readyState === 1) {
    return next();
  }

  // If in the middle of connecting (state 2), give it a short 1.5s window before failing
  if (readyState === 2) {
    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Connection wait timed out'));
        }, 1500);

        const onConnected = () => {
          cleanup();
          resolve();
        };

        const onError = (err) => {
          cleanup();
          reject(err);
        };

        const cleanup = () => {
          clearTimeout(timeout);
          mongoose.connection.removeListener('connected', onConnected);
          mongoose.connection.removeListener('error', onError);
        };

        mongoose.connection.once('connected', onConnected);
        mongoose.connection.once('error', onError);
      });

      return next();
    } catch (_) {
      return errorResponse(
        res,
        'Database connection is initializing. Please retry in a moment.',
        503
      );
    }
  }

  // Database is disconnected (0) or disconnecting (3)
  return errorResponse(
    res,
    'Database is temporarily unavailable. Please retry shortly.',
    503
  );
};

module.exports = { ensureDbConnected };

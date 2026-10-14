const express = require('express');
const router = express.Router();
const {
  startGoogleAuth,
  handleGoogleAuthCallback,
  register,
  loginWithPassword,
  getCurrentSession,
  logout,
} = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

// Google OAuth 2.0 flow
router.get('/google', startGoogleAuth);
router.get('/google/callback', handleGoogleAuthCallback);

// User registration (normal users only)
router.post('/register', authLimiter, register);

// Common login with email/username and password
router.post('/login', authLimiter, loginWithPassword);

// Get current session status
router.get('/me', getCurrentSession);

// Logout
router.post('/logout', logout);

module.exports = router;

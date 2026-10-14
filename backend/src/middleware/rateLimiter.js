const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for authentication attempts (prevents brute-force)
 * 10 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  skipSuccessfulRequests: false,
});

/**
 * General API rate limiter
 * 200 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.',
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};

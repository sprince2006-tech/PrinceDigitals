const {
  verifyToken,
  JWT_COOKIE_NAME,
  JWT_ADMIN_COOKIE_LEGACY,
  getRoleForEmail,
} = require('../services/authService');
const { errorResponse } = require('../utils/response');

/**
 * Helper to extract token from request (cookies or Bearer header)
 */
const extractToken = (req) => {
  if (req.cookies) {
    if (req.cookies[JWT_COOKIE_NAME]) return req.cookies[JWT_COOKIE_NAME];
    if (req.cookies[JWT_ADMIN_COOKIE_LEGACY]) return req.cookies[JWT_ADMIN_COOKIE_LEGACY];
  }

  if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

/**
 * Middleware ensuring incoming request is authenticated (any valid user or admin)
 */
const requireAuth = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return errorResponse(res, 'Authentication required. Please sign in.', 401);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return errorResponse(res, 'Session expired or invalid. Please sign in again.', 401);
  }

  // Double check role securely against current ADMIN_EMAIL
  decoded.role = getRoleForEmail(decoded.email);

  req.user = decoded;
  if (decoded.role === 'admin') {
    req.admin = decoded;
  }

  next();
};

/**
 * Middleware ensuring incoming request is strictly from the authorized Administrator.
 * Normal authenticated users will receive a 403 Forbidden.
 */
const requireAdmin = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return errorResponse(res, 'Unauthorized: Administrator authentication required', 401);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return errorResponse(res, 'Session expired or invalid. Please sign in again.', 401);
  }

  const role = getRoleForEmail(decoded.email);
  if (role !== 'admin') {
    return errorResponse(
      res,
      'Forbidden: You do not have administrator permissions to access this resource.',
      403
    );
  }

  decoded.role = 'admin';
  req.user = decoded;
  req.admin = decoded;

  next();
};

module.exports = {
  extractToken,
  requireAuth,
  requireAdmin,
};

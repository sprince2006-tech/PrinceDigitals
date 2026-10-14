const {
  JWT_COOKIE_NAME,
  JWT_ADMIN_COOKIE_LEGACY,
  getAuthCookieOptions,
  isPasswordAuthEnabled,
  isGoogleAuthEnabled,
  registerUser,
  authenticatePassword,
  getGoogleAuthUrl,
  handleGoogleCallback,
  verifyToken,
} = require('../services/authService');
const { extractToken } = require('../middleware/authMiddleware');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Initiate Google OAuth 2.0 flow
 */
const startGoogleAuth = (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    if (!isGoogleAuthEnabled()) {
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          'Google authentication is not yet configured. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend .env.'
        )}`
      );
    }
    const url = getGoogleAuthUrl();
    return res.redirect(url);
  } catch (error) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(error.message || 'Google Auth Error')}`
    );
  }
};

/**
 * Handle Google OAuth 2.0 callback with secure role-based redirection
 */
const handleGoogleAuthCallback = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const { code, error } = req.query;

  if (error) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent('Google login was cancelled or denied.')}`
    );
  }

  if (!code) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent('No authorization code provided by Google.')}`
    );
  }

  try {
    const { token, role, user } = await handleGoogleCallback(code);

    // Set secure HTTP-only cookie (both new unified and legacy admin cookie for maximum compatibility)
    res.cookie(JWT_COOKIE_NAME, token, getAuthCookieOptions());
    res.cookie(JWT_ADMIN_COOKIE_LEGACY, token, getAuthCookieOptions());

    // Role-based redirection: Admin -> /admin/dashboard, Normal User -> /user/dashboard
    const targetPath = role === 'admin' ? '/admin/dashboard' : '/user/dashboard';

    return res.redirect(
      `${frontendUrl}${targetPath}?auth=success&token=${encodeURIComponent(token)}`
    );
  } catch (err) {
    const errorMessage = err.message || 'Authentication failed. Please try again.';
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMessage)}`);
  }
};

/**
 * Handle user registration (Normal users only)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { token, user } = await registerUser({ name, email, password });

    // Set secure HTTP-only cookies
    res.cookie(JWT_COOKIE_NAME, token, getAuthCookieOptions());
    res.cookie(JWT_ADMIN_COOKIE_LEGACY, token, getAuthCookieOptions());

    return successResponse(
      res,
      {
        token,
        role: 'user',
        user,
      },
      'Registration successful',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Handle email & password login (works for both Admin and Normal Users)
 */
const loginWithPassword = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const identifier = email || username;

    const { token, role, user } = await authenticatePassword(identifier, password);

    // Set secure HTTP-only cookies
    res.cookie(JWT_COOKIE_NAME, token, getAuthCookieOptions());
    res.cookie(JWT_ADMIN_COOKIE_LEGACY, token, getAuthCookieOptions());

    return successResponse(
      res,
      {
        token,
        role,
        user,
        admin: role === 'admin' ? user : null,
      },
      'Authentication successful'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get current session state & available authentication methods
 */
const getCurrentSession = (req, res) => {
  const token = extractToken(req);
  let sessionUser = null;

  if (token) {
    sessionUser = verifyToken(token);
  }

  const isAuthenticated = Boolean(sessionUser);
  const role = sessionUser ? sessionUser.role : null;

  const responseData = {
    authenticated: isAuthenticated,
    role,
    user: sessionUser
      ? {
          id: sessionUser.id,
          name: sessionUser.name,
          email: sessionUser.email,
          role: sessionUser.role,
        }
      : null,
    // Backwards compatibility for existing admin components
    admin: sessionUser && sessionUser.role === 'admin'
      ? {
          username: sessionUser.name || 'Admin',
          email: sessionUser.email,
          role: 'admin',
        }
      : null,
    config: {
      googleAuthEnabled: isGoogleAuthEnabled(),
      passwordAuthEnabled: isPasswordAuthEnabled(),
    },
  };

  return successResponse(res, responseData, 'Session status');
};

/**
 * Logout & clear HTTP-only cookies
 */
const logout = (req, res) => {
  const cookieOptions = getAuthCookieOptions();
  const clearOpts = {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: '/',
  };

  res.clearCookie(JWT_COOKIE_NAME, clearOpts);
  res.clearCookie(JWT_ADMIN_COOKIE_LEGACY, clearOpts);

  return successResponse(res, null, 'Logged out successfully');
};

module.exports = {
  startGoogleAuth,
  handleGoogleAuthCallback,
  register,
  loginWithPassword,
  getCurrentSession,
  logout,
};

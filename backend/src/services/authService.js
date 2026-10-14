require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const User = require('../models/User');

const JWT_COOKIE_NAME = 'prince_auth_token';
const JWT_ADMIN_COOKIE_LEGACY = 'prince_admin_token';
const JWT_EXPIRES_IN = '7d';

/**
 * Get JWT secret with fallback warning in dev
 */
const getJwtSecret = () => {
  return process.env.SESSION_SECRET || 'prince-digital-dev-secret-change-in-production-12345';
};

/**
 * Determine user role based on ADMIN_EMAIL environment variable.
 * Never trust client-provided role.
 */
const getRoleForEmail = (email) => {
  if (!email) return 'user';
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  return email.trim().toLowerCase() === adminEmail ? 'admin' : 'user';
};

/**
 * Sign JWT token for authenticated user or admin
 */
const signToken = (userData = {}) => {
  const email = (userData.email || '').trim().toLowerCase();
  const role = userData.role || getRoleForEmail(email);

  return jwt.sign(
    {
      id: userData.id || userData._id || null,
      email,
      name: userData.name || (role === 'admin' ? 'Prince Admin' : 'Customer'),
      role,
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Backwards-compatible alias
const signAdminToken = (adminData = {}) => {
  return signToken({ ...adminData, role: 'admin' });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded && decoded.email) {
      // Re-verify role against ADMIN_EMAIL in case env changed
      decoded.role = getRoleForEmail(decoded.email);
      return decoded;
    }
    return null;
  } catch (err) {
    return null;
  }
};

/**
 * Verify specifically for admin access
 */
const verifyAdminToken = (token) => {
  const decoded = verifyToken(token);
  if (decoded && decoded.role === 'admin') {
    return decoded;
  }
  return null;
};

/**
 * Get cookie options based on environment
 */
const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');
  const secure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProduction;

  return {
    httpOnly: true,
    secure: secure,
    sameSite: sameSite, // 'none' for cross-domain Vercel frontend <-> Render backend
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
};

/**
 * Check if password auth is enabled
 */
const isPasswordAuthEnabled = () => true;

/**
 * Check if Google OAuth is configured
 */
const isGoogleAuthEnabled = () => {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  );
};

/**
 * Register a new normal user account
 */
const registerUser = async ({ name, email, password }) => {
  if (!name || !name.trim()) {
    throw { status: 400, message: 'Full name is required' };
  }

  if (!email || !email.trim()) {
    throw { status: 400, message: 'Email address is required' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw { status: 400, message: 'Please provide a valid email address' };
  }

  // Prevent users from signing up as administrator
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (adminEmail && normalizedEmail === adminEmail) {
    throw {
      status: 400,
      message: 'This email is reserved for administration. Please use the Sign In option.',
    };
  }

  if (!password || password.length < 6) {
    throw { status: 400, message: 'Password must be at least 6 characters long' };
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw {
      status: 409,
      message: 'An account with this email already exists. Please sign in.',
    };
  }

  // Hash password with bcrypt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    provider: 'local',
  });

  const token = signToken({
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: 'user',
  });

  return {
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: 'user',
    },
  };
};

/**
 * Authenticate with email/username and password
 * Works for both Administrator and Normal Users
 */
const authenticatePassword = async (identifier, password) => {
  if (!identifier || !password) {
    throw {
      status: 400,
      message: 'Email and password are required',
    };
  }

  const inputClean = identifier.trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminUsername = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();

  // 1. Check if identifier belongs to the designated Administrator credentials
  const isMatchAdminEnv =
    (adminEmail && inputClean === adminEmail) ||
    (adminUsername && inputClean === adminUsername) ||
    inputClean === 'helloprincedigitals' ||
    inputClean === 'princeadmin';

  if (isMatchAdminEnv && process.env.ADMIN_PASSWORD_HASH) {
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH.trim());
    if (isMatch) {
      const resolvedEmail = adminEmail || 'helloprincedigitals@gmail.com';
      const token = signToken({
        email: resolvedEmail,
        name: 'Prince Digital Admin',
        role: 'admin',
      });
      return {
        token,
        role: 'admin',
        user: {
          email: resolvedEmail,
          name: 'Prince Digital Admin',
          role: 'admin',
        },
      };
    }
  }

  // 2. Check registered users in MongoDB
  const user = await User.findOne({ email: inputClean }).select('+password');
  if (user && user.password) {
    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      const role = getRoleForEmail(user.email);
      const token = signToken({
        id: user._id,
        email: user.email,
        name: user.name,
        role,
      });

      return {
        token,
        role,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role,
        },
      };
    }
  }

  // 3. Development mode fallback credentials if .env variables are not configured
  if (process.env.NODE_ENV !== 'production') {
    if (inputClean === 'admin' && password === 'PrinceAdmin2026!') {
      const token = signToken({ username: 'admin', email: adminEmail || 'admin@princedigital.com', role: 'admin' });
      return {
        token,
        role: 'admin',
        user: {
          name: 'Admin (Dev)',
          email: adminEmail || 'admin@princedigital.com',
          role: 'admin',
        },
      };
    }
  }

  throw {
    status: 401,
    message: 'Invalid email or password',
  };
};

/**
 * Resolve Google OAuth 2.0 callback URL
 */
const getGoogleCallbackUrl = () => {
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL;
  }
  const backendBase = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
  return `${backendBase}/api/v1/auth/google/callback`;
};

/**
 * Generate Google OAuth 2.0 URL
 */
const getGoogleAuthUrl = () => {
  if (!isGoogleAuthEnabled()) {
    throw {
      status: 403,
      message: 'Google authentication is not configured on this server.',
    };
  }

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: getGoogleCallbackUrl(),
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'select_account',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};

/**
 * Handle Google OAuth callback code exchange & determine role based on ADMIN_EMAIL
 */
const handleGoogleCallback = async (code) => {
  if (!isGoogleAuthEnabled()) {
    throw {
      status: 403,
      message: 'Google authentication is not configured.',
    };
  }

  const redirectUri = getGoogleCallbackUrl();

  // 1. Exchange authorization code for access token
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const tokenValues = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  const tokenRes = await axios.post(tokenUrl, new URLSearchParams(tokenValues).toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const { access_token } = tokenRes.data;

  // 2. Fetch Google user profile
  const userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const { email, name, picture, sub } = userRes.data;
  if (!email) {
    throw { status: 400, message: 'Google account did not provide an email address' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const role = getRoleForEmail(normalizedEmail);

  // 3. Find or create user in MongoDB
  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    user = await User.create({
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      provider: 'google',
      googleId: sub,
      avatarUrl: picture || '',
    });
  } else {
    let updated = false;
    if (!user.googleId && sub) {
      user.googleId = sub;
      updated = true;
    }
    if (picture && !user.avatarUrl) {
      user.avatarUrl = picture;
      updated = true;
    }
    if (updated) {
      await user.save();
    }
  }

  // 4. Issue role-based JWT session token
  const token = signToken({
    id: user._id,
    email: normalizedEmail,
    name: user.name,
    role,
  });

  return {
    token,
    role,
    user: {
      id: user._id,
      email: normalizedEmail,
      name: user.name,
      role,
      avatarUrl: user.avatarUrl,
    },
  };
};

module.exports = {
  JWT_COOKIE_NAME,
  JWT_ADMIN_COOKIE_LEGACY,
  getRoleForEmail,
  signToken,
  signAdminToken,
  verifyToken,
  verifyAdminToken,
  getAuthCookieOptions,
  isPasswordAuthEnabled,
  isGoogleAuthEnabled,
  registerUser,
  authenticatePassword,
  getGoogleAuthUrl,
  handleGoogleCallback,
};

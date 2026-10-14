const { errorResponse } = require('../utils/response');

/**
 * Global Express error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log server errors for monitoring (hide in production client output)
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    const limitMb = process.env.MAX_IMAGE_SIZE_MB || 5;
    return errorResponse(res, `Image file is too large. Maximum allowed size is ${limitMb}MB.`, 400);
  }

  // Multer unexpected field
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return errorResponse(res, 'Unexpected file upload field', 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return errorResponse(res, messages.join('. '), 400);
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, `A record with this ${field} already exists.`, 409);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, `Invalid ID format for ${err.path}`, 400);
  }

  // Custom status code if provided
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal error occurred';

  return errorResponse(
    res,
    message,
    status,
    process.env.NODE_ENV !== 'production' ? err.stack : null
  );
};

module.exports = errorHandler;

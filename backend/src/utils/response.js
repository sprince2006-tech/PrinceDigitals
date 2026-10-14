/**
 * Standard API response helpers for Prince Digital API
 */

const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, details = null) => {
  const payload = {
    success: false,
    message,
  };

  if (details && process.env.NODE_ENV !== 'production') {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse,
};

/**
 * URL validation utility for Prince Digital
 * Ensures only valid HTTP and HTTPS URLs are accepted.
 */

const isValidHttpUrl = (string) => {
  if (!string || typeof string !== 'string') return false;
  
  const trimmed = string.trim();
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const sanitizeUrl = (string) => {
  if (!string || typeof string !== 'string') return '';
  return string.trim();
};

module.exports = {
  isValidHttpUrl,
  sanitizeUrl,
};

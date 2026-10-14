const multer = require('multer');

// Configure in-memory storage so Render disk is never touched
const storage = multer.memoryStorage();

// Allowed MIME types: JPEG, PNG, WebP
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const maxSizeBytes = (parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 5) * 1024 * 1024;

const upload = multer({
  storage,
  limits: {
    fileSize: maxSizeBytes,
    files: 1,
  },
  fileFilter,
});

module.exports = upload;

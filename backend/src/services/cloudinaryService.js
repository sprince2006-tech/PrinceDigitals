const streamifier = require('stream');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Upload an image buffer directly to Cloudinary without writing to local disk.
 *
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {string} folder - Target Cloudinary folder (e.g. 'prince-digital/collections')
 * @param {object} customOptions - Additional Cloudinary upload options
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadImageBuffer = (buffer, folder = 'prince-digital/general', customOptions = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Cloudinary not configured in .env. Using development inline image buffer.');
        const base64 = buffer.toString('base64');
        return resolve({
          secure_url: `data:image/webp;base64,${base64}`,
          public_id: `dev_${Date.now()}`,
          format: 'webp',
          width: 800,
          height: 1000,
        });
      }
      return reject(
        new Error(
          'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Render / server environment.'
        )
      );
    }

    const uploadOptions = {
      folder,
      resource_type: 'image',
      format: 'webp', // Auto-convert to modern WebP for best compression & quality
      quality: 'auto',
      fetch_format: 'auto',
      ...customOptions,
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        return reject(new Error(`Cloudinary upload failed: ${error.message}`));
      }
      resolve({
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      });
    });

    const readable = new streamifier.Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete an asset from Cloudinary by its public ID.
 * Returns { success: boolean, result?: string, error?: string }
 */
const deleteImage = async (publicId) => {
  if (!publicId) return { success: true };
  if (!isCloudinaryConfigured()) {
    console.warn(`[Cloudinary Warning] Cannot delete ${publicId}: Cloudinary is not configured.`);
    return { success: false, error: 'Cloudinary not configured' };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    return { success: result.result === 'ok' || result.result === 'not found', result: result.result };
  } catch (error) {
    console.error(`[Cloudinary Error] Failed to delete asset ${publicId}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Build an optimized transformation URL for responsive/thumbnail display.
 */
const getOptimizedUrl = (url, width = 800) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com')) return url;

  // Insert transformation parameters before /upload/
  return url.replace('/upload/', `/upload/c_limit,w_${width},f_auto,q_auto/`);
};

module.exports = {
  uploadImageBuffer,
  deleteImage,
  getOptimizedUrl,
};

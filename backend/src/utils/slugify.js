const slugifyLib = require('slugify');

/**
 * Generate a clean, lowercase URL-safe slug from a string.
 */
const generateSlug = (text) => {
  if (!text) return '';
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

/**
 * Ensure a slug is unique by appending an incrementing suffix if collision exists in model.
 */
const getUniqueSlug = async (model, baseText, excludeId = null) => {
  const baseSlug = generateSlug(baseText) || 'collection';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await model.findOne(query).select('_id').lean();
    if (!existing) {
      return slug;
    }
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
};

module.exports = {
  generateSlug,
  getUniqueSlug,
};

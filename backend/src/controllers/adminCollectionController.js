const Collection = require('../models/Collection');
const Product = require('../models/Product');
const { getUniqueSlug, generateSlug } = require('../utils/slugify');
const { uploadImageBuffer, deleteImage } = require('../services/cloudinaryService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/v1/admin/dashboard
 * Dashboard stats: Total collections, total published products, draft/unpublished collections, total products
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalCollections, publishedCollections, totalProducts, publishedProducts] = await Promise.all([
      Collection.countDocuments(),
      Collection.countDocuments({ isPublished: true }),
      Product.countDocuments(),
      Product.countDocuments({ isPublished: true }),
    ]);

    const draftCollections = totalCollections - publishedCollections;
    const draftProducts = totalProducts - publishedProducts;

    const recentCollections = await Collection.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title slug coverImageUrl isPublished createdAt');

    return successResponse(res, {
      stats: {
        totalCollections,
        publishedCollections,
        draftCollections,
        totalProducts,
        publishedProducts,
        draftProducts,
      },
      recentCollections,
    }, 'Dashboard statistics retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/collections
 * List all collections (both published and drafts) with product count
 */
const getAllCollections = async (req, res, next) => {
  try {
    const collections = await Collection.aggregate([
      { $sort: { sortOrder: 1, createdAt: -1 } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'collectionId',
          as: 'products',
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          description: 1,
          coverImageUrl: 1,
          isPublished: 1,
          sortOrder: 1,
          createdAt: 1,
          updatedAt: 1,
          productsCount: { $size: '$products' },
        },
      },
    ]);

    return successResponse(res, collections, 'Collections retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/collections/:id
 * Get single collection with its products for management
 */
const getCollectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findById(id);

    if (!collection) {
      return errorResponse(res, 'Collection not found', 404);
    }

    const products = await Product.find({ collectionId: id }).sort({ sortOrder: 1, createdAt: -1 });

    return successResponse(res, {
      collection,
      products,
    }, 'Collection retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/admin/collections
 * Create a new collection (handles multipart/form-data with coverImage, or JSON if already uploaded)
 */
const createCollection = async (req, res, next) => {
  try {
    const { title, description, isPublished } = req.body;

    if (!title || !title.trim()) {
      return errorResponse(res, 'Collection title is required', 400);
    }

    if (!req.file && !req.body.coverImageUrl) {
      return errorResponse(res, 'Cover image is required to create a collection', 400);
    }

    let coverImageUrl = req.body.coverImageUrl;
    let coverImagePublicId = req.body.coverImagePublicId || 'placeholder';

    // If an image file was uploaded via multipart/form-data
    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'prince-digital/collections');
      coverImageUrl = uploadResult.secure_url;
      coverImagePublicId = uploadResult.public_id;
    }

    // Auto-generate unique slug
    const slug = await getUniqueSlug(Collection, title.trim());

    // Determine default sortOrder (place at end)
    const highestSort = await Collection.findOne().sort({ sortOrder: -1 }).select('sortOrder');
    const sortOrder = highestSort ? (highestSort.sortOrder || 0) + 1 : 0;

    const isPublishedBool = isPublished === 'true' || isPublished === true;
    const publishedAt = isPublishedBool ? new Date() : null;

    const newCollection = await Collection.create({
      title: title.trim(),
      slug,
      description: description ? description.trim() : '',
      coverImageUrl,
      coverImagePublicId,
      isPublished: isPublishedBool,
      publishedAt,
      sortOrder,
    });

    return successResponse(res, newCollection, 'Collection created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/collections/:id
 * Update collection title, description, slug, isPublished
 */
const updateCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, slug, isPublished } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) {
      return errorResponse(res, 'Collection not found', 404);
    }

    if (title && title.trim()) {
      collection.title = title.trim();
    }

    if (typeof description !== 'undefined') {
      collection.description = description.trim();
    }

    if (typeof isPublished !== 'undefined') {
      const willPublish = isPublished === 'true' || isPublished === true;
      if (willPublish && !collection.isPublished) {
        // Just published! Set publishedAt to now so it appears first
        collection.publishedAt = new Date();
      } else if (!willPublish) {
        // Unpublished
        collection.publishedAt = null;
      } else if (willPublish && !collection.publishedAt) {
        collection.publishedAt = collection.createdAt || new Date();
      }
      collection.isPublished = willPublish;
    }

    // Explicit slug change requested
    if (slug && slug.trim() && slug.trim() !== collection.slug) {
      const cleanSlug = generateSlug(slug.trim());
      const uniqueSlug = await getUniqueSlug(Collection, cleanSlug, collection._id);
      collection.slug = uniqueSlug;
    }

    await collection.save();

    return successResponse(res, collection, 'Collection updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/admin/collections/:id/cover
 * Upload or replace a collection cover image
 */
const updateCollectionCover = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return errorResponse(res, 'No image file uploaded', 400);
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      return errorResponse(res, 'Collection not found', 404);
    }

    // 1. Upload new image first
    const uploadResult = await uploadImageBuffer(req.file.buffer, 'prince-digital/collections');

    const oldPublicId = collection.coverImagePublicId;

    // 2. Save new image details to MongoDB
    collection.coverImageUrl = uploadResult.secure_url;
    collection.coverImagePublicId = uploadResult.public_id;
    await collection.save();

    // 3. Delete old asset only after successful save
    if (oldPublicId && oldPublicId !== 'placeholder') {
      deleteImage(oldPublicId).catch((err) => {
        console.error('Failed to cleanup old collection cover image:', err);
      });
    }

    return successResponse(res, collection, 'Cover image updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/collections/:id
 * Delete collection and associated products with Cloudinary cleanup
 */
const deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findById(id);

    if (!collection) {
      return errorResponse(res, 'Collection not found', 404);
    }

    // Find all products in this collection
    const products = await Product.find({ collectionId: id });

    // Collect public IDs to clean up
    const assetIdsToDelete = [];
    if (collection.coverImagePublicId && collection.coverImagePublicId !== 'placeholder') {
      assetIdsToDelete.push(collection.coverImagePublicId);
    }
    for (const prod of products) {
      if (prod.imagePublicId && prod.imagePublicId !== 'placeholder') {
        assetIdsToDelete.push(prod.imagePublicId);
      }
    }

    // Delete products and collection from DB
    await Product.deleteMany({ collectionId: id });
    await Collection.findByIdAndDelete(id);

    // Safely cleanup Cloudinary assets in background
    Promise.allSettled(assetIdsToDelete.map((pid) => deleteImage(pid))).then((results) => {
      const failures = results.filter((r) => r.status === 'rejected' || (r.value && !r.value.success));
      if (failures.length > 0) {
        console.warn(`[Cleanup Warning] ${failures.length} Cloudinary assets could not be deleted during collection deletion`);
      }
    });

    return successResponse(res, { deletedCollectionId: id, deletedProductsCount: products.length }, 'Collection and its products deleted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/collections/reorder
 * Reorder collections using an array of collection IDs
 */
const reorderCollections = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return errorResponse(res, 'orderedIds must be an array of collection IDs', 400);
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { sortOrder: index } },
      },
    }));

    if (bulkOps.length > 0) {
      await Collection.bulkWrite(bulkOps);
    }

    return successResponse(res, null, 'Collections reordered successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  updateCollectionCover,
  deleteCollection,
  reorderCollections,
};

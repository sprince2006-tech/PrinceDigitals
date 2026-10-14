const Collection = require('../models/Collection');
const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all published collections with product counts for public catalog
 * GET /api/v1/collections
 */
const getPublishedCollections = async (req, res, next) => {
  try {
    const collections = await Collection.aggregate([
      { $match: { isPublished: true } },
      {
        $addFields: {
          effectivePublishedAt: { $ifNull: ['$publishedAt', '$createdAt'] },
        },
      },
      { $sort: { effectivePublishedAt: -1, createdAt: -1 } },
      {
        $lookup: {
          from: 'products',
          let: { collectionId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$collectionId', '$$collectionId'] },
                    { $eq: ['$isPublished', true] },
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'publishedProducts',
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          description: 1,
          coverImageUrl: 1,
          sortOrder: 1,
          createdAt: 1,
          publishedAt: 1,
          productCount: {
            $ifNull: [{ $arrayElemAt: ['$publishedProducts.count', 0] }, 0],
          },
        },
      },
    ]);

    return successResponse(res, collections, 'Published collections retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single published collection by slug and all its published products
 * GET /api/v1/collections/:slug
 */
const getPublishedCollectionBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const collection = await Collection.findOne({
      slug: slug.toLowerCase(),
      isPublished: true,
    }).select('-coverImagePublicId');

    if (!collection) {
      return errorResponse(res, 'Collection not found or currently unavailable', 404);
    }

    const products = await Product.find({
      collectionId: collection._id,
      isPublished: true,
    })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('-imagePublicId');

    return successResponse(
      res,
      {
        collection,
        products,
      },
      'Collection and products retrieved'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublishedCollections,
  getPublishedCollectionBySlug,
};

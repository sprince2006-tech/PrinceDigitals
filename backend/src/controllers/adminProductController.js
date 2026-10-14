const Product = require('../models/Product');
const Collection = require('../models/Collection');
const { isValidHttpUrl, sanitizeUrl } = require('../utils/urlValidator');
const { uploadImageBuffer, deleteImage } = require('../services/cloudinaryService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/v1/admin/collections/:collectionId/products
 * List all products for a collection (admin view)
 */
const getProductsByCollection = async (req, res, next) => {
  try {
    const { collectionId } = req.params;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return errorResponse(res, 'Collection not found', 404);
    }

    const products = await Product.find({ collectionId }).sort({ sortOrder: 1, createdAt: -1 });

    return successResponse(res, { collection, products }, 'Products retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/admin/collections/:collectionId/products
 * Add a new product to a collection
 */
const createProduct = async (req, res, next) => {
  try {
    const { collectionId } = req.params;
    const { title, description, productUrl, isPublished } = req.body;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return errorResponse(res, 'Collection not found', 404);
    }

    if (!title || !title.trim()) {
      return errorResponse(res, 'Product title is required', 400);
    }

    if (!productUrl || !isValidHttpUrl(productUrl)) {
      return errorResponse(res, 'A valid HTTP or HTTPS product URL is required', 400);
    }

    if (!req.file && !req.body.imageUrl) {
      return errorResponse(res, 'Product image is required', 400);
    }

    let imageUrl = req.body.imageUrl;
    let imagePublicId = req.body.imagePublicId || 'placeholder';

    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'prince-digital/products');
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    // Determine default sortOrder (place at end)
    const highestSort = await Product.findOne({ collectionId }).sort({ sortOrder: -1 }).select('sortOrder');
    const sortOrder = highestSort ? (highestSort.sortOrder || 0) + 1 : 0;

    const newProduct = await Product.create({
      collectionId,
      title: title.trim(),
      description: description ? description.trim() : '',
      productUrl: sanitizeUrl(productUrl),
      imageUrl,
      imagePublicId,
      isPublished: isPublished === 'true' || isPublished === true,
      sortOrder,
    });

    return successResponse(res, newProduct, 'Product created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/products/:id
 * Update product fields (title, description, productUrl, isPublished)
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, productUrl, isPublished } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    if (title && title.trim()) {
      product.title = title.trim();
    }

    if (typeof description !== 'undefined') {
      product.description = description.trim();
    }

    if (productUrl) {
      if (!isValidHttpUrl(productUrl)) {
        return errorResponse(res, 'Invalid product URL. Must be a valid HTTP or HTTPS address', 400);
      }
      product.productUrl = sanitizeUrl(productUrl);
    }

    if (typeof isPublished !== 'undefined') {
      product.isPublished = isPublished === 'true' || isPublished === true;
    }

    await product.save();

    return successResponse(res, product, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/admin/products/:id/image
 * Replace a product image
 */
const updateProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return errorResponse(res, 'No image file uploaded', 400);
    }

    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    // 1. Upload new image first
    const uploadResult = await uploadImageBuffer(req.file.buffer, 'prince-digital/products');

    const oldPublicId = product.imagePublicId;

    // 2. Save new image details to MongoDB
    product.imageUrl = uploadResult.secure_url;
    product.imagePublicId = uploadResult.public_id;
    await product.save();

    // 3. Delete old asset only after successful save
    if (oldPublicId && oldPublicId !== 'placeholder') {
      deleteImage(oldPublicId).catch((err) => {
        console.error('Failed to cleanup old product image:', err);
      });
    }

    return successResponse(res, product, 'Product image updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/products/:id
 * Delete product and clean up Cloudinary asset
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    const publicIdToDelete = product.imagePublicId;

    await Product.findByIdAndDelete(id);

    if (publicIdToDelete && publicIdToDelete !== 'placeholder') {
      deleteImage(publicIdToDelete).catch((err) => {
        console.error('Failed to cleanup product image:', err);
      });
    }

    return successResponse(res, { deletedProductId: id }, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/collections/:collectionId/products/reorder
 * Reorder products inside a collection
 */
const reorderProducts = async (req, res, next) => {
  try {
    const { collectionId } = req.params;
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return errorResponse(res, 'orderedIds must be an array of product IDs', 400);
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, collectionId },
        update: { $set: { sortOrder: index } },
      },
    }));

    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps);
    }

    return successResponse(res, null, 'Products reordered successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProductsByCollection,
  createProduct,
  updateProduct,
  updateProductImage,
  deleteProduct,
  reorderProducts,
};

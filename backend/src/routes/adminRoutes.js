const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  getDashboardStats,
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  updateCollectionCover,
  deleteCollection,
  reorderCollections,
} = require('../controllers/adminCollectionController');

const {
  getProductsByCollection,
  createProduct,
  updateProduct,
  updateProductImage,
  deleteProduct,
  reorderProducts,
} = require('../controllers/adminProductController');

// All admin routes strictly require valid admin authentication
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Collection Management
router.get('/collections', getAllCollections);
router.post('/collections', upload.single('coverImage'), createCollection);
router.patch('/collections/reorder', reorderCollections);
router.get('/collections/:id', getCollectionById);
router.patch('/collections/:id', updateCollection);
router.delete('/collections/:id', deleteCollection);
router.post('/collections/:id/cover', upload.single('coverImage'), updateCollectionCover);

// Product Management inside a Collection
router.get('/collections/:collectionId/products', getProductsByCollection);
router.post('/collections/:collectionId/products', upload.single('productImage'), createProduct);
router.patch('/collections/:collectionId/products/reorder', reorderProducts);

// Direct Product operations
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/image', upload.single('productImage'), updateProductImage);

module.exports = router;

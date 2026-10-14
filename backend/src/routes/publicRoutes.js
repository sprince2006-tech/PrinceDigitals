const express = require('express');
const router = express.Router();
const {
  getPublishedCollections,
  getPublishedCollectionBySlug,
} = require('../controllers/publicController');

// Public catalog endpoints (no authentication required)
router.get('/', getPublishedCollections);
router.get('/:slug', getPublishedCollectionBySlug);

module.exports = router;

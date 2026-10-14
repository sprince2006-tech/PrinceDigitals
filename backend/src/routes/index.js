const express = require('express');
const router = express.Router();

const publicRoutes = require('./publicRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');

// Mount routes
router.use('/collections', publicRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

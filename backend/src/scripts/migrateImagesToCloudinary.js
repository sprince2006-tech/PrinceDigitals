/**
 * Migration Script: Migrate embedded Base64 images in MongoDB to Cloudinary
 * 
 * Safely transfers collection cover images and product images from raw Base64
 * strings into Cloudinary assets, saving the resulting secure_url and public_id
 * in MongoDB. Preserves all collection and product records without resetting them.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const Collection = require('../models/Collection');
const Product = require('../models/Product');

async function migrateImages() {
  if (!isCloudinaryConfigured()) {
    console.error('❌ Cloudinary is not configured. Aborting migration.');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set. Aborting migration.');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB...');
  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB_NAME || 'princedigitals',
  });
  console.log('✅ Connected to MongoDB.');

  // 1. Migrate Collections
  const collections = await Collection.find();
  console.log(`\nFound ${collections.length} collections to inspect.`);

  for (const col of collections) {
    if (col.coverImageUrl && col.coverImageUrl.startsWith('data:image')) {
      console.log(`📤 Uploading cover image for collection "${col.title}" (${col.coverImageUrl.length} bytes)...`);
      try {
        const uploadRes = await cloudinary.uploader.upload(col.coverImageUrl, {
          folder: 'prince-digital/collections',
          resource_type: 'image',
          format: 'webp',
          quality: 'auto',
          fetch_format: 'auto',
        });

        col.coverImageUrl = uploadRes.secure_url;
        col.coverImagePublicId = uploadRes.public_id;
        await col.save();
        console.log(`✅ Collection "${col.title}" updated with Cloudinary URL: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`❌ Failed to migrate collection "${col.title}":`, err.message);
      }
    } else {
      console.log(`ℹ️ Collection "${col.title}" already uses external URL: ${col.coverImageUrl}`);
    }
  }

  // 2. Migrate Products
  const products = await Product.find();
  console.log(`\nFound ${products.length} products to inspect.`);

  for (const prod of products) {
    if (prod.imageUrl && prod.imageUrl.startsWith('data:image')) {
      console.log(`📤 Uploading image for product "${prod.title}" (${prod.imageUrl.length} bytes)...`);
      try {
        const uploadRes = await cloudinary.uploader.upload(prod.imageUrl, {
          folder: 'prince-digital/products',
          resource_type: 'image',
          format: 'webp',
          quality: 'auto',
          fetch_format: 'auto',
        });

        prod.imageUrl = uploadRes.secure_url;
        prod.imagePublicId = uploadRes.public_id;
        await prod.save();
        console.log(`✅ Product "${prod.title}" updated with Cloudinary URL: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`❌ Failed to migrate product "${prod.title}":`, err.message);
      }
    } else {
      console.log(`ℹ️ Product "${prod.title}" already uses external URL: ${prod.imageUrl}`);
    }
  }

  console.log('\n🎉 Image migration complete!');
  await mongoose.disconnect();
  console.log('MongoDB disconnected cleanly.');
}

migrateImages().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});

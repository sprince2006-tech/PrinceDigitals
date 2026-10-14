/**
 * Optional seed utility to populate Prince Digital with realistic luxury fashion collections
 *
 * Usage:
 *   node src/utils/seedData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const Product = require('../models/Product');

const sampleCollections = [
  {
    title: 'Peak Formals',
    slug: 'peak-formals',
    description: 'Bespoke tailoring, Italian wool blazers, and luxury formal attire.',
    coverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    coverImagePublicId: 'sample_peak_formals',
    isPublished: true,
    sortOrder: 0,
    products: [
      {
        title: 'Italian Wool Tailored Blazer',
        description: 'Navy blue structured single-breasted blazer with notch lapels.',
        productUrl: 'https://www.amazon.com/dp/B08XYZ1234',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'sample_blazer',
        isPublished: true,
        sortOrder: 0,
      },
      {
        title: 'Classic Oxford Dress Shirt',
        description: '100% Egyptian cotton crisp white dress shirt with spread collar.',
        productUrl: 'https://www.amazon.com/dp/B08ABC5678',
        imageUrl: 'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'sample_shirt',
        isPublished: true,
        sortOrder: 1,
      },
      {
        title: 'Handmade Silk Jacquard Tie',
        description: 'Burgundy woven silk necktie with understated textured weave.',
        productUrl: 'https://www.amazon.com/dp/B08DEF9012',
        imageUrl: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'sample_tie',
        isPublished: true,
        sortOrder: 2,
      },
    ],
  },
  {
    title: "Men's T-Shirts",
    slug: 'mens-t-shirts',
    description: 'Heavyweight supima cotton basics, relaxed silhouettes, and luxury tees.',
    coverImageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    coverImagePublicId: 'sample_tshirts',
    isPublished: true,
    sortOrder: 1,
    products: [
      {
        title: 'Minimalist Charcoal Crewneck',
        description: '280 GSM heavyweight organic cotton vintage wash tee.',
        productUrl: 'https://www.amazon.com/dp/B08GHI3456',
        imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'sample_charcoal_tee',
        isPublished: true,
        sortOrder: 0,
      },
      {
        title: 'Off-White Boxy Silhouette Tee',
        description: 'Dropped shoulder luxury cut with ribbed collar.',
        productUrl: 'https://www.amazon.com/dp/B08JKL7890',
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'sample_white_tee',
        isPublished: true,
        sortOrder: 1,
      },
    ],
  },
  {
    title: "Men's Pants",
    slug: 'mens-pants',
    description: 'Pleated trousers, structured chinos, and modern tailored pants.',
    coverImageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    coverImagePublicId: 'sample_pants',
    isPublished: true,
    sortOrder: 2,
    products: [
      {
        title: 'Single-Pleat Wide Leg Trousers',
        description: 'Charcoal wool blend trousers with side adjusters.',
        productUrl: 'https://www.amazon.com/dp/B08MNO1234',
        imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
        imagePublicId: 'sample_trouser_1',
        isPublished: true,
        sortOrder: 0,
      },
    ],
  },
  {
    title: 'Casual Wear',
    slug: 'casual-wear',
    description: 'Effortless everyday pieces designed for comfort, luxury, and understated style.',
    coverImageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
    coverImagePublicId: 'sample_casual',
    isPublished: true,
    sortOrder: 3,
    products: [],
  },
  {
    title: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'The latest curated drops and seasonal statements from Prince Digital.',
    coverImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    coverImagePublicId: 'sample_new_arrivals',
    isPublished: true,
    sortOrder: 4,
    products: [],
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || 'princedigitals',
    });
    console.log('Connected! Checking collections...');

    const existingCount = await Collection.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing collections in database.`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      console.log('Skipping seed to preserve existing collections.');
      process.exit(0);
    }

    console.log('Seeding initial collections and products...');
    for (const colData of sampleCollections) {
      const { products, ...colFields } = colData;
      const createdCol = await Collection.create(colFields);

      for (const prodData of products) {
        await Product.create({
          ...prodData,
          collectionId: createdCol._id,
        });
      }
    }

    console.log('✅ Seed completed successfully with 5 collections!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed, sampleCollections };

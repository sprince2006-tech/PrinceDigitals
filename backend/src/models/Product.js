const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: [true, 'Collection ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    productUrl: {
      type: String,
      required: [true, 'External product shopping URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          try {
            const url = new URL(v);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch (_) {
            return false;
          }
        },
        message: 'Product URL must be a valid HTTP or HTTPS address',
      },
    },
    imageUrl: {
      type: String,
      required: [true, 'Product image URL is required'],
      trim: true,
    },
    imagePublicId: {
      type: String,
      required: [true, 'Product image Cloudinary public ID is required'],
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fetching products inside a collection
productSchema.index({ collectionId: 1, isPublished: 1, sortOrder: 1, createdAt: -1 });
productSchema.index({ collectionId: 1, sortOrder: 1 });

module.exports = mongoose.model('Product', productSchema);

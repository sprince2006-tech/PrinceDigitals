const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Collection title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    coverImageUrl: {
      type: String,
      required: [true, 'Cover image URL is required'],
      trim: true,
    },
    coverImagePublicId: {
      type: String,
      required: [true, 'Cover image Cloudinary public ID is required'],
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for public collection listing query (recently published first)
collectionSchema.index({ isPublished: 1, publishedAt: -1, createdAt: -1 });
collectionSchema.index({ isPublished: 1, sortOrder: 1, createdAt: -1 });

// Virtual for products count (useful in admin lists and public summaries)
collectionSchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'collectionId',
  count: true,
});

module.exports = mongoose.model('Collection', collectionSchema);

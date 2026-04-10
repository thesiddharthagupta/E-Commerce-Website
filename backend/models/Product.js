const mongoose = require('mongoose');
const slugify = require('slugify');

const specSchema = new mongoose.Schema({
  key: String,
  value: String
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  sku: { type: String, unique: true, sparse: true },
  stock: { type: Number, default: 0, min: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: String,
  images: [{ url: String, alt: String, isPrimary: Boolean }],
  specifications: [specSchema],
  features: [String],
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  weight: Number,
  dimensions: { length: Number, width: Number, height: Number },
  warranty: String,
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  views: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

productSchema.virtual('discountPercent').get(function() {
  if (this.salePrice && this.price > 0) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

productSchema.set('toJSON', { virtuals: true });

productSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text', 
  tags: 'text',
  shortDescription: 'text'
}, {
  weights: {
    name: 10,
    brand: 5,
    tags: 3,
    shortDescription: 2,
    description: 1
  },
  name: 'ProductTextSearchIndex'
});

module.exports = mongoose.model('Product', productSchema);

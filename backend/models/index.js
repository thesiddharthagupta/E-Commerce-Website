const mongoose = require('mongoose');

// ── Category ─────────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  description: String,
  image:       String,
  icon:        String,   // FIX B07: was missing — seed inserts this field
  parent:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });
exports.Category = mongoose.model('Category', categorySchema);

// ── Review ────────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  title:      String,
  comment:    { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  helpful:    { type: Number, default: 0 },
}, { timestamps: true });
exports.Review = mongoose.model('Review', reviewSchema);

// ── Order ─────────────────────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:     String,
  image:    String,
  price:    Number,
  quantity: { type: Number, default: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail:      String,
  items:           [orderItemSchema],
  shippingAddress: {
    name: String, street: String, city: String,
    state: String, zip: String, country: String, phone: String
  },
  paymentMethod:  { type: String, enum: ['cash', 'card', 'esewa', 'khalti'], default: 'cash' },
  paymentStatus:  { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus:    { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  subtotal:       Number,
  shippingFee:    { type: Number, default: 0 },
  discount:       { type: Number, default: 0 },
  total:          Number,
  notes:          String,
  trackingNumber: String,
}, { timestamps: true });
exports.Order = mongoose.model('Order', orderSchema);

// ── Offer / Coupon ────────────────────────────────────────────────────────────
const offerSchema = new mongoose.Schema({
  title:                 { type: String, required: true },
  code:                  { type: String, required: true, unique: true, uppercase: true },
  type:                  { type: String, enum: ['percentage', 'fixed'], required: true },
  value:                 { type: Number, required: true },
  minPurchase:           { type: Number, default: 0 },
  maxDiscount:           Number,
  usageLimit:            Number,
  usedCount:             { type: Number, default: 0 },
  startDate:             Date,
  endDate:               Date,
  isActive:              { type: Boolean, default: true },
  applicableProducts:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
}, { timestamps: true });
exports.Offer = mongoose.model('Offer', offerSchema);

// ── Newsletter ────────────────────────────────────────────────────────────────
const newsletterSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true },
  isActive:     { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
}, { timestamps: true });
exports.Newsletter = mongoose.model('Newsletter', newsletterSchema);

// ── Notice / Announcement ─────────────────────────────────────────────────────
const noticeSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  content:         { type: String, required: true },
  type:            { type: String, enum: ['info', 'warning', 'success', 'promo'], default: 'info' },
  isActive:        { type: Boolean, default: true },
  showOnHomepage:  { type: Boolean, default: false },
  startDate:       Date,
  endDate:         Date,
}, { timestamps: true });
exports.Notice = mongoose.model('Notice', noticeSchema);

// ── Contact Message ───────────────────────────────────────────────────────────
const messageSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true },
  phone:      String,
  subject:    String,
  message:    { type: String, required: true },
  isRead:     { type: Boolean, default: false },
  isReplied:  { type: Boolean, default: false },
  reply:      String,
  repliedAt:  Date,
}, { timestamps: true });
exports.Message = mongoose.model('Message', messageSchema);

// ── Static Page ───────────────────────────────────────────────────────────────
const pageSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  slug:            { type: String, required: true, unique: true },
  content:         { type: String, required: true },
  metaTitle:       String,
  metaDescription: String,
  isPublished:     { type: Boolean, default: true },
  showInFooter:    { type: Boolean, default: false },
  showInNav:       { type: Boolean, default: false },
}, { timestamps: true });
exports.Page = mongoose.model('Page', pageSchema);

// ── Site Settings ─────────────────────────────────────────────────────────────
const settingsSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  group: { type: String, default: 'general' },
  label: String,
  type:  { type: String, enum: ['text', 'number', 'boolean', 'image', 'json'], default: 'text' },
}, { timestamps: true });
exports.Settings = mongoose.model('Settings', settingsSchema);

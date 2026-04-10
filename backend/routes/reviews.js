const express = require('express');
const router = express.Router();
const { Review } = require('../models/index');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar').sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// All reviews (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'name email').populate('product', 'name').sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Add review
router.post('/', protect, async (req, res) => {
  try {
    const { product, rating, title, comment } = req.body;
    const existing = await Review.findOne({ product, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    const review = await Review.create({ product, user: req.user._id, rating, title, comment });
    // Update product rating
    const reviews = await Review.find({ product, isApproved: true });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(product, { 'ratings.average': avg.toFixed(1), 'ratings.count': reviews.length });
    res.status(201).json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Approve/reject review (admin)
router.patch('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    review.isApproved = !review.isApproved;
    await review.save();
    res.json({ success: true, isApproved: review.isApproved });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

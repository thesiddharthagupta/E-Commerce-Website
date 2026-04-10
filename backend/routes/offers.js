const express = require('express');
const router = express.Router();
const { Offer } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const offers = await Offer.find().sort('-createdAt');
    res.json({ success: true, offers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true });
    if (!offer) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    const now = new Date();
    if (offer.startDate && now < offer.startDate) return res.status(400).json({ success: false, message: 'Coupon not yet active' });
    if (offer.endDate && now > offer.endDate) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (offer.usageLimit && offer.usedCount >= offer.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (cartTotal < offer.minPurchase) return res.status(400).json({ success: false, message: `Minimum purchase Rs. ${offer.minPurchase} required` });
    let discount = offer.type === 'percentage' ? (cartTotal * offer.value) / 100 : offer.value;
    if (offer.maxDiscount) discount = Math.min(discount, offer.maxDiscount);
    res.json({ success: true, discount: Math.round(discount), offer: { title: offer.title, code: offer.code, type: offer.type, value: offer.value } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, offer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, offer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Offer deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

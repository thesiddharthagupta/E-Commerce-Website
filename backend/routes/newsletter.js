const express = require('express');
const router = express.Router();
const { Newsletter } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (!existing.isActive) { existing.isActive = true; await existing.save(); }
      return res.json({ success: true, message: 'Already subscribed!' });
    }
    await Newsletter.create({ email });
    res.status(201).json({ success: true, message: 'Subscribed successfully!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/unsubscribe', async (req, res) => {
  try {
    await Newsletter.findOneAndUpdate({ email: req.body.email }, { isActive: false });
    res.json({ success: true, message: 'Unsubscribed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).sort('-subscribedAt');
    res.json({ success: true, subscribers, count: subscribers.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

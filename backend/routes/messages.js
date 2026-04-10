const express = require('express');
const router = express.Router();
const { Message } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const msg = await Message.create({ name, email, phone, subject, message });
    res.status(201).json({ success: true, message: 'Message sent successfully!', data: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find().sort('-createdAt');
    res.json({ success: true, messages });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/:id/read', protect, adminOnly, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ success: true, message: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id,
      { reply: req.body.reply, isReplied: true, repliedAt: new Date(), isRead: true }, { new: true });
    res.json({ success: true, message: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

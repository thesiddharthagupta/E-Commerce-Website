// routes/categories.js
const express = require('express');
const router = express.Router();
const { Category } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true }).sort('sortOrder name');
    res.json({ success: true, categories: cats });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, parent, sortOrder } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const cat = await Category.create({ name, slug, description, parent, sortOrder });
    res.status(201).json({ success: true, category: cat });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, category: cat });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Category removed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Settings } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const settings = await Settings.find();
    const obj = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    res.json({ success: true, settings: obj });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
    }
    res.json({ success: true, message: 'Settings saved' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

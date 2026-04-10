const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Cart is managed client-side (localStorage) for speed.
// This endpoint validates products & calculates totals server-side.
router.post('/validate', async (req, res) => {
  try {
    const { items } = req.body; // [{product: id, quantity: n}]
    const validated = [];
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product).populate('category', 'name');
      if (!product || !product.isActive) continue;
      const price = product.salePrice || product.price;
      const qty = Math.min(item.quantity, product.stock);
      subtotal += price * qty;
      validated.push({
        product: product._id, name: product.name,
        image: product.images?.[0]?.url || '',
        price, originalPrice: product.price,
        salePrice: product.salePrice, quantity: qty,
        stock: product.stock, slug: product.slug
      });
    }
    const shippingFee = subtotal > 5000 ? 0 : 150;
    res.json({ success: true, items: validated, subtotal, shippingFee, total: subtotal + shippingFee });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

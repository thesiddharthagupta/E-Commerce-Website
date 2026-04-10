const express = require('express');
const router = express.Router();
const { Order } = require('../models/index');
const Product = require('../models/Product');
const { protect, adminOnly, softProtect } = require('../middleware/auth');
const authRouter = require('./auth');

// POST /api/orders — FIX B04: use softProtect so req.user is set for logged-in users
router.post('/', softProtect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, guestEmail, notes, discount } = req.body;
    if (!items || !items.length) return res.status(400).json({ success: false, message: 'Order must have items' });
    if (!shippingAddress?.name || !shippingAddress?.street || !shippingAddress?.city) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }
    if (!req.user && !guestEmail) {
      return res.status(400).json({ success: false, message: 'Guest email is required for guest orders' });
    }

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      const price = product.salePrice || product.price;
      subtotal += price * item.quantity;
      orderItems.push({ product: product._id, name: product.name, image: product.images[0]?.url || '', price, quantity: item.quantity });
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity, soldCount: item.quantity } });
    }

    const shippingFee = subtotal > 5000 ? 0 : 150;
    const discountAmt = discount || 0;
    const total = subtotal + shippingFee - discountAmt;

    const order = await Order.create({
      user: req.user?._id || null,
      guestEmail: req.user ? null : guestEmail,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash',
      subtotal, shippingFee, discount: discountAmt, total, notes
    });

    // Send confirmation email notification
    authRouter.sendOrderNotification(order, req.user);

    res.status(201).json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/orders/my — user's own orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/orders — admin: all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};
    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
      Order.countDocuments(query)
    ]);
    res.json({ success: true, orders, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    // Non-admin can only see their own
    if (req.user.role !== 'admin' && order.user?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/orders/:id/status — admin only
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.status, trackingNumber: req.body.trackingNumber },
      { new: true }
    ).populate('user', 'name email');

    // Notify customer of status change
    if (order && ['shipped', 'delivered', 'cancelled'].includes(req.body.status)) {
      const statusLabels = { shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
      authRouter.sendOrderNotification(
        { ...order.toObject(), _id: order._id },
        order.user ? { email: order.user.email, name: order.user.name } : null
      );
    }

    res.json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

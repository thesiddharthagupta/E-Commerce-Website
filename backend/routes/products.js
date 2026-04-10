const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/upload');

// @GET /api/products — public, with filtering/pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, brand, minPrice, maxPrice, search, sort, featured, isNewArrival, inStock } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (featured) query.isFeatured = true;
    if (isNewArrival) query.isNewArrival = true;
    if (inStock) query.stock = { $gt: 0 };
    if (minPrice || maxPrice) {
      query.$or = [
        { salePrice: { $gte: Number(minPrice) || 0, $lte: Number(maxPrice) || Infinity } },
        { price: { $gte: Number(minPrice) || 0, $lte: Number(maxPrice) || Infinity } }
      ];
    }
    if (search) {
      query.$text = { $search: search };
    }
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      popular: { soldCount: -1 },
      rating: { 'ratings.average': -1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).populate('category', 'name slug').sort(sortBy).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);
    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true }).populate('category', 'name slug').limit(8);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/products/:id — by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.id }
      : { slug: req.params.id };
    const product = await Product.findOne({ ...query, isActive: true }).populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/products — admin only
router.post('/', protect, adminOnly, uploadProduct.array('images', 6), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files && req.files.length > 0) {
      data.images = req.files.map((f, i) => ({
        url: `/uploads/products/${f.filename}`,
        alt: data.name,
        isPrimary: i === 0
      }));
    }
    if (data.specifications && typeof data.specifications === 'string') {
      data.specifications = JSON.parse(data.specifications);
    }
    if (data.features && typeof data.features === 'string') {
      data.features = JSON.parse(data.features);
    }
    if (data.tags && typeof data.tags === 'string') {
      data.tags = JSON.parse(data.tags);
    }
    const product = await Product.create(data);
    await product.populate('category', 'name slug');
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/products/:id — admin only
router.put('/:id', protect, adminOnly, uploadProduct.array('images', 6), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f, i) => ({
        url: `/uploads/products/${f.filename}`,
        alt: data.name,
        isPrimary: i === 0
      }));
      data.images = newImages;
    }
    if (data.specifications && typeof data.specifications === 'string') {
      data.specifications = JSON.parse(data.specifications);
    }
    if (data.features && typeof data.features === 'string') {
      data.features = JSON.parse(data.features);
    }
    if (data.tags && typeof data.tags === 'string') {
      data.tags = JSON.parse(data.tags);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/products/:id — admin only (soft delete)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/products/:id/hard — permanent delete (admin only)
router.delete('/:id/hard', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PATCH /api/products/:id/feature — toggle featured
router.patch('/:id/feature', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.isFeatured = !product.isFeatured;
    await product.save();
    res.json({ success: true, isFeatured: product.isFeatured });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PATCH /api/products/:id/stock — update stock
router.patch('/:id/stock', protect, adminOnly, async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    res.json({ success: true, stock: product.stock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

// @GET /api/products/by-catname/:name — resolve name to category
router.get('/by-catname/:name', async (req, res) => {
  try {
    const { Category } = require('../models/index');
    const cat = await Category.findOne({ name: new RegExp('^' + req.params.name + '$', 'i') });
    if (!cat) return res.json({ success: true, products: [], total: 0, pages: 0 });
    const products = await Product.find({ category: cat._id, isActive: true }).populate('category','name slug').limit(50);
    res.json({ success: true, products, total: products.length, pages: 1 });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const getSecret = () => process.env.JWT_SECRET || 'techmart_fallback_secret_2024';

// Full protection — rejects request if no valid token
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, getSecret());
    const user = await User.collection.findOne({ _id: new mongoose.Types.ObjectId(decoded.id) });
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// FIX B04: Soft protection — sets req.user if token present, but does NOT reject if absent
// Use for routes that support both authenticated and guest users (e.g. order creation)
exports.softProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(); // No token — guest, continue

  try {
    const decoded = jwt.verify(token, getSecret());
    const user = await User.collection.findOne({ _id: new mongoose.Types.ObjectId(decoded.id) });
    if (user && user.isActive) {
      req.user = { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive };
    }
  } catch (err) {
    // Invalid token — treat as guest, don't block
    console.warn('softProtect: token invalid, treating as guest');
  }
  next();
};

// Admin-only guard — must be used after protect
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

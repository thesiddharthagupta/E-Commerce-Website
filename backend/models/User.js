const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// NOTE: We intentionally do NOT use Mongoose's pre-save hook for password hashing
// because all auth routes use User.collection (raw driver) for consistency.
// Password hashing is handled explicitly in each route (bcrypt.hash).
// The matchPassword method is kept for convenience but should not be relied upon
// when the password field is not loaded (select: false).

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  phone: String,
  address: {
    street: String, city: String, state: String, zip: String, country: String
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: false },       // FIX B03: default false until email verified
  emailVerified: { type: Boolean, default: false },
  emailOTP: { type: String, select: false },
  emailOTPExpiry: { type: Date, select: false },
  
  // Security & 2FA
  twoFactorEnabled: { type: Boolean, default: true }, 
  loginOTP: { type: String, select: false },
  loginOTPExpiry: { type: Date, select: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },

  avatar: String,
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },
  deletedAt: Date,
}, { timestamps: true });

// Convenience method — only works if password field is explicitly selected
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

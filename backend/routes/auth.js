const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { authLimiter, loginLimiter } = require('../middleware/rateLimit');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.array().length) return next();
  return res.status(400).json({ success: false, message: errors.array()[0].msg });
};

// ─── Email transporter ────────────────────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

const sendMail = async (to, subject, html) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  let transporter;

  // AUTO-BRIDGE: If placeholders are used, use Ethereal (Zero-Config Test Mail)
  if (!user || !pass || user.includes('your_email') || pass.includes('your_app_password')) {
    try {
      // Create a test account on-the-fly (Ethereal)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      
      const info = await transporter.sendMail({
        from: '"TechMart Premium Support" <support@techmart.com>',
        to, subject, html,
      });

      console.log('------------------------------------------------------------');
      console.log('✉️  ETHEREAL VIRTUAL MAILBOX (ZERO-CONFIG)');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log('------------------------------------------------------------');
      return;
    } catch (err) {
      console.error('Ethereal fallback failed, using console log instead:', err.message);
      console.log('📧 DEV MAIL BYPASS (Console Only):', { to, subject, html: html.replace(/<[^>]*>?/gm, '') });
      return;
    }
  }

  transporter = createTransporter();
  await transporter.sendMail({
    from: `"TechMart Nepal" <${user}>`,
    to, subject, html,
  });
};

// ─── Token helpers ────────────────────────────────────────────────────────────
const signToken = (id) => {
  const secret = process.env.JWT_SECRET || 'techmart_fallback_secret_2024';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── OTP email template ───────────────────────────────────────────────────────
const otpEmailHtml = (otp, name) => `
<div style="background-color:#f9fafb; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width:500px; margin:0 auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
    <div style="background-color:#111827; padding:24px; text-align:center;">
      <h1 style="color:#ffffff; margin:0; font-size:24px; letter-spacing:1px; font-weight:800;">TECHMART</h1>
    </div>
    <div style="padding:40px 32px; border-top: 4px solid #1d8dac;">
      <h2 style="color:#111827; font-size:20px; font-weight:700; margin-top:0;">Secure Login Code</h2>
      <p style="color:#4b5563; font-size:16px; line-height:24px;">Hi <strong>${name}</strong>,</p>
      <p style="color:#4b5563; font-size:15px; line-height:24px;">Someone (hopefully you!) requested a secure login code for your TechMart account. Use the code below to complete the verification:</p>
      
      <div style="text-align:center; margin:36px 0;">
        <div style="display:inline-block; background-color:#f3f4f6; padding:16px 32px; border-radius:8px; border:1px solid #e5e7eb;">
          <span style="font-size:36px; font-weight:800; letter-spacing:8px; color:#1d8dac; font-family:monospace;">${otp}</span>
        </div>
      </div>
      
      <p style="color:#6b7280; font-size:13px; line-height:20px;">This one-time password (OTP) is valid for <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
      
      <div style="margin-top:40px; padding-top:20px; border-top:1px solid #e5e7eb; text-align:center;">
        <p style="color:#9ca3af; font-size:12px; margin:0;">&copy; 2024 TechMart Nepal. Kathmandu, Nepal.</p>
      </div>
    </div>
  </div>
</div>`;

// ─── Order notification email ──────────────────────────────────────────────────
const orderEmailHtml = (order, name) => `
<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#f3f4f6;border-radius:16px;">
  <div style="background:#1d8dac;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:20px;">Order Confirmed!</h1>
    <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:6px 0 0;">Order #${order._id?.toString().slice(-8).toUpperCase() || 'N/A'}</p>
  </div>
  <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;">
    <p style="color:#374151;">Hi <strong>${name}</strong>, thank you for your order!</p>
    <p style="color:#6b7280;font-size:14px;">Total: <strong>Rs. ${order.total?.toLocaleString()}</strong> &bull; Payment: <strong>${order.paymentMethod?.toUpperCase()}</strong></p>
    <p style="color:#9ca3af;font-size:13px;margin-top:24px;">We will notify you when your order is shipped. Track your order by logging into your account.</p>
  </div>
</div>`;

// ─── Reset password email ──────────────────────────────────────────────────────
const resetEmailHtml = (link, name) => `
<div style="background-color:#f9fafb; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width:500px; margin:0 auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
    <div style="background-color:#111827; padding:24px; text-align:center;">
      <h1 style="color:#ffffff; margin:0; font-size:24px; letter-spacing:1px; font-weight:800;">TECHMART</h1>
    </div>
    <div style="padding:40px 32px; border-top: 4px solid #ef4444;">
      <h2 style="color:#111827; font-size:20px; font-weight:700; margin-top:0;">Reset Your Password</h2>
      <p style="color:#4b5563; font-size:16px; line-height:24px;">Hi <strong>${name}</strong>,</p>
      <p style="color:#4b5563; font-size:15px; line-height:24px;">We received a request to reset the password for your TechMart account. Click the secure button below to choose a new one:</p>
      
      <div style="text-align:center; margin:36px 0;">
        <a href="${link}" style="display:inline-block; background-color:#1d8dac; color:#ffffff; padding:16px 32px; border-radius:8px; text-decoration:none; font-weight:700; font-size:16px; box-shadow: 0 4px 6px rgba(29,141,172,0.25);">RESET PASSWORD</a>
      </div>
      
      <p style="color:#6b7280; font-size:13px; line-height:20px;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p style="color:#1d8dac; font-size:12px; word-break:break-all;">${link}</p>
      
      <p style="color:#9ca3af; font-size:12px; margin-top:40px; padding-top:20px; border-top:1px solid #e5e7eb; text-align:center;">&copy; 2024 TechMart Nepal. If you didn't request this, you can safely ignore this email.</p>
    </div>
  </div>
</div>`;

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', authLimiter, [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please provide a valid email').toLowerCase(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
], async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const exists = await User.collection.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 8);

    await User.collection.insertOne({
      name, email: email.toLowerCase(), password: hashed, phone: phone || '',
      role: 'customer',
      isActive: false,          // FIX B03: inactive until email verified
      emailVerified: false,
      emailOTP: otpHash,
      emailOTPExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      wishlist: [], createdAt: new Date(), updatedAt: new Date()
    });

    // Send OTP email
    try {
      await sendMail(email, 'Verify your TechMart account', otpEmailHtml(otp, name));
    } catch (mailErr) {
      console.error('OTP email error:', mailErr.message);
      // Delete the unverified user so they can try again once SMTP is fixed
      await User.collection.deleteOne({ email: email.toLowerCase() });
      return res.status(500).json({ success: false, message: `Account creation failed: Could not send verification email. Please check server SMTP settings. Error: ${mailErr.message}` });
    }

    res.status(201).json({ success: true, message: 'Account created. Please check your email for the verification code.', email: email.toLowerCase() });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/auth/verify-email ─────────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const user = await User.collection.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ success: false, message: 'Email already verified' });
    if (!user.emailOTP || !user.emailOTPExpiry) return res.status(400).json({ success: false, message: 'No OTP found. Please re-register.' });
    if (new Date() > user.emailOTPExpiry) return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });

    const match = await bcrypt.compare(otp, user.emailOTP);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    await User.collection.updateOne({ _id: user._id }, {
      $set: { isActive: true, emailVerified: true, updatedAt: new Date() },
      $unset: { emailOTP: '', emailOTPExpiry: '' }
    });

    const token = signToken(user._id);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/auth/resend-otp ────────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.collection.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 8);
    await User.collection.updateOne({ _id: user._id }, {
      $set: { emailOTP: otpHash, emailOTPExpiry: new Date(Date.now() + 10 * 60 * 1000) }
    });

    try {
      await sendMail(user.email, 'Your new TechMart verification code', otpEmailHtml(otp, user.name));
    } catch (mailErr) {
      console.error('Resend OTP mail error:', mailErr.message);
      return res.status(500).json({ success: false, message: 'Failed to send verification email. Please check server SMTP configuration.' });
    }
    res.json({ success: true, message: 'New OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put('/profile', protect, [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  validate
], async (req, res) => {
  try {
    const { name, phone, address, twoFactorEnabled } = req.body;
    const updateData = { name, phone, address, updatedAt: new Date() };
    if (typeof twoFactorEnabled === 'boolean') updateData.twoFactorEnabled = twoFactorEnabled;
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─── PUT /api/auth/change-password ───────────────────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    const user = await User.collection.findOne({ _id: req.user._id });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Current password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await User.collection.updateOne({ _id: req.user._id }, { $set: { password: hashed, updatedAt: new Date() } });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', loginLimiter, [
  body('email').isEmail().withMessage('Please provide a valid email').toLowerCase(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.collection.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive) {
      if (!user.emailVerified) return res.status(403).json({ success: false, message: 'Please verify your email first', requiresVerification: true, email: user.email });
      return res.status(403).json({ success: false, message: 'Account deactivated.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // Handle 2FA (defaults to true if not explicitly false)
    if (user.twoFactorEnabled !== false) {
      const otp = generateOTP();
      const otpHash = await bcrypt.hash(otp, 8);
      await User.collection.updateOne({ _id: user._id }, {
        $set: { 
          loginOTP: otpHash, 
          loginOTPExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        }
      });

      try {
        await sendMail(user.email, 'Your TechMart 2FA Login Code', otpEmailHtml(otp, user.name));
      } catch (err) { 
        console.error('Login 2FA email error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to send 2FA email. Please contact support or check SMTP settings.' });
      }

      return res.json({ success: true, requires2FA: true, email: user.email });
    }

    const token = signToken(user._id);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/auth/verify-2fa ────────────────────────────────────────────────
router.post('/verify-2fa', loginLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const user = await User.collection.findOne({ email: email.toLowerCase() });
    if (!user || !user.loginOTP || !user.loginOTPExpiry) return res.status(400).json({ success: false, message: 'Invalid session' });

    if (new Date() > user.loginOTPExpiry) return res.status(400).json({ success: false, message: 'OTP expired. Please log in again.' });

    const match = await bcrypt.compare(otp, user.loginOTP);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid verification code' });

    // Clear OTP and login user
    await User.collection.updateOne({ _id: user._id }, {
      $unset: { loginOTP: '', loginOTPExpiry: '' },
      $set: { updatedAt: new Date() }
    });

    const token = signToken(user._id);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.collection.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await User.collection.updateOne({ _id: user._id }, {
      $set: { resetPasswordToken: tokenHash, resetPasswordExpire: expiry }
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetLink = `${clientUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    try {
      await sendMail(user.email, 'Reset your TechMart password', resetEmailHtml(resetLink, user.name));
    } catch (err) {
      console.error('Forgot password email error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to send reset email. Please check server SMTP configuration.' });
    }

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ success: false, message: 'All fields required' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.collection.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await User.collection.updateOne({ _id: user._id }, {
      $set: { password: hashed, updatedAt: new Date() },
      $unset: { resetPasswordToken: '', resetPasswordExpire: '' }
    });

    res.json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/auth/account ─────────────────────────────────────────────────
router.delete('/account', protect, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.collection.findOne({ _id: req.user._id });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Incorrect password' });

    // Soft-delete: anonymize PII and deactivate
    await User.collection.updateOne({ _id: user._id }, {
      $set: {
        name: 'Deleted User',
        email: `deleted_${user._id}@deleted.techmart`,
        phone: '',
        address: {},
        isActive: false,
        emailVerified: false,
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    });

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Wishlist toggle ──────────────────────────────────────────────────────────
router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.productId;
    const idx = user.wishlist.findIndex(id => id.toString() === pid);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(pid);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─── Send order notification (called internally from orders route) ─────────────
router.sendOrderNotification = async (order, user) => {
  try {
    const email = user?.email || order.guestEmail;
    const name = user?.name || order.shippingAddress?.name || 'Customer';
    if (email) await sendMail(email, 'Your TechMart order is confirmed!', orderEmailHtml(order, name));
  } catch (err) {
    console.error('Order notification email error:', err.message);
  }
};

module.exports = router;

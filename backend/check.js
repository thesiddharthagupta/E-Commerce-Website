/**
 * TechMart startup checker — run with: node check.js
 * Verifies .env, MongoDB connection, and that admin user exists.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const checks = [];

// 1. Check .env vars
const required = ['MONGO_URI', 'JWT_SECRET'];
required.forEach(key => {
  if (process.env[key]) {
    checks.push(`✅ ${key} is set`);
  } else {
    checks.push(`❌ ${key} is MISSING — check your .env file`);
  }
});

console.log('\n--- TechMart Environment Check ---');
checks.forEach(c => console.log(c));

// 2. Check MongoDB
console.log('\n--- MongoDB Connection ---');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/techmart')
  .then(async () => {
    console.log('✅ MongoDB connected successfully');

    // 3. Check admin user
    const User = require('./models/User');
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log(`✅ Admin user found: ${admin.email}`);
    } else {
      console.log('⚠️  No admin user found — run: npm run seed');
    }

    console.log('\n✅ All checks passed! Run: npm run dev\n');
    process.exit(0);
  })
  .catch(err => {
    console.log(`❌ MongoDB connection FAILED: ${err.message}`);
    console.log('   Make sure MongoDB is running: mongod');
    console.log('   Or set MONGO_URI in .env to your Atlas connection string\n');
    process.exit(1);
  });

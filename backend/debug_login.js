const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const test = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/techmart');
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'admin@techmart.com' });
  
  if (!user) {
    console.log('User not found');
  } else {
    console.log('User found:', user.email);
    console.log('Password hash in DB:', user.password);
    const match = await bcrypt.compare('admin123', user.password);
    console.log('Match result for "admin123":', match);
  }
  process.exit(0);
};

test();

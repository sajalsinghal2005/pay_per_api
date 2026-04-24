const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is required in .env');
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log('Connected to MongoDB');

  // Seed a default admin account when the database is empty.
  const adminEmail = 'admin@admin.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin', 10);
    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: passwordHash,
      apiKey: 'api_admin_' + Math.random().toString(36).substring(2, 18),
      credits: 10000,
      role: 'admin'
    });
    console.log('Seeded default admin user:', adminEmail);
  }
};

module.exports = connectDB;

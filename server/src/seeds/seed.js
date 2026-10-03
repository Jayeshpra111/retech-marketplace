// src/seeds/seed.js — seeds categories and an admin user
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MONGO_URI } = require('../config/env');
const Category = require('../models/Category.model');
const User = require('../models/User.model');

const categories = [
  { name: 'Mobiles', slug: 'mobiles', icon: 'Smartphone', impactWeightKg: 0.2, co2Factor: 74 },
  { name: 'Laptops', slug: 'laptops', icon: 'Laptop', impactWeightKg: 2.2, co2Factor: 74 },
  { name: 'Tablets', slug: 'tablets', icon: 'Tablet', impactWeightKg: 0.5, co2Factor: 74 },
  { name: 'Cameras', slug: 'cameras', icon: 'Camera', impactWeightKg: 0.4, co2Factor: 74 },
  { name: 'Audio', slug: 'audio', icon: 'Headphones', impactWeightKg: 0.3, co2Factor: 74 },
  { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', impactWeightKg: 0.5, co2Factor: 74 },
  { name: 'Wearables', slug: 'wearables', icon: 'Watch', impactWeightKg: 0.1, co2Factor: 74 },
  { name: 'RAM', slug: 'ram', icon: 'MemoryStick', impactWeightKg: 0.05, co2Factor: 74 },
  { name: 'Motherboards', slug: 'motherboards', icon: 'CircuitBoard', impactWeightKg: 0.6, co2Factor: 74 },
  { name: 'GPUs', slug: 'gpus', icon: 'Cpu', impactWeightKg: 0.9, co2Factor: 74 },
  { name: 'Storage', slug: 'storage', icon: 'HardDrive', impactWeightKg: 0.15, co2Factor: 74 },
  { name: 'Power Supplies', slug: 'power-supplies', icon: 'Zap', impactWeightKg: 0.8, co2Factor: 74 },
  { name: 'Other Electronics', slug: 'other', icon: 'Package', impactWeightKg: 0.5, co2Factor: 74 },
];

const adminUser = {
  name: 'Admin',
  email: 'admin@retechmarket.com',
  password: 'Admin@1234',
  role: 'admin',
  isEmailVerified: true,
};

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Upsert categories
  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
  }
  console.log(`✅ Seeded ${categories.length} categories`);

  // Create admin if not exists
  const existing = await User.findOne({ email: adminUser.email });
  if (!existing) {
    await User.create(adminUser);
    console.log(`✅ Admin user created: ${adminUser.email} / ${adminUser.password}`);
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  await mongoose.disconnect();
  console.log('Done!');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

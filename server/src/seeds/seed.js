// src/seeds/seed.js — seeds categories and an admin user
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { MONGO_URI } = require('../config/env');
const Category = require('../models/Category.model');
const RecyclingCenter = require('../models/RecyclingCenter.model');
const User = require('../models/User.model');

const categories = [
  { name: 'Mobiles', slug: 'mobiles', icon: 'Smartphone', impactWeightKg: 0.2, co2Factor: 74 },
  { name: 'Laptops', slug: 'laptops', icon: 'Laptop', impactWeightKg: 2.2, co2Factor: 74 },
  { name: 'Tablets', slug: 'tablets', icon: 'Tablet', impactWeightKg: 0.5, co2Factor: 74 },
  { name: 'Cameras', slug: 'cameras', icon: 'Camera', impactWeightKg: 0.4, co2Factor: 74 },
  { name: 'Audio', slug: 'audio', icon: 'Headphones', impactWeightKg: 0.3, co2Factor: 74 },
  { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', impactWeightKg: 0.5, co2Factor: 74 },
  { name: 'Wearables', slug: 'wearables', icon: 'Watch', isComponent: false, impactWeightKg: 0.1, co2Factor: 74 },
  { name: 'RAM', slug: 'ram', icon: 'MemoryStick', isComponent: true, impactWeightKg: 0.05, co2Factor: 74 },
  { name: 'Motherboards', slug: 'motherboards', icon: 'CircuitBoard', isComponent: true, impactWeightKg: 0.6, co2Factor: 74 },
  { name: 'GPUs', slug: 'gpus', icon: 'Cpu', isComponent: true, impactWeightKg: 0.9, co2Factor: 74 },
  { name: 'Storage', slug: 'storage', icon: 'HardDrive', isComponent: true, impactWeightKg: 0.15, co2Factor: 74 },
  { name: 'Power Supplies', slug: 'power-supplies', icon: 'Zap', isComponent: true, impactWeightKg: 0.8, co2Factor: 74 },
  { name: 'Other Electronics', slug: 'other', icon: 'Package', isComponent: false, impactWeightKg: 0.5, co2Factor: 74 },
];

const recyclingCenters = [
  {
    name: 'EcoRecycle Solutions Hub',
    address: {
      line1: 'Plot 42, Electronic City Phase 1, Near Toll Gate',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560100',
    },
    phone: '+91 80 2852 9012',
    acceptedItems: ['Lithium Batteries', 'Printed Circuit Boards', 'Broken Displays', 'Old CRT Monitors', 'Cable Wire Scrap'],
    certification: 'R2 Certified, CPCB Authorized, ISO 14001',
    isActive: true,
  },
  {
    name: 'GreenBytes E-Waste Reclamation',
    address: {
      line1: 'Unit 18, MIDC Andheri East, Near Chakala Metro',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400093',
    },
    phone: '+91 22 6123 4400',
    acceptedItems: ['Dead Motherboards', 'Swollen Phone Batteries', 'Household Electronics', 'Power Adapters'],
    certification: 'CPCB Authorized, e-Stewards Partner',
    isActive: true,
  },
  {
    name: 'CleanEarth Circular Center',
    address: {
      line1: 'Sector 37, Pace City II, Gurugram',
      city: 'Delhi NCR',
      state: 'Haryana',
      pincode: '122001',
    },
    phone: '+91 124 456 7890',
    acceptedItems: ['Server Racks', 'Smartphones', 'Computer Peripherals', 'Printers & Cartridges'],
    certification: 'Govt Authorized Recycler, Zero-Landfill Certified',
    isActive: true,
  },
];

const UNSAFE_PASSWORDS = ['Admin@1234', 'admin', 'password', 'change_this_password', '123456'];

const run = async () => {
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@retechmarket.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminPassword) {
    console.error('❌ ADMIN_SEED_PASSWORD env var is required. Set it in .env');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && UNSAFE_PASSWORDS.includes(adminPassword)) {
    console.error('❌ Refusing to seed with a default/weak password in production. Set a strong ADMIN_SEED_PASSWORD.');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Upsert categories
  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
  }
  console.log(`✅ Seeded ${categories.length} categories`);

  // Upsert recycling centers
  for (const center of recyclingCenters) {
    await RecyclingCenter.findOneAndUpdate({ name: center.name }, center, { upsert: true, new: true });
  }
  console.log(`✅ Seeded ${recyclingCenters.length} recycling centers`);

  // Create admin if not exists
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isEmailVerified: true,
    });
    console.log(`✅ Admin user created: ${adminEmail} (password NOT printed for security)`);
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  await mongoose.disconnect();
  console.log('Done!');
  process.exit(0);
};

run().catch((err) => {
  const msg = err.message || '';
  if (err.code === 8000 || /auth|password/i.test(msg)) {
    console.error('❌ Connection failed: wrong username or password.');
  } else if (/whitelist|firewall|timed out|Server selection timed out/i.test(msg) || err.name === 'MongooseServerSelectionError') {
    console.error('❌ Connection failed: IP address not allowed in Atlas Network Access or cluster unreachable.');
  } else if (/invalid connection string|scheme|parse/i.test(msg) || err.name === 'MongoParseError') {
    console.error('❌ Connection failed: invalid connection string.');
  } else {
    console.error('❌ Database connection error occurred.');
  }
  process.exit(1);
});

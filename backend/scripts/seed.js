const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Missing MONGODB_URI in environment variables.');
  process.exit(1);
}

// Demo users removed - users should register through the application
const demoUsers = [];

async function seedDatabase() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create demo users (if any)
    if (demoUsers.length > 0) {
      for (const userData of demoUsers) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${user.name} (${user.role})`);
      }
      console.log('Database seeded successfully!');
    } else {
      console.log('No demo users to seed. Users should register through the application.');
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();

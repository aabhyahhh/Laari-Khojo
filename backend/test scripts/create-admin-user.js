require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const MONGO_URI = process.env.MONGO_URI;

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@laarikhojo.com" });
    
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("L@@riKh0j0", 10);
    
    const adminUser = new User({
      name: "Admin",
      email: "admin@laarikhojo.com",
      password: hashedPassword,
      contactNumber: "9999999999",
      mapsLink: "https://maps.google.com/@23.0225,72.5714,15z", // Default location
      operatingHours: {
        openTime: "00:00",
        closeTime: "23:59",
        days: [0, 1, 2, 3, 4, 5, 6] // All days of the week (0 = Sunday)
      },
      foodType: "admin"
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin@laarikhojo.com");
    console.log("Password: L@@riKh0j0");
    
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

createAdminUser();

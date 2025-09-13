require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");

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
        monday: { open: "00:00", close: "23:59", isOpen: true },
        tuesday: { open: "00:00", close: "23:59", isOpen: true },
        wednesday: { open: "00:00", close: "23:59", isOpen: true },
        thursday: { open: "00:00", close: "23:59", isOpen: true },
        friday: { open: "00:00", close: "23:59", isOpen: true },
        saturday: { open: "00:00", close: "23:59", isOpen: true },
        sunday: { open: "00:00", close: "23:59", isOpen: true }
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

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const VendorClick = require("../models/vendorClickModel");

const MONGO_URI = process.env.MONGO_URI;

async function createTestVendorsAndClicks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Test vendors data
    const testVendors = [
      {
        name: "Raju's Chaat Corner",
        email: "raju@example.com",
        password: "password123",
        contactNumber: "+919876543210",
        mapsLink: "https://maps.google.com/@23.0225,72.5714,15z",
        operatingHours: {
          openTime: "06:00",
          closeTime: "22:00",
          days: [0, 1, 2, 3, 4, 5, 6]
        },
        foodType: "veg",
        bestDishes: [
          { name: "Pani Puri", price: 30 },
          { name: "Bhel Puri", price: 40 },
          { name: "Dahi Puri", price: 50 }
        ]
      },
      {
        name: "Ahmedabad Famous Vada Pav",
        email: "vadapav@example.com",
        password: "password123",
        contactNumber: "+919876543211",
        mapsLink: "https://maps.google.com/@23.0325,72.5814,15z",
        operatingHours: {
          openTime: "08:00",
          closeTime: "20:00",
          days: [1, 2, 3, 4, 5, 6]
        },
        foodType: "veg",
        bestDishes: [
          { name: "Vada Pav", price: 25 },
          { name: "Samosa", price: 15 },
          { name: "Dabeli", price: 35 }
        ]
      },
      {
        name: "South Indian Delights",
        email: "southindian@example.com",
        password: "password123",
        contactNumber: "+919876543212",
        mapsLink: "https://maps.google.com/@23.0425,72.5914,15z",
        operatingHours: {
          openTime: "07:00",
          closeTime: "23:00",
          days: [0, 1, 2, 3, 4, 5, 6]
        },
        foodType: "veg",
        bestDishes: [
          { name: "Masala Dosa", price: 80 },
          { name: "Idli Sambar", price: 60 },
          { name: "Uttapam", price: 70 }
        ]
      },
      {
        name: "Chinese Corner",
        email: "chinese@example.com",
        password: "password123",
        contactNumber: "+919876543213",
        mapsLink: "https://maps.google.com/@23.0525,72.6014,15z",
        operatingHours: {
          openTime: "11:00",
          closeTime: "23:00",
          days: [0, 1, 2, 3, 4, 5, 6]
        },
        foodType: "non-veg",
        bestDishes: [
          { name: "Chicken Fried Rice", price: 120 },
          { name: "Chicken Manchurian", price: 100 },
          { name: "Veg Noodles", price: 80 }
        ]
      },
      {
        name: "Gujarati Thali House",
        email: "gujarati@example.com",
        password: "password123",
        contactNumber: "+919876543214",
        mapsLink: "https://maps.google.com/@23.0625,72.6114,15z",
        operatingHours: {
          openTime: "10:00",
          closeTime: "22:00",
          days: [0, 1, 2, 3, 4, 5, 6]
        },
        foodType: "veg",
        bestDishes: [
          { name: "Gujarati Thali", price: 150 },
          { name: "Dhokla", price: 60 },
          { name: "Khandvi", price: 70 }
        ]
      }
    ];

    console.log("Creating test vendors...");
    const createdVendors = [];

    for (const vendorData of testVendors) {
      // Check if vendor already exists
      const existingVendor = await User.findOne({ email: vendorData.email });
      if (existingVendor) {
        console.log(`Vendor ${vendorData.name} already exists, skipping...`);
        createdVendors.push(existingVendor);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(vendorData.password, 10);
      
      // Extract coordinates from mapsLink
      const mapsRegex = /@([-+]?\d*\.\d+),([-+]?\d*\.\d+)/;
      const match = vendorData.mapsLink.match(mapsRegex);
      const latitude = match ? parseFloat(match[1]) : 23.0225;
      const longitude = match ? parseFloat(match[2]) : 72.5714;

      // Create vendor
      const vendor = new User({
        ...vendorData,
        password: hashedPassword,
        latitude,
        longitude
      });

      await vendor.save();
      createdVendors.push(vendor);
      console.log(`Created vendor: ${vendorData.name}`);
    }

    console.log("\nCreating test click data...");
    
    // Create some realistic click data
    const clickData = [
      { vendorIndex: 0, clicks: 45 }, // Raju's Chaat - most popular
      { vendorIndex: 1, clicks: 32 }, // Vada Pav
      { vendorIndex: 2, clicks: 28 }, // South Indian
      { vendorIndex: 3, clicks: 18 }, // Chinese Corner
      { vendorIndex: 4, clicks: 12 }  // Gujarati Thali
    ];

    for (const { vendorIndex, clicks } of clickData) {
      if (vendorIndex < createdVendors.length) {
        const vendor = createdVendors[vendorIndex];
        
        // Check if click record already exists
        const existingClick = await VendorClick.findOne({ vendorId: vendor._id });
        if (existingClick) {
          console.log(`Click data for ${vendor.name} already exists, skipping...`);
          continue;
        }

        // Create click record
        const vendorClick = new VendorClick({
          vendorId: vendor._id,
          clickCount: clicks,
          firstClickedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          lastClickedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)  // Random date in last 7 days
        });

        await vendorClick.save();
        console.log(`Created click data for ${vendor.name}: ${clicks} clicks`);
      }
    }

    console.log("\n✅ Test data creation completed!");
    console.log(`Created ${createdVendors.length} vendors`);
    console.log("Click data created for vendors");
    
  } catch (error) {
    console.error("Error creating test data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

createTestVendorsAndClicks();


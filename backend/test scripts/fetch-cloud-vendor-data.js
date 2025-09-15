require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/userModel");
const VendorClick = require("../models/vendorClickModel");

const MONGO_URI = process.env.MONGO_URI;

async function fetchCloudVendorData() {
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    console.log("Connection string:", MONGO_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas successfully!");

    // Count total vendors
    const totalVendors = await User.countDocuments();
    console.log(`\n📊 Total vendors in database: ${totalVendors}`);

    // Get sample vendors (first 10)
    console.log("\n📋 Sample vendors (first 10):");
    const sampleVendors = await User.find({})
      .select('name email contactNumber foodType createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    sampleVendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.name || 'No name'} (${vendor.email || 'No email'})`);
      console.log(`   Contact: ${vendor.contactNumber || 'N/A'}`);
      console.log(`   Food Type: ${vendor.foodType || 'N/A'}`);
      console.log(`   Created: ${vendor.createdAt || 'N/A'}`);
      console.log('');
    });

    // Check vendor click data
    const totalClicks = await VendorClick.countDocuments();
    console.log(`\n🖱️  Total vendor click records: ${totalClicks}`);

    if (totalClicks > 0) {
      console.log("\n📈 Top 10 vendors by clicks:");
      const topVendors = await VendorClick.find({})
        .populate('vendorId', 'name email contactNumber')
        .sort({ clickCount: -1 })
        .limit(10);

      topVendors.forEach((click, index) => {
        const vendor = click.vendorId;
        console.log(`${index + 1}. ${vendor.name || 'No name'} - ${click.clickCount} clicks`);
        console.log(`   Last clicked: ${click.lastClickedAt}`);
      });
    } else {
      console.log("\n⚠️  No vendor click data found in cloud database");
      console.log("   This means the vendor click tracking hasn't been used yet in production");
    }

    // Get vendor statistics
    console.log("\n📊 Vendor Statistics:");
    const vegVendors = await User.countDocuments({ foodType: 'veg' });
    const nonVegVendors = await User.countDocuments({ foodType: 'non-veg' });
    const swaminarayanVendors = await User.countDocuments({ foodType: 'swaminarayan' });
    const jainVendors = await User.countDocuments({ foodType: 'jain' });
    const otherVendors = await User.countDocuments({ foodType: { $nin: ['veg', 'non-veg', 'swaminarayan', 'jain'] } });

    console.log(`   Vegetarian: ${vegVendors}`);
    console.log(`   Non-Vegetarian: ${nonVegVendors}`);
    console.log(`   Swaminarayan: ${swaminarayanVendors}`);
    console.log(`   Jain: ${jainVendors}`);
    console.log(`   Other/None: ${otherVendors}`);

    // Get recent vendors (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentVendors = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    console.log(`\n🆕 Recent vendors (last 7 days): ${recentVendors}`);

    console.log("\n✅ Data fetch completed successfully!");
    
  } catch (error) {
    console.error("❌ Error connecting to MongoDB Atlas:", error.message);
    
    if (error.message.includes('whitelist')) {
      console.log("\n🔧 SOLUTION:");
      console.log("Your IP address is not whitelisted in MongoDB Atlas.");
      console.log("To fix this:");
      console.log("1. Go to https://cloud.mongodb.com/");
      console.log("2. Select your project and cluster");
      console.log("3. Go to 'Network Access' in the left sidebar");
      console.log("4. Click 'Add IP Address'");
      console.log("5. Add your current IP address or use '0.0.0.0/0' for all IPs (less secure)");
      console.log("6. Wait a few minutes for the changes to take effect");
      console.log("\nYour current IP can be found at: https://whatismyipaddress.com/");
    } else if (error.message.includes('authentication')) {
      console.log("\n🔧 SOLUTION:");
      console.log("Authentication failed. Please check your MongoDB credentials in .env file");
    } else {
      console.log("\n🔧 SOLUTION:");
      console.log("Please check your MongoDB connection string and network connectivity");
    }
  } finally {
    try {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}

fetchCloudVendorData();


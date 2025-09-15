require('dotenv').config();
const mongoose = require('mongoose');
const VendorLocation = require('../models/vendorLocationModel');

async function checkLocationUpdates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all vendor locations
    const locations = await VendorLocation.find({}).sort({ updatedAt: -1 });
    
    console.log(`\n📍 Found ${locations.length} vendor locations in database:`);
    console.log('=' .repeat(80));
    
    if (locations.length === 0) {
      console.log('❌ No vendor locations found in database.');
      console.log('💡 This could mean:');
      console.log('   - No location messages have been received yet');
      console.log('   - Webhook is not processing location messages correctly');
      console.log('   - Database connection issues');
    } else {
      locations.forEach((loc, index) => {
        console.log(`${index + 1}. Phone: ${loc.phone}`);
        console.log(`   Location: ${loc.location.lat}, ${loc.location.lng}`);
        console.log(`   Name: ${loc.location.name || 'N/A'}`);
        console.log(`   Address: ${loc.location.address || 'N/A'}`);
        console.log(`   Last Message ID: ${loc.lastMessageId || 'N/A'}`);
        console.log(`   Last Updated: ${loc.updatedAt}`);
        console.log(`   Created: ${loc.createdAt}`);
        console.log('-'.repeat(60));
      });
    }

    // Check for recent updates (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLocations = await VendorLocation.find({
      updatedAt: { $gte: oneDayAgo }
    }).sort({ updatedAt: -1 });

    console.log(`\n🕐 Recent updates (last 24 hours): ${recentLocations.length}`);
    if (recentLocations.length > 0) {
      recentLocations.forEach((loc, index) => {
        console.log(`${index + 1}. ${loc.phone} - Updated ${loc.updatedAt}`);
      });
    }

    // Check for duplicate phone numbers
    const phoneCounts = await VendorLocation.aggregate([
      { $group: { _id: '$phone', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (phoneCounts.length > 0) {
      console.log('\n⚠️  Duplicate phone numbers found:');
      phoneCounts.forEach(dup => {
        console.log(`   ${dup._id}: ${dup.count} entries`);
      });
    } else {
      console.log('\n✅ No duplicate phone numbers found');
    }

  } catch (error) {
    console.error('❌ Error checking location updates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkLocationUpdates().catch(console.error);

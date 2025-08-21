require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

async function checkTestVendor() {
  console.log('🔍 Checking for test vendor in database...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '918130026321';
    const normalizedPhoneNumber = testPhoneNumber.startsWith('+91') ? testPhoneNumber : `+91${testPhoneNumber}`;
    
    console.log('📱 Looking for vendor with phone number:', normalizedPhoneNumber);
    
    // Check for exact match
    const vendor = await User.findOne({ contactNumber: normalizedPhoneNumber });
    
    if (vendor) {
      console.log('✅ Found vendor:');
      console.log('- Name:', vendor.name);
      console.log('- Email:', vendor.email);
      console.log('- Phone:', vendor.contactNumber);
      console.log('- Maps Link:', vendor.mapsLink);
      console.log('- Created:', vendor.createdAt);
      console.log('- Updated:', vendor.updatedAt);
    } else {
      console.log('❌ No vendor found with phone number:', normalizedPhoneNumber);
      
      // Check for similar phone numbers
      console.log('\n🔍 Checking for similar phone numbers...');
      const similarVendors = await User.find({
        contactNumber: { $regex: testPhoneNumber.replace('+91', ''), $options: 'i' }
      }).limit(5);
      
      if (similarVendors.length > 0) {
        console.log('📋 Found similar vendors:');
        similarVendors.forEach((v, i) => {
          console.log(`${i + 1}. ${v.name} - ${v.contactNumber}`);
        });
      } else {
        console.log('❌ No similar vendors found');
      }
      
      // Show total vendor count
      const totalVendors = await User.countDocuments();
      console.log(`\n📊 Total vendors in database: ${totalVendors}`);
      
      if (totalVendors > 0) {
        console.log('\n📋 Sample vendors:');
        const sampleVendors = await User.find({}).limit(3).select('name contactNumber');
        sampleVendors.forEach((v, i) => {
          console.log(`${i + 1}. ${v.name} - ${v.contactNumber}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkTestVendor().catch(console.error);

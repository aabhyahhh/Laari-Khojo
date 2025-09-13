require('dotenv').config();
const mongoose = require('mongoose');
const { sendPhotoUploadInvitation } = require('../services/metaWhatsAppService');
const User = require('../models/userModel');

async function testWhatsAppPhotoWorkflow() {
  console.log('🧪 Testing WhatsApp Photo Upload Workflow\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test phone number (replace with actual test vendor phone number)
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '918130026321';
    const normalizedPhoneNumber = testPhoneNumber.startsWith('+91') ? testPhoneNumber : `+91${testPhoneNumber}`;
    
    console.log('📱 Testing with phone number:', normalizedPhoneNumber);
    
    // Check if vendor exists
    const vendor = await User.findOne({ contactNumber: normalizedPhoneNumber });
    
    if (!vendor) {
      console.log('❌ No vendor found with phone number:', normalizedPhoneNumber);
      console.log('💡 Please register a vendor with this phone number first');
      return;
    }
    
    console.log('✅ Found vendor:', vendor.name || vendor.businessName || 'Unknown');
    
    // Send photo upload invitation
    console.log('📤 Sending photo upload invitation...');
    await sendPhotoUploadInvitation(normalizedPhoneNumber, vendor.name || vendor.businessName || 'Vendor');
    
    console.log('✅ Photo upload invitation sent successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Check WhatsApp for the invitation message');
    console.log('2. Click the "📤 Upload Photo" button');
    console.log('3. You should receive a link to the vendor upload page');
    console.log('4. Test the upload functionality');
    
  } catch (error) {
    console.error('❌ Error testing WhatsApp photo workflow:', error.message);
    console.error('Error details:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWhatsAppPhotoWorkflow();
}

module.exports = { testWhatsAppPhotoWorkflow };

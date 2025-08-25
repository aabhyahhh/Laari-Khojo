require('dotenv').config();
const { sendPhotoUploadInvitation } = require('./services/whatsappService');

async function testWhatsAppDirect() {
  console.log('🧪 Testing WhatsApp Photo Upload Service Directly\n');
  
  // Test phone number (replace with actual test vendor phone number)
  const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '918130026321';
  const normalizedPhoneNumber = testPhoneNumber.startsWith('+91') ? testPhoneNumber : `+91${testPhoneNumber}`;
  
  console.log('📱 Testing with phone number:', normalizedPhoneNumber);
  console.log('📤 Template ID:', process.env.WHATSAPP_PHOTO_UPLOAD_TEMPLATE_ID || 'NOT_SET');
  console.log('🌐 Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:5173');
  
  try {
    console.log('\n📤 Sending photo upload invitation...');
    
    // Send the invitation directly
    const result = await sendPhotoUploadInvitation(normalizedPhoneNumber, 'Test Vendor');
    
    console.log('\n✅ WhatsApp invitation sent successfully!');
    console.log('📊 Result:', result);
    console.log('\n📋 Next steps:');
    console.log('1. Check WhatsApp for the invitation message');
    console.log('2. Click the "📤 Upload Photo" button');
    console.log('3. You should be redirected to:');
    console.log(`   ${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor-upload?phone=${encodeURIComponent(normalizedPhoneNumber)}`);
    
  } catch (error) {
    console.error('\n❌ Error sending WhatsApp invitation:', error.message);
    console.error('Error details:', error);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Twilio environment variables:');
    console.log('   - TWILIO_ACCOUNT_SID');
    console.log('   - TWILIO_AUTH_TOKEN');
    console.log('   - TWILIO_WHATSAPP_NUMBER');
    console.log('   - WHATSAPP_PHOTO_UPLOAD_TEMPLATE_ID');
    console.log('2. Make sure your Twilio WhatsApp number is configured');
    console.log('3. Verify the template ID is correct');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWhatsAppDirect();
}

module.exports = { testWhatsAppDirect };

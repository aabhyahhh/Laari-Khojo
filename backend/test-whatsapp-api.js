require('dotenv').config();

async function testWhatsAppAPI() {
  console.log('🧪 Testing WhatsApp Photo Upload API Endpoint\n');
  
  // Test phone number (replace with actual test vendor phone number)
  const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '918130026321';
  const normalizedPhoneNumber = testPhoneNumber.startsWith('+91') ? testPhoneNumber : `+91${testPhoneNumber}`;
  
  console.log('📱 Testing with phone number:', normalizedPhoneNumber);
  console.log('🌐 API URL:', process.env.FRONTEND_URL || 'http://localhost:5173');
  console.log('📤 Template ID:', process.env.WHATSAPP_PHOTO_UPLOAD_TEMPLATE_ID || 'NOT_SET');
  
  try {
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/send-photo-upload-invitation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber: normalizedPhoneNumber }),
    });

    const data = await response.json();
    
    console.log('\n📊 API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ API call successful!');
      console.log('📋 Next steps:');
      console.log('1. Check WhatsApp for the invitation message');
      console.log('2. Click the "📤 Upload Photo" button');
      console.log('3. You should be redirected to the vendor upload page');
    } else {
      console.log('\n❌ API call failed:', data.msg);
    }
    
  } catch (error) {
    console.error('\n❌ Error testing API:', error.message);
    console.log('\n💡 Make sure your backend server is running on port 3000');
    console.log('   Run: cd backend && npm start');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWhatsAppAPI();
}

module.exports = { testWhatsAppAPI };

require('dotenv').config();
const { sendText, sendTemplate, validateMetaConfig } = require('../services/metaWhatsAppService');

// Test phone number (replace with your WhatsApp number)
const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '+919876543210';

async function testWhatsAppOTP() {
  console.log('Testing Meta API WhatsApp functionality...\n');

  // Test 1: Check environment variables
  console.log('1. Checking environment variables...');
  const configValid = validateMetaConfig();
  if (!configValid) {
    console.log('❌ Meta API configuration missing');
    return;
  }
  console.log('✅ Meta API configuration found');

  // Test 2: Generate and send test OTP
  console.log('\n2. Testing OTP generation and sending...');
  
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);

    if (process.env.NODE_ENV === 'production') {
      // Send via WhatsApp using Meta API
      const message = await sendText(testPhoneNumber, `Test OTP from LaariKhojo: ${otp}. This is a test message.`);
      
      console.log('✅ WhatsApp message sent successfully');
      console.log('Message ID:', message.messages?.[0]?.id || 'N/A');
    } else {
      console.log('✅ Development mode - OTP logged to console');
      console.log(`OTP for ${testPhoneNumber}: ${otp}`);
    }

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.message);
    
    if (error.message.includes('Invalid access token')) {
      console.log('💡 Tip: Check your WHATSAPP_TOKEN in environment variables');
    } else if (error.message.includes('Phone number ID')) {
      console.log('💡 Tip: Check your WHATSAPP_PHONE_NUMBER_ID in environment variables');
    }
  }

  // Test 3: API endpoint test
  console.log('\n3. Testing API endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: testPhoneNumber,
        method: 'whatsapp'
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API endpoint working');
      console.log('Response:', data);
    } else {
      console.log('❌ API endpoint failed:', data.msg);
    }
  } catch (error) {
    console.log('❌ API endpoint test failed:', error.message);
    console.log('💡 Make sure the backend server is running on port 3000');
  }

  console.log('\n📋 Next steps:');
  console.log('1. Make sure your Meta API templates are approved');
  console.log('2. Test with a real phone number');
  console.log('3. Check the frontend integration');
  console.log('4. Verify your business is approved by Meta');
}

// Run the test
testWhatsAppOTP().catch(console.error); 
require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Test phone number (replace with your WhatsApp number)
const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '+1234567890';

async function testWhatsAppOTP() {
  console.log('Testing WhatsApp OTP functionality...\n');

  // Test 1: Check environment variables
  console.log('1. Checking environment variables...');
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    console.log('✅ Twilio credentials found');
  } else {
    console.log('❌ Twilio credentials missing');
    return;
  }

  if (process.env.TWILIO_WHATSAPP_NUMBER) {
    console.log('✅ WhatsApp number configured:', process.env.TWILIO_WHATSAPP_NUMBER);
  } else {
    console.log('❌ WhatsApp number not configured');
    return;
  }

  // Test 2: Generate and send test OTP
  console.log('\n2. Testing OTP generation and sending...');
  
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);

    if (process.env.NODE_ENV === 'production') {
      // Send via WhatsApp
      const message = await twilioClient.messages.create({
        body: `Test OTP from LaariKhojo: ${otp}. This is a test message.`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${testPhoneNumber}`
      });
      
      console.log('✅ WhatsApp message sent successfully');
      console.log('Message SID:', message.sid);
    } else {
      console.log('✅ Development mode - OTP logged to console');
      console.log(`OTP for ${testPhoneNumber}: ${otp}`);
    }

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.message);
    
    if (error.code === 21211) {
      console.log('💡 Tip: Make sure you have joined the WhatsApp sandbox');
      console.log('💡 Tip: Check if the phone number is registered with WhatsApp');
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
  console.log('1. Make sure you have joined the WhatsApp sandbox');
  console.log('2. Test with a real phone number');
  console.log('3. Check the frontend integration');
}

// Run the test
testWhatsAppOTP().catch(console.error); 
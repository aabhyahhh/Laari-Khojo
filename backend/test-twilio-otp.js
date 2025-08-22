require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testTwilioOTP() {
  console.log('🧪 Testing Twilio WhatsApp OTP sending...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
  console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER || '❌ Missing');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('TEST_PHONE_NUMBER:', process.env.TEST_PHONE_NUMBER);
  console.log('');

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
    console.error('❌ Missing required Twilio environment variables');
    return;
  }

  // Test phone number
  const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '918130026321';
  const normalizedPhoneNumber = testPhoneNumber.startsWith('+91') ? testPhoneNumber : `+91${testPhoneNumber}`;
  
  // Clean WhatsApp number (remove any trailing %)
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER.replace('%', '');
  
  console.log('📱 Test Configuration:');
  console.log('From (WhatsApp):', `whatsapp:${whatsappNumber}`);
  console.log('To (Phone):', `whatsapp:${normalizedPhoneNumber}`);
  console.log('');

  try {
    console.log('🚀 Attempting to send test WhatsApp message...');
    
    const messageConfig = {
      body: '🧪 Test message from LaariKhojo: Your verification code is 123456. Valid for 5 minutes.',
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${normalizedPhoneNumber}`
    };

    console.log('📤 Message config:', {
      ...messageConfig,
      body: messageConfig.body.substring(0, 30) + '...'
    });

    const result = await twilioClient.messages.create(messageConfig);
    
    console.log('✅ Message sent successfully!');
    console.log('Message SID:', result.sid);
    console.log('Status:', result.status);
    console.log('Date Created:', result.dateCreated);
    console.log('');
    console.log('🎉 Twilio WhatsApp integration is working correctly!');
    
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('More Info:', error.moreInfo);
    
    if (error.code === 21211) {
      console.log('\n💡 This error usually means:');
      console.log('- The phone number format is invalid');
      console.log('- The number is not registered for WhatsApp');
      console.log('- The number is not in the correct format');
    } else if (error.code === 21214) {
      console.log('\n💡 This error usually means:');
      console.log('- The WhatsApp number is not properly configured');
      console.log('- The Twilio WhatsApp number is not active');
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure the test phone number is registered on WhatsApp');
    console.log('2. Verify the Twilio WhatsApp number is active in your Twilio console');
    console.log('3. Check if the phone number format is correct (+91XXXXXXXXXX)');
    console.log('4. Ensure your Twilio account has WhatsApp messaging enabled');
  }
}

// Run the test
testTwilioOTP().catch(console.error);


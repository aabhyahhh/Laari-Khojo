require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testWhatsAppSandbox() {
  console.log('🧪 Testing WhatsApp Sandbox Mode\n');
  
  // For sandbox testing, we need to use a simple text message first
  const testPhoneNumber = '+918130026321';
  const normalizedPhoneNumber = testPhoneNumber.startsWith('+91') ? testPhoneNumber : `+91${testPhoneNumber}`;
  
  console.log('📱 Testing with phone number:', normalizedPhoneNumber);
  console.log('📤 From WhatsApp number:', process.env.TWILIO_WHATSAPP_NUMBER);
  
  try {
    // First, send a simple text message to test sandbox
    console.log('\n📤 Sending test message to sandbox...');
    
    const result = await twilioClient.messages.create({
      body: '🧪 Test message from Laari Khojo WhatsApp integration. Please reply with the code shown in your Twilio console.',
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${normalizedPhoneNumber}`
    });
    
    console.log('\n✅ Test message sent successfully!');
    console.log('📊 Result:', result.sid);
    console.log('📊 Status:', result.status);
    
    console.log('\n📋 Next steps:');
    console.log('1. Check WhatsApp for the test message');
    console.log('2. Reply with the code shown in your Twilio console');
    console.log('3. Once opted-in, we can test the photo upload template');
    
  } catch (error) {
    console.error('\n❌ Error sending test message:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWhatsAppSandbox();
}

module.exports = { testWhatsAppSandbox };

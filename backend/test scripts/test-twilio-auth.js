require('dotenv').config();
const twilio = require('twilio');

console.log('Testing Twilio Authentication...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER || '❌ Missing');

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.log('\n❌ Missing Twilio credentials. Please check your .env file.');
  process.exit(1);
}

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testTwilioAuth() {
  try {
    console.log('\nTesting Twilio API access...');
    
    // Test basic API access
    const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('✅ Twilio authentication successful');
    console.log('Account Status:', account.status);
    console.log('Account Type:', account.type);
    
    // Test WhatsApp capabilities
    console.log('\nTesting WhatsApp setup...');
    
    if (process.env.TWILIO_WHATSAPP_NUMBER) {
      console.log('WhatsApp Number:', process.env.TWILIO_WHATSAPP_NUMBER);
      
      // Try to send a test message (this will fail if not in sandbox)
      try {
        const message = await twilioClient.messages.create({
          body: 'Test message from LaariKhojo',
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: `whatsapp:${process.env.TEST_PHONE_NUMBER || '+1234567890'}`
        });
        console.log('✅ WhatsApp message sent successfully');
        console.log('Message SID:', message.sid);
      } catch (whatsappError) {
        console.log('❌ WhatsApp message failed:', whatsappError.message);
        
        if (whatsappError.code === 21211) {
          console.log('\n💡 To fix this:');
          console.log('1. Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message');
          console.log('2. Send the provided code to join the WhatsApp sandbox');
          console.log('3. Make sure your test phone number is registered with WhatsApp');
        }
      }
    } else {
      console.log('❌ TWILIO_WHATSAPP_NUMBER not configured');
    }
    
  } catch (error) {
    console.log('❌ Twilio authentication failed:', error.message);
    console.log('\n💡 Please check:');
    console.log('1. Your Account SID is correct');
    console.log('2. Your Auth Token is correct (try regenerating it)');
    console.log('3. Your Twilio account is active');
  }
}

testTwilioAuth(); 
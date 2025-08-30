require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testSimpleMessage() {
  console.log('🧪 Testing Simple WhatsApp Message with Upload Link\n');
  
  // Use the correct phone number
  const testPhoneNumber = '+918130026321';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  console.log('📱 Testing with phone number:', testPhoneNumber);
  console.log('🌐 Frontend URL:', frontendUrl);
  
  const uploadUrl = `${frontendUrl}/vendor-upload?phone=${encodeURIComponent(testPhoneNumber)}`;
  
  try {
    console.log('\n📤 Sending simple message with upload link...');
    
    const message = `📸 Hello! 

Would you like to upload photos for your laari? This will help customers see your delicious food and make your business stand out on the map!

📤 Click the link below to upload your photos:
${uploadUrl}

This will take you directly to your vendor dashboard where you can upload your profile picture and business images.`;
    
    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${testPhoneNumber}`
    });
    
    console.log('\n✅ Simple message sent successfully!');
    console.log('📊 Result:', result.sid);
    console.log('📊 Status:', result.status);
    
    console.log('\n📋 Upload URL generated:');
    console.log(uploadUrl);
    
    console.log('\n📋 Next steps:');
    console.log('1. Check WhatsApp for the message on', testPhoneNumber);
    console.log('2. Click the upload link');
    console.log('3. Test the photo upload functionality');
    
  } catch (error) {
    console.error('\n❌ Error sending simple message:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSimpleMessage();
}

module.exports = { testSimpleMessage };

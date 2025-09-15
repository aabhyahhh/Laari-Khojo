require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function checkMessageStatus() {
  console.log('🔍 Checking WhatsApp Message Status\n');
  
  // Check the last message sent
  try {
    const messages = await twilioClient.messages.list({
      limit: 5,
      to: 'whatsapp:+91918130026321'
    });
    
    console.log(`📊 Found ${messages.length} messages to the test number:\n`);
    
    messages.forEach((message, index) => {
      console.log(`Message ${index + 1}:`);
      console.log('  SID:', message.sid);
      console.log('  Status:', message.status);
      console.log('  Date Created:', message.dateCreated);
      console.log('  Date Sent:', message.dateSent);
      console.log('  Error Code:', message.errorCode);
      console.log('  Error Message:', message.errorMessage);
      console.log('  Body:', message.body.substring(0, 100) + '...');
      console.log('');
    });
    
    // Check if any messages failed
    const failedMessages = messages.filter(msg => msg.status === 'failed');
    if (failedMessages.length > 0) {
      console.log('❌ Failed Messages:');
      failedMessages.forEach(msg => {
        console.log(`  - ${msg.sid}: ${msg.errorMessage} (Code: ${msg.errorCode})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking messages:', error.message);
  }
  
  // Check account status
  try {
    const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('\n📊 Account Status:');
    console.log('  Status:', account.status);
    console.log('  Type:', account.type);
    console.log('  Date Created:', account.dateCreated);
  } catch (error) {
    console.error('❌ Error checking account:', error.message);
  }
  
  // Check WhatsApp number status
  console.log('\n📱 WhatsApp Number Info:');
  console.log('  From Number:', process.env.TWILIO_WHATSAPP_NUMBER);
  console.log('  To Number:', '+91918130026321');
  console.log('  Template ID:', process.env.WHATSAPP_PHOTO_UPLOAD_TEMPLATE_ID);
  
  console.log('\n💡 Troubleshooting Tips:');
  console.log('1. Check if the recipient number is opted-in to WhatsApp');
  console.log('2. Verify the template is approved for production');
  console.log('3. Check if the recipient has blocked your WhatsApp number');
  console.log('4. Ensure the phone number format is correct (+91XXXXXXXXXX)');
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkMessageStatus();
}

module.exports = { checkMessageStatus };

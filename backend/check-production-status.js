require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function checkProductionStatus() {
  console.log('🔍 Checking Production WhatsApp Status\n');
  
  const testPhoneNumber = '+918130026321';
  
  console.log('📱 Test Phone Number:', testPhoneNumber);
  console.log('📤 From WhatsApp Number:', process.env.TWILIO_WHATSAPP_NUMBER);
  console.log('🏢 Account SID:', process.env.TWILIO_ACCOUNT_SID);
  
  try {
    // Check recent messages to this number
    console.log('\n📊 Checking recent messages...');
    const messages = await twilioClient.messages.list({
      limit: 10,
      to: `whatsapp:${testPhoneNumber}`
    });
    
    console.log(`Found ${messages.length} recent messages:\n`);
    
    messages.forEach((message, index) => {
      console.log(`Message ${index + 1}:`);
      console.log('  SID:', message.sid);
      console.log('  Status:', message.status);
      console.log('  Error Code:', message.errorCode);
      console.log('  Error Message:', message.errorMessage);
      console.log('  Date Created:', message.dateCreated);
      console.log('  Date Sent:', message.dateSent);
      console.log('  Body Preview:', message.body.substring(0, 100) + '...');
      console.log('');
    });
    
    // Check account status
    console.log('📊 Account Status:');
    const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('  Status:', account.status);
    console.log('  Type:', account.type);
    console.log('  Date Created:', account.dateCreated);
    
    // Check if this is a trial account
    if (account.type === 'Trial') {
      console.log('\n⚠️ WARNING: This is a TRIAL account!');
      console.log('💡 For production WhatsApp, you need:');
      console.log('   1. A paid Twilio account');
      console.log('   2. WhatsApp Business API approval');
      console.log('   3. Recipients must opt-in');
    }
    
    console.log('\n🔧 Production WhatsApp Troubleshooting:');
    console.log('1. Check if recipient has opted-in to your business');
    console.log('2. Verify your WhatsApp Business account is approved');
    console.log('3. Ensure you\'re using approved message templates');
    console.log('4. Check if the recipient has blocked your number');
    console.log('5. Verify the phone number format is correct');
    
    // Check for specific error codes
    const failedMessages = messages.filter(msg => msg.status === 'failed' || msg.errorCode);
    if (failedMessages.length > 0) {
      console.log('\n❌ Failed Messages Analysis:');
      failedMessages.forEach(msg => {
        console.log(`  - ${msg.sid}: ${msg.errorMessage} (Code: ${msg.errorCode})`);
        
        // Common error code explanations
        switch(msg.errorCode) {
          case '63024':
            console.log('    💡 Solution: Recipient needs to opt-in to your business');
            break;
          case '63025':
            console.log('    💡 Solution: Message template not approved');
            break;
          case '63026':
            console.log('    💡 Solution: Business account not verified');
            break;
          case '63027':
            console.log('    💡 Solution: Rate limit exceeded');
            break;
          default:
            console.log('    💡 Check Twilio documentation for error code details');
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking status:', error.message);
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkProductionStatus();
}

module.exports = { checkProductionStatus };


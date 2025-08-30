require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendBulkTestVendors() {
  console.log('📤 Sending WhatsApp Messages to Test Vendor List\n');
  
  // Test vendor list - add your vendor phone numbers here
  const testVendors = [
    { name: 'Test Vendor 1', phone: '+918130026321' },
    // Add more vendors here in the format:
    // { name: 'Vendor Name', phone: '+91XXXXXXXXXX' },
    // { name: 'Another Vendor', phone: '+91XXXXXXXXXX' },
  ];
  
  if (testVendors.length === 0) {
    console.log('❌ No test vendors configured. Please add vendor phone numbers to the testVendors array.');
    return;
  }
  
  console.log(`📊 Found ${testVendors.length} test vendors`);
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  let successCount = 0;
  let errorCount = 0;
  
  console.log(`\n📤 Sending messages to ${testVendors.length} vendors...\n`);
  
  for (const vendor of testVendors) {
    try {
      // Validate phone number format
      let phoneNumber = vendor.phone;
      
      // Remove any non-digit characters
      phoneNumber = phoneNumber.replace(/\D/g, '');
      
      // Ensure it's a 10-digit number
      if (phoneNumber.length === 10 && phoneNumber.match(/^[789]\d{9}$/)) {
        phoneNumber = `+91${phoneNumber}`;
      } else if (phoneNumber.length === 12 && phoneNumber.startsWith('91')) {
        phoneNumber = `+${phoneNumber}`;
      } else {
        console.log(`⚠️ Skipping ${vendor.name}: Invalid phone format ${vendor.phone}`);
        errorCount++;
        continue;
      }
      
      const uploadUrl = `${frontendUrl}/vendor-upload?phone=${encodeURIComponent(phoneNumber)}`;
      
      console.log(`📤 Sending to ${vendor.name} (${phoneNumber})...`);
      
      // Create personalized message
      const message = `📸 Hello ${vendor.name}! 

Would you like to upload photos for your laari? This will help customers see your delicious food and make your business stand out on the map!

📤 Click the link below to upload your photos:
${uploadUrl}

This will take you directly to your vendor dashboard where you can upload your profile picture and business images.`;
      
      // Send the message
      const result = await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${phoneNumber}`
      });
      
      console.log(`✅ Sent to ${vendor.name} (${result.sid})`);
      successCount++;
      
      // Add delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error(`❌ Error sending to ${vendor.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully sent: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📸 Total vendors: ${testVendors.length}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Bulk messaging campaign completed!');
    console.log('📋 Next steps:');
    console.log('1. Monitor WhatsApp for responses');
    console.log('2. Check vendor upload page analytics');
    console.log('3. Follow up with vendors who haven\'t uploaded photos');
  }
}

// Run the bulk campaign if this file is executed directly
if (require.main === module) {
  sendBulkTestVendors();
}

module.exports = { sendBulkTestVendors };


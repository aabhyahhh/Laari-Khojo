require('dotenv').config();
const { sendText, sendTemplate, validateMetaConfig } = require('../services/metaWhatsAppService');

async function testMetaWhatsApp() {
  console.log('🧪 Testing Meta API WhatsApp Integration\n');

  // Test 1: Validate configuration
  console.log('1. Testing configuration validation...');
  const configValid = validateMetaConfig();
  if (!configValid) {
    console.error('❌ Configuration validation failed');
    return;
  }
  console.log('✅ Configuration validation passed\n');

  // Test 2: Send a simple text message
  console.log('2. Testing text message...');
  try {
    const testPhone = process.env.TEST_PHONE_NUMBER || '+919876543210';
    const testMessage = 'Hello from Meta API! This is a test message from Laari Khojo.';
    
    console.log(`📤 Sending test message to: ${testPhone}`);
    const result = await sendText(testPhone, testMessage);
    console.log('✅ Text message sent successfully');
    console.log('📄 Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Text message failed:', error.message);
  }
  console.log('');

  // Test 3: Send a template message
  console.log('3. Testing template message...');
  try {
    const testPhone = process.env.TEST_PHONE_NUMBER || '+919876543210';
    const templateName = process.env.WHATSAPP_REVIEW_TEMPLATE_NAME || 'new_review_rating_notif_to_vendor_util';
    
    console.log(`📤 Sending template message to: ${testPhone}`);
    console.log(`📝 Using template: ${templateName}`);
    
    const components = [
      {
        type: "body",
        parameters: [
          { type: "text", text: "5" },
          { type: "text", text: "Great service! Very tasty food." },
          { type: "text", text: "John Doe" }
        ]
      }
    ];
    
    const result = await sendTemplate(testPhone, templateName, "en", components);
    console.log('✅ Template message sent successfully');
    console.log('📄 Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Template message failed:', error.message);
  }
  console.log('');

  console.log('🎉 Meta API WhatsApp testing completed!');
}

// Run the test
testMetaWhatsApp().catch(console.error);


require('dotenv').config();
const { 
  sendText, 
  sendTemplate, 
  validateMetaConfig,
  sendReviewNotification 
} = require('./services/metaWhatsAppService');

async function testMetaIntegration() {
  console.log('🧪 Testing Meta WhatsApp Business API Integration\n');

  // Validate configuration
  console.log('🔧 Validating Meta API configuration...');
  if (!validateMetaConfig()) {
    console.log('❌ Meta API configuration is invalid. Please check your environment variables:');
    console.log('- WHATSAPP_TOKEN');
    console.log('- WHATSAPP_PHONE_NUMBER_ID');
    console.log('- GRAPH_API_VERSION (optional, defaults to v21.0)');
    return;
  }
  console.log('✅ Meta API configuration is valid\n');

  // Test phone number - update this with a valid WhatsApp number for testing
  const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '+918130026321';
  
  console.log(`📱 Test phone number: ${testPhoneNumber}`);
  console.log('⚠️  Make sure this number is registered with WhatsApp and can receive messages\n');

  try {
    // Test 1: Send a simple text message
    console.log('📤 Test 1: Sending simple text message...');
    const textMessage = 'Hello! This is a test message from LaariKhojo using Meta WhatsApp Business API. 🚀';
    
    const textResult = await sendText(testPhoneNumber, textMessage);
    console.log('✅ Text message sent successfully');
    console.log('📄 Response:', JSON.stringify(textResult, null, 2));
    
    // Wait a bit before next test
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Send a template message (if template exists)
    console.log('\n📤 Test 2: Sending template message...');
    const templateName = process.env.WHATSAPP_REVIEW_TEMPLATE_NAME || 'review_notification';
    
    try {
      // Example template components for review notification
      const components = [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: "5" // rating
            },
            {
              type: "text", 
              text: "Great food and service!" // comment
            },
            {
              type: "text",
              text: "Test Customer" // reviewer name
            }
          ]
        }
      ];

      const templateResult = await sendTemplate(testPhoneNumber, templateName, "en", components);
      console.log('✅ Template message sent successfully');
      console.log('📄 Response:', JSON.stringify(templateResult, null, 2));
    } catch (templateError) {
      console.log('⚠️ Template message failed (this is normal if template is not approved):', templateError.message);
      console.log('💡 To use templates, create and approve them in WhatsApp Manager first');
    }

    // Wait a bit before next test
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Send review notification
    console.log('\n📤 Test 3: Sending review notification...');
    try {
      const reviewData = {
        rating: 4,
        comment: 'Delicious street food! Highly recommended.',
        reviewerName: 'Happy Customer'
      };

      const reviewResult = await sendReviewNotification(testPhoneNumber, reviewData);
      console.log('✅ Review notification sent successfully');
      console.log('📄 Response:', JSON.stringify(reviewResult, null, 2));
    } catch (reviewError) {
      console.log('⚠️ Review notification failed (template may not be approved):', reviewError.message);
    }

    console.log('\n🎉 Meta WhatsApp Business API integration test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Check your WhatsApp to confirm messages were received');
    console.log('2. Create and approve message templates in WhatsApp Manager if needed');
    console.log('3. Update webhook URL to point to your Meta API endpoint');
    console.log('4. Test webhook functionality with actual Meta webhook payloads');

  } catch (error) {
    console.error('❌ Error during Meta API integration test:', error.message);
    console.error('📄 Error details:', error);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Authentication error - check your WHATSAPP_TOKEN');
    } else if (error.message.includes('400')) {
      console.log('\n💡 Bad request - check phone number format and API parameters');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Permission denied - check your phone number ID and token permissions');
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMetaIntegration().catch(console.error);
}

module.exports = { testMetaIntegration };

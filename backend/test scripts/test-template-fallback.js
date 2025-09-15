const { sendReviewNotification, validateMetaConfig } = require('../services/metaWhatsAppService');

async function testTemplateAndFallback() {
  console.log('🧪 Testing Template and Fallback Functionality\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('   WHATSAPP_REVIEW_TEMPLATE_NAME:', process.env.WHATSAPP_REVIEW_TEMPLATE_NAME || 'NOT SET');
  console.log('   WHATSAPP_TOKEN:', process.env.WHATSAPP_TOKEN ? 'SET' : 'NOT SET');
  console.log('   WHATSAPP_PHONE_NUMBER_ID:', process.env.WHATSAPP_PHONE_NUMBER_ID ? 'SET' : 'NOT SET');
  
  // Validate Meta API configuration
  console.log('\n🔧 Meta API Configuration:');
  const configValid = validateMetaConfig();
  if (!configValid) {
    console.log('❌ Meta API configuration missing');
    return;
  }
  console.log('✅ Meta API configuration found');
  
  // Test phone number (replace with actual test number)
  const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '918130026321';
  
  // Sample review data
  const reviewData = {
    rating: 4,
    comment: 'Test review for template testing',
    reviewerName: 'Test User'
  };
  
  console.log('\n📱 Test Details:');
  console.log('   Phone Number:', testPhoneNumber);
  console.log('   Review Data:', reviewData);
  console.log('   Template Name:', process.env.WHATSAPP_REVIEW_TEMPLATE_NAME || 'None (will use text message)');
  
  try {
    console.log('\n📤 Testing review notification...');
    
    // This will try template first, then fall back to text if template fails
    const result = await sendReviewNotification(testPhoneNumber, reviewData);
    
    console.log('✅ Review notification completed successfully!');
    console.log('📋 Result:', result);
    
  } catch (error) {
    console.error('❌ Error testing review notification:', error.message);
    
    if (error.message.includes('Template name does not exist')) {
      console.log('\n💡 Solution: The template name is incorrect or not approved');
      console.log('   - Check template name in Meta Developer Console');
      console.log('   - Ensure template is approved');
      console.log('   - The system will automatically fall back to text messages');
    }
  }
}

// Test different template names
function testTemplateNames() {
  console.log('\n🧪 Testing Different Template Names\n');
  
  const testTemplates = [
    'new_review_rating_notif_to_vendor_util',
    'review_notification',
    'review_alert',
    'vendor_review_notification'
  ];
  
  testTemplates.forEach(templateName => {
    console.log(`📝 Template: ${templateName}`);
    console.log(`   Status: ${templateName === 'new_review_rating_notif_to_vendor_util' ? '✅ CORRECT' : '❌ INCORRECT'}`);
  });
  
  console.log('\n💡 Recommendation: Use "new_review_rating_notif_to_vendor_util" as your template name');
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Template and Fallback Tests\n');
  
  testTemplateNames();
  await testTemplateAndFallback();
  
  console.log('\n✨ All tests completed!');
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testTemplateAndFallback,
  testTemplateNames,
  runAllTests
};

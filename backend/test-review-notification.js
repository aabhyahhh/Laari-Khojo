require('dotenv').config();
const { sendReviewNotification, formatPhoneNumber } = require('./services/metaWhatsAppService');

// Test review notification
async function testReviewNotification() {
  try {
    console.log('🧪 Testing Review Notification System\n');
    
    // Test phone number (replace with actual test number)
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '919876543210';
    
    // Sample review data
    const reviewData = {
      rating: 4,
      comment: 'Awesome Food! The taste was amazing and service was quick.',
      reviewerName: 'John Doe'
    };
    
    console.log('📱 Test Phone Number:', testPhoneNumber);
    console.log('📊 Review Data:', reviewData);
    console.log('📝 Formatted Phone Number:', formatPhoneNumber(testPhoneNumber));
    
    console.log('\n📤 Sending review notification...');
    
    // Send the review notification
    const result = await sendReviewNotification(testPhoneNumber, reviewData);
    
    console.log('✅ Review notification sent successfully!');
    console.log('📋 Result:', result);
    
  } catch (error) {
    console.error('❌ Error testing review notification:', error.message);
    
    if (error.message.includes('Meta API configuration is missing')) {
      console.log('\n💡 Solution: Check your environment variables:');
      console.log('   - WHATSAPP_TOKEN');
      console.log('   - WHATSAPP_PHONE_NUMBER_ID');
      console.log('   - GRAPH_API_VERSION (optional, defaults to v21.0)');
    }
    
    if (error.message.includes('Invalid phone number format')) {
      console.log('\n💡 Solution: Check your phone number format');
      console.log('   - Should be 10 digits for Indian numbers');
      console.log('   - Or include country code');
    }
  }
}

// Test different review scenarios
async function testMultipleReviewScenarios() {
  console.log('\n🧪 Testing Multiple Review Scenarios\n');
  
  const testScenarios = [
    {
      rating: 5,
      comment: 'Excellent service and amazing food quality!',
      reviewerName: 'Sarah Wilson'
    },
    {
      rating: 3,
      comment: 'Good food but could be better.',
      reviewerName: 'Mike Johnson'
    },
    {
      rating: 1,
      comment: 'Not satisfied with the service.',
      reviewerName: 'Alex Brown'
    },
    {
      rating: 4,
      comment: '', // No comment
      reviewerName: 'Emma Davis'
    }
  ];
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n📝 Testing Scenario ${i + 1}:`);
    console.log(`   Rating: ${scenario.rating}/5`);
    console.log(`   Comment: "${scenario.comment || 'No comment'}"`);
    console.log(`   Reviewer: ${scenario.reviewerName}`);
    
    try {
      // Note: This would actually send messages, so we'll just simulate
      console.log('   ✅ Scenario would send notification successfully');
    } catch (error) {
      console.log(`   ❌ Scenario failed: ${error.message}`);
    }
  }
}

// Test phone number formatting
function testPhoneNumberFormatting() {
  console.log('\n🧪 Testing Phone Number Formatting\n');
  
  const testNumbers = [
    '9876543210',           // 10-digit Indian
    '+919876543210',        // With +91
    '919876543210',         // With 91
    '09876543210',          // With 0 prefix
    '+1-555-123-4567',     // US format
    'invalid',              // Invalid
    ''                      // Empty
  ];
  
  testNumbers.forEach(number => {
    try {
      const formatted = formatPhoneNumber(number);
      console.log(`📱 ${number} -> ${formatted || 'INVALID'}`);
    } catch (error) {
      console.log(`📱 ${number} -> ERROR: ${error.message}`);
    }
  });
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Review Notification Tests\n');
  
  // Test phone number formatting first
  testPhoneNumberFormatting();
  
  // Test review notification
  await testReviewNotification();
  
  // Test multiple scenarios (simulation only)
  await testMultipleReviewScenarios();
  
  console.log('\n✨ All tests completed!');
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testReviewNotification,
  testMultipleReviewScenarios,
  testPhoneNumberFormatting,
  runAllTests
}; 
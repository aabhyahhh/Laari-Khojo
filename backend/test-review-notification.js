require('dotenv').config();
const { sendReviewNotification, validateMetaConfig } = require('./services/metaWhatsAppService');

// Test phone number (replace with your WhatsApp number)
const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '8130026321'; // Removed +91 to test formatting

async function testReviewNotification() {
  console.log('Testing Meta API WhatsApp Review Notification functionality...\n');

  // Test 1: Check environment variables
  console.log('1. Checking environment variables...');
  const configValid = validateMetaConfig();
  if (!configValid) {
    console.log('❌ Meta API configuration missing');
    return;
  }
  console.log('✅ Meta API configuration found');

  // Test 2: Test review notification with template
  console.log('\n2. Testing review notification with template...');
  
  try {
    const reviewData = {
      rating: 5,
      comment: 'Amazing food! The chaat was delicious and the service was great. Highly recommended!',
      reviewerName: 'John Doe'
    };

    console.log('Sending review notification with data:', reviewData);
    
    if (process.env.NODE_ENV === 'production') {
      // Send via WhatsApp template
      const response = await sendReviewNotification(testPhoneNumber, reviewData);
      console.log('✅ WhatsApp template message sent successfully');
      console.log('Message ID:', response.messages?.[0]?.id || 'N/A');
    } else {
      console.log('✅ Development mode - Review notification logged to console');
      console.log(`Review notification for ${testPhoneNumber}:`);
      console.log(`Rating: ${reviewData.rating}/5`);
      console.log(`Comment: "${reviewData.comment}"`);
      console.log(`Reviewer: ${reviewData.reviewerName}`);
      console.log('Template Name:', process.env.WHATSAPP_REVIEW_TEMPLATE_NAME || 'review_notification');
    }

  } catch (error) {
    console.error('❌ Error sending WhatsApp review notification:', error.message);
    
    if (error.message.includes('Invalid access token')) {
      console.log('💡 Tip: Check your WHATSAPP_TOKEN in environment variables');
    } else if (error.message.includes('Phone number ID')) {
      console.log('💡 Tip: Check your WHATSAPP_PHONE_NUMBER_ID in environment variables');
    } else if (error.message.includes('Template')) {
      console.log('💡 Tip: Check if the template name is correct and approved');
      console.log('💡 Tip: Make sure the template variables match the template structure');
    }
  }

  // Test 3: Test with different review data
  console.log('\n3. Testing with different review data...');
  
  try {
    const reviewData2 = {
      rating: 3,
      comment: 'Food was okay, but could be better. Service was slow.',
      reviewerName: 'Jane Smith'
    };

    console.log('Sending second review notification with data:', reviewData2);
    
    if (process.env.NODE_ENV === 'production') {
      const response = await sendReviewNotification(testPhoneNumber, reviewData2);
      console.log('✅ Second WhatsApp template message sent successfully');
      console.log('Message ID:', response.messages?.[0]?.id || 'N/A');
    } else {
      console.log('✅ Development mode - Second review notification logged to console');
      console.log(`Second review notification for ${testPhoneNumber}:`);
      console.log(`Rating: ${reviewData2.rating}/5`);
      console.log(`Comment: "${reviewData2.comment}"`);
      console.log(`Reviewer: ${reviewData2.reviewerName}`);
    }

  } catch (error) {
    console.error('❌ Error sending second WhatsApp review notification:', error.message);
  }

  console.log('\n📋 Next steps:');
  console.log('1. Make sure your Meta API templates are approved');
  console.log('2. Test with a real phone number');
  console.log('3. Verify the template name is correct and approved');
  console.log('4. Check that template variables match the template structure');
  console.log('5. Test the full review submission flow through the API');
  console.log('6. Verify your business is approved by Meta');
}

// Run the test
testReviewNotification().catch(console.error); 
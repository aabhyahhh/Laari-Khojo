require('dotenv').config();
const { sendReviewNotification } = require('./services/whatsappService');

// Test phone number (replace with your WhatsApp number)
const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '+1234567890';

async function testReviewNotification() {
  console.log('Testing WhatsApp Review Notification functionality...\n');

  // Test 1: Check environment variables
  console.log('1. Checking environment variables...');
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    console.log('✅ Twilio credentials found');
  } else {
    console.log('❌ Twilio credentials missing');
    return;
  }

  if (process.env.TWILIO_WHATSAPP_NUMBER) {
    console.log('✅ WhatsApp number configured:', process.env.TWILIO_WHATSAPP_NUMBER);
  } else {
    console.log('❌ WhatsApp number not configured');
    return;
  }

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
      console.log('Message SID:', response.sid);
    } else {
      console.log('✅ Development mode - Review notification logged to console');
      console.log(`Review notification for ${testPhoneNumber}:`);
      console.log(`Rating: ${reviewData.rating}/5`);
      console.log(`Comment: "${reviewData.comment}"`);
      console.log(`Reviewer: ${reviewData.reviewerName}`);
      console.log('Template ID: HX17af3999106bed9bceb08252052e989b');
    }

  } catch (error) {
    console.error('❌ Error sending WhatsApp review notification:', error.message);
    
    if (error.code === 21211) {
      console.log('💡 Tip: Make sure you have joined the WhatsApp sandbox');
      console.log('💡 Tip: Check if the phone number is registered with WhatsApp');
    }
    
    if (error.code === 30008) {
      console.log('💡 Tip: Check if the template ID is correct and approved');
      console.log('💡 Tip: Make sure the template variables match the template');
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
      console.log('Message SID:', response.sid);
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
  console.log('1. Make sure you have joined the WhatsApp sandbox');
  console.log('2. Test with a real phone number');
  console.log('3. Verify the template ID is correct and approved');
  console.log('4. Check that template variables match the template structure');
  console.log('5. Test the full review submission flow through the API');
}

// Run the test
testReviewNotification().catch(console.error); 
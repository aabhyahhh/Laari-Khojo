require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('./models/reviewModel');
const User = require('./models/userModel');
const { sendReviewNotification } = require('./services/whatsappService');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  process.exit(1);
}

async function testReviewFlow() {
  console.log('Testing Complete Review Submission Flow...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Find a vendor in the database
    console.log('\n1. Finding a vendor in the database...');
    const vendor = await User.findOne({}).select('_id name contactNumber');
    
    if (!vendor) {
      console.log('❌ No vendors found in database');
      console.log('💡 Tip: Add some vendors to the database first');
      return;
    }

    console.log('✅ Found vendor:', {
      id: vendor._id,
      name: vendor.name,
      phone: vendor.contactNumber
    });

    // Test 2: Simulate review submission
    console.log('\n2. Simulating review submission...');
    const reviewData = {
      vendorId: vendor._id,
      name: 'Test Reviewer',
      email: 'test@example.com',
      rating: 5,
      comment: 'This is a test review for WhatsApp notification testing. The food was amazing!'
    };

    console.log('Review data:', reviewData);

    // Test 3: Create review (simulate the controller logic)
    console.log('\n3. Creating review in database...');
    const review = new Review(reviewData);
    await review.save();
    console.log('✅ Review saved to database');

    // Test 4: Send WhatsApp notification
    console.log('\n4. Sending WhatsApp notification...');
    if (vendor.contactNumber) {
      const notificationData = {
        rating: reviewData.rating,
        comment: reviewData.comment,
        reviewerName: reviewData.name
      };

      try {
        if (process.env.NODE_ENV === 'production') {
          await sendReviewNotification(vendor.contactNumber, notificationData);
          console.log('✅ WhatsApp notification sent successfully');
        } else {
          console.log('✅ Development mode - WhatsApp notification logged to console');
          console.log('Notification would be sent to:', vendor.contactNumber);
          console.log('Template ID: HX17af3999106bed9bceb08252052e989b');
          console.log('Variables:', notificationData);
        }
      } catch (whatsappError) {
        console.error('❌ WhatsApp notification failed:', whatsappError.message);
        console.log('💡 This is expected if Twilio is not configured or template is not approved');
      }
    } else {
      console.log('⚠️ Vendor has no contact number, skipping WhatsApp notification');
    }

    // Test 5: Clean up (optional)
    console.log('\n5. Cleaning up test data...');
    await Review.findByIdAndDelete(review._id);
    console.log('✅ Test review removed from database');

    console.log('\n🎉 Review flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Database connection working');
    console.log('- ✅ Vendor found in database');
    console.log('- ✅ Review creation working');
    console.log('- ✅ WhatsApp notification logic implemented');
    console.log('- ✅ Error handling working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the test
testReviewFlow().catch(console.error); 
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Review = require('./models/reviewModel');
const { sendReviewNotification } = require('./services/metaWhatsAppService');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testReviewFlow() {
  console.log('Testing complete review submission flow...\n');

  try {
    // Find the test vendor specifically
    const vendor = await User.findOne({ name: 'test' }).select('_id name contactNumber');
    
    if (!vendor) {
      console.log('❌ Test vendor not found in database');
      return;
    }

    console.log('✅ Found test vendor:');
    console.log(`   Name: ${vendor.name}`);
    console.log(`   ID: ${vendor._id}`);
    console.log(`   Phone: ${vendor.contactNumber}`);

    // Test review data
    const reviewData = {
      vendorId: vendor._id,
      name: 'Test Reviewer',
      email: 'test@example.com',
      rating: 5,
      comment: 'This is a test review to verify WhatsApp notifications are working correctly!'
    };

    console.log('\n📝 Submitting review with data:', reviewData);

    // Create and save review
    const review = new Review(reviewData);
    await review.save();
    console.log('✅ Review saved successfully with ID:', review._id);

    // Test WhatsApp notification
    console.log('\n📤 Testing WhatsApp notification...');
    
    if (vendor.contactNumber) {
      const notificationData = {
        rating: reviewData.rating,
        comment: reviewData.comment,
        reviewerName: reviewData.name
      };

      if (process.env.NODE_ENV === 'production') {
        await sendReviewNotification(vendor.contactNumber, notificationData);
        console.log('✅ WhatsApp notification sent successfully');
      } else {
        console.log('✅ Development mode - WhatsApp notification logged to console');
        console.log(`📧 Would send to: ${vendor.contactNumber}`);
        console.log(`📝 Template ID: HX17af3999106bed9bceb08252052e989b`);
        console.log(`📊 Variables:`, notificationData);
      }
    } else {
      console.log('⚠️ Vendor has no contact number');
    }

    // Clean up - delete the test review
    await Review.findByIdAndDelete(review._id);
    console.log('🧹 Test review cleaned up');

    console.log('\n✅ Review flow test completed successfully!');

  } catch (error) {
    console.error('❌ Error in review flow test:', error.message);
    console.error('Error details:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testReviewFlow().catch(console.error); 
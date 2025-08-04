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

async function sendExistingReviews() {
  console.log('🚀 Starting to send WhatsApp notifications for existing reviews...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all reviews with vendor information
    console.log('\n1. Fetching all reviews from database...');
    const reviews = await Review.find({}).populate('vendorId', 'name contactNumber');
    
    if (reviews.length === 0) {
      console.log('❌ No reviews found in database');
      return;
    }

    console.log(`✅ Found ${reviews.length} reviews in database`);

    // Group reviews by vendor to avoid spam
    const vendorReviews = {};
    reviews.forEach(review => {
      const vendorId = review.vendorId._id.toString();
      if (!vendorReviews[vendorId]) {
        vendorReviews[vendorId] = {
          vendor: review.vendorId,
          reviews: []
        };
      }
      vendorReviews[vendorId].reviews.push(review);
    });

    console.log(`📊 Reviews grouped by ${Object.keys(vendorReviews).length} vendors`);

    // Process each vendor
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const [vendorId, vendorData] of Object.entries(vendorReviews)) {
      const vendor = vendorData.vendor;
      const reviews = vendorData.reviews;

      console.log(`\n📱 Processing vendor: ${vendor.name} (${vendor.contactNumber || 'No phone'})`);
      console.log(`   Found ${reviews.length} reviews for this vendor`);

      if (!vendor.contactNumber) {
        console.log('   ⚠️ Skipping - no contact number available');
        skippedCount++;
        continue;
      }

      // Send notification for the most recent review (to avoid spam)
      const mostRecentReview = reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      
      console.log(`   📤 Sending notification for most recent review (${new Date(mostRecentReview.createdAt).toLocaleDateString()})`);

      try {
        const notificationData = {
          rating: mostRecentReview.rating,
          comment: mostRecentReview.comment || 'No comment provided',
          reviewerName: mostRecentReview.name
        };

        if (process.env.NODE_ENV === 'production') {
          await sendReviewNotification(vendor.contactNumber, notificationData);
          console.log('   ✅ WhatsApp notification sent successfully');
          successCount++;
        } else {
          console.log('   ✅ Development mode - notification logged to console');
          console.log(`   📧 Would send to: ${vendor.contactNumber}`);
          console.log(`   📝 Template ID: HX17af3999106bed9bceb08252052e989b`);
          console.log(`   📊 Variables:`, notificationData);
          successCount++;
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`   ❌ Failed to send notification: ${error.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully processed: ${successCount} vendors`);
    console.log(`❌ Errors: ${errorCount} vendors`);
    console.log(`⚠️ Skipped (no phone): ${skippedCount} vendors`);
    console.log(`📱 Total vendors with reviews: ${Object.keys(vendorReviews).length}`);

    if (errorCount > 0) {
      console.log('\n💡 Tips for errors:');
      console.log('- Check if phone numbers are in correct format (+91XXXXXXXXXX)');
      console.log('- Verify Twilio credentials are set correctly');
      console.log('- Ensure template is approved in Twilio console');
      console.log('- Check if vendors have joined WhatsApp sandbox');
    }

    console.log('\n🎉 Process completed!');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the script
sendExistingReviews().catch(console.error); 
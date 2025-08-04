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

async function sendAllExistingReviews() {
  console.log('🚀 Starting to send WhatsApp notifications for ALL existing reviews...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all reviews with vendor information
    console.log('\n1. Fetching all reviews from database...');
    const reviews = await Review.find({}).populate('vendorId', 'name contactNumber').sort({ createdAt: -1 });
    
    if (reviews.length === 0) {
      console.log('❌ No reviews found in database');
      return;
    }

    console.log(`✅ Found ${reviews.length} reviews in database`);

    // Process each review
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let processedVendors = new Set();

    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      const vendor = review.vendorId;

      console.log(`\n📱 Processing review ${i + 1}/${reviews.length}:`);
      console.log(`   Vendor: ${vendor.name} (${vendor.contactNumber || 'No phone'})`);
      console.log(`   Reviewer: ${review.name}`);
      console.log(`   Rating: ${review.rating}/5`);
      console.log(`   Date: ${new Date(review.createdAt).toLocaleDateString()}`);

      if (!vendor.contactNumber) {
        console.log('   ⚠️ Skipping - no contact number available');
        skippedCount++;
        continue;
      }

      // Check if we've already sent a notification to this vendor recently
      const vendorKey = vendor._id.toString();
      if (processedVendors.has(vendorKey)) {
        console.log('   ⚠️ Skipping - already sent notification to this vendor (to avoid spam)');
        skippedCount++;
        continue;
      }

      try {
        const notificationData = {
          rating: review.rating,
          comment: review.comment || 'No comment provided',
          reviewerName: review.name
        };

        if (process.env.NODE_ENV === 'production') {
          await sendReviewNotification(vendor.contactNumber, notificationData);
          console.log('   ✅ WhatsApp notification sent successfully');
          successCount++;
          processedVendors.add(vendorKey);
        } else {
          console.log('   ✅ Development mode - notification logged to console');
          console.log(`   📧 Would send to: ${vendor.contactNumber}`);
          console.log(`   📝 Template ID: HX17af3999106bed9bceb08252052e989b`);
          console.log(`   📊 Variables:`, notificationData);
          successCount++;
          processedVendors.add(vendorKey);
        }

        // Add a delay to avoid rate limiting (longer delay for production)
        const delay = process.env.NODE_ENV === 'production' ? 2000 : 500;
        await new Promise(resolve => setTimeout(resolve, delay));

      } catch (error) {
        console.error(`   ❌ Failed to send notification: ${error.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully processed: ${successCount} reviews`);
    console.log(`❌ Errors: ${errorCount} reviews`);
    console.log(`⚠️ Skipped (no phone/already sent): ${skippedCount} reviews`);
    console.log(`📱 Total reviews in database: ${reviews.length}`);
    console.log(`👥 Unique vendors notified: ${processedVendors.size}`);

    if (errorCount > 0) {
      console.log('\n💡 Tips for errors:');
      console.log('- Check if phone numbers are in correct format (+91XXXXXXXXXX)');
      console.log('- Verify Twilio credentials are set correctly');
      console.log('- Ensure template is approved in Twilio console');
      console.log('- Check if vendors have joined WhatsApp sandbox');
      console.log('- Consider rate limiting if sending many notifications');
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
sendAllExistingReviews().catch(console.error); 
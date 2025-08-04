require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('./models/reviewModel');
const User = require('./models/userModel');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  process.exit(1);
}

async function checkExistingReviews() {
  console.log('🔍 Checking existing reviews in database...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all reviews with vendor information
    console.log('\n1. Fetching all reviews...');
    const reviews = await Review.find({}).populate('vendorId', 'name contactNumber email').sort({ createdAt: -1 });
    
    if (reviews.length === 0) {
      console.log('❌ No reviews found in database');
      return;
    }

    console.log(`✅ Found ${reviews.length} reviews in database`);

    // Group by vendor
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

    // Show detailed breakdown
    console.log('\n📋 Detailed breakdown:');
    console.log('='.repeat(80));

    let vendorsWithPhone = 0;
    let vendorsWithoutPhone = 0;

    for (const [vendorId, vendorData] of Object.entries(vendorReviews)) {
      const vendor = vendorData.vendor;
      const reviews = vendorData.reviews;
      const hasPhone = !!vendor.contactNumber;

      console.log(`\n🏪 Vendor: ${vendor.name}`);
      console.log(`   📧 Email: ${vendor.email || 'Not available'}`);
      console.log(`   📱 Phone: ${vendor.contactNumber || 'Not available'}`);
      console.log(`   ⭐ Reviews: ${reviews.length}`);
      console.log(`   📅 Latest review: ${new Date(reviews[0].createdAt).toLocaleDateString()}`);
      console.log(`   📅 Oldest review: ${new Date(reviews[reviews.length - 1].createdAt).toLocaleDateString()}`);
      
      if (hasPhone) {
        vendorsWithPhone++;
        console.log(`   ✅ Can receive WhatsApp notifications`);
      } else {
        vendorsWithoutPhone++;
        console.log(`   ❌ Cannot receive WhatsApp notifications (no phone)`);
      }

      // Show recent reviews
      console.log(`   📝 Recent reviews:`);
      reviews.slice(0, 3).forEach((review, index) => {
        console.log(`      ${index + 1}. ${review.rating}⭐ by ${review.name} - "${review.comment?.substring(0, 50) || 'No comment'}..."`);
      });
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log('='.repeat(80));
    console.log(`📱 Total vendors with reviews: ${Object.keys(vendorReviews).length}`);
    console.log(`✅ Vendors with phone numbers: ${vendorsWithPhone}`);
    console.log(`❌ Vendors without phone numbers: ${vendorsWithoutPhone}`);
    console.log(`📝 Total reviews: ${reviews.length}`);
    console.log(`📅 Date range: ${new Date(reviews[reviews.length - 1].createdAt).toLocaleDateString()} to ${new Date(reviews[0].createdAt).toLocaleDateString()}`);

    if (vendorsWithPhone > 0) {
      console.log(`\n🚀 Ready to send notifications to ${vendorsWithPhone} vendors!`);
      console.log(`💡 Run: node send-existing-reviews.js`);
    } else {
      console.log(`\n⚠️ No vendors have phone numbers - cannot send WhatsApp notifications`);
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the script
checkExistingReviews().catch(console.error); 
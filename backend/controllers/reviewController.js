const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const { sendReviewNotification, formatPhoneNumber } = require('../services/metaWhatsAppService');

// Add a new review
const addReview = async (req, res) => {
  try {
    const { vendorId, name, email, rating, comment } = req.body;
    if (!vendorId || !name || !email || !rating) {
      return res.status(400).json({ success: false, msg: 'Missing required fields.' });
    }
    
    console.log('📝 Adding review for vendor:', vendorId);
    console.log('📊 Review data:', { name, email, rating, comment });
    
    const review = new Review({ vendorId, name, email, rating, comment });
    await review.save();
    
    console.log('✅ Review saved successfully with ID:', review._id);
    
    // Send WhatsApp notification to vendor
    try {
      console.log('🔍 Looking up vendor with ID:', vendorId);
      
      // Get vendor details to get their phone number
      const vendor = await User.findById(vendorId);
      
      if (vendor) {
        console.log('✅ Vendor found:', vendor.name);
        console.log('📱 Vendor phone number:', vendor.contactNumber);
        
        if (vendor.contactNumber) {
          // Validate phone number format
          const formattedNumber = formatPhoneNumber(vendor.contactNumber);
          
          if (formattedNumber) {
            const reviewData = {
              rating: rating,
              comment: comment,
              reviewerName: name
            };
            
            console.log('📤 Sending WhatsApp notification with data:', reviewData);
            console.log('📱 Using formatted number:', formattedNumber);
            
            await sendReviewNotification(vendor.contactNumber, reviewData);
            console.log(`✅ WhatsApp notification sent to vendor ${vendor.name} (${formattedNumber})`);
          } else {
            console.log(`⚠️ Vendor ${vendor.name} has invalid phone number: ${vendor.contactNumber}`);
          }
        } else {
          console.log(`⚠️ Vendor ${vendor.name} has no contact number`);
        }
      } else {
        console.log(`❌ Vendor not found for ID: ${vendorId}`);
      }
    } catch (whatsappError) {
      console.error('❌ Error sending WhatsApp notification:', whatsappError.message);
      console.error('❌ Error details:', whatsappError);
      // Don't fail the review submission if WhatsApp notification fails
    }
    
    return res.status(201).json({ success: true, msg: 'Review added successfully!', data: review });
  } catch (error) {
    console.error('❌ Error adding review:', error.message);
    return res.status(500).json({ success: false, msg: 'Error adding review', error: error.message });
  }
};

// Get reviews for a vendor (most recent first)
const getReviews = async (req, res) => {
  try {
    const { vendorId } = req.query;
    if (!vendorId) {
      return res.status(400).json({ success: false, msg: 'Missing vendorId.' });
    }
    const reviews = await Review.find({ vendorId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, msg: 'Error fetching reviews', error: error.message });
  }
};

module.exports = { addReview, getReviews }; 
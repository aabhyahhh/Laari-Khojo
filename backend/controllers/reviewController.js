const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const { sendReviewNotification } = require('../services/whatsappService');

// Add a new review
const addReview = async (req, res) => {
  try {
    const { vendorId, name, email, rating, comment } = req.body;
    if (!vendorId || !name || !email || !rating) {
      return res.status(400).json({ success: false, msg: 'Missing required fields.' });
    }
    
    const review = new Review({ vendorId, name, email, rating, comment });
    await review.save();
    
    // Send WhatsApp notification to vendor
    try {
      // Get vendor details to get their phone number
      const vendor = await User.findById(vendorId);
      if (vendor && vendor.contactNumber) {
        const reviewData = {
          rating: rating,
          comment: comment,
          reviewerName: name
        };
        
        await sendReviewNotification(vendor.contactNumber, reviewData);
        console.log(`WhatsApp notification sent to vendor ${vendor.name} (${vendor.contactNumber})`);
      } else {
        console.log(`Vendor not found or no contact number for vendor ID: ${vendorId}`);
      }
    } catch (whatsappError) {
      console.error('Error sending WhatsApp notification:', whatsappError);
      // Don't fail the review submission if WhatsApp notification fails
    }
    
    return res.status(201).json({ success: true, msg: 'Review added successfully!', data: review });
  } catch (error) {
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
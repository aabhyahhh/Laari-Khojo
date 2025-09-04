// Note: Webhook verification and handling moved to routes/webhookRoute.js
// This controller now only handles outbound messaging functions for the relay-based system

const VendorLocation = require('../models/vendorLocationModel');
const User = require('../models/userModel');
const { 
  sendText,
  sendTemplate,
  sendPhotoUploadInvitation, 
  sendPhotoUploadConfirmation, 
  generateVendorUploadUrl,
  formatPhoneNumber 
} = require('../services/metaWhatsAppService');

const sendLocationConfirmation = async (to, latitude, longitude) => {
  try {
    const message = `Thank you for sharing your location! Your coordinates have been updated:
Latitude: ${latitude}
Longitude: ${longitude}

You can update your location anytime by sending a new location.`;

    const response = await sendText(to, message);
    console.log('Location confirmation sent successfully via Meta API');
    return response;
  } catch (error) {
    console.error('Error sending location confirmation:', error);
    throw error;
  }
};

// Note: Inbound message handling removed - Admin Dashboard now owns all conversations
// This controller only provides outbound messaging functions

// Outbound messaging functions for OTP and Review notifications
// These are triggered by the LaariKhojo admin dashboard, not by inbound messages

const sendOTPToVendor = async (phoneNumber, otp) => {
  try {
    const message = `Your LaariKhojo verification code is: ${otp}. Valid for 5 minutes.`;
    const response = await sendText(phoneNumber, message);
    console.log('OTP sent to vendor via Meta API:', phoneNumber);
    return response;
  } catch (error) {
    console.error('Error sending OTP to vendor:', error);
    throw error;
  }
};

const sendReviewRatingReminder = async (phoneNumber, vendorName) => {
  try {
    const message = `Hi ${vendorName}! 

Don't forget to rate and review your recent LaariKhojo experience. Your feedback helps us improve our service!

Rate us: https://laarikhojo.in/review

Thank you for using LaariKhojo! 🚀`;
    
    const response = await sendText(phoneNumber, message);
    console.log('Review reminder sent to vendor via Meta API:', phoneNumber);
    return response;
  } catch (error) {
    console.error('Error sending review reminder:', error);
    throw error;
  }
};

module.exports = {
  sendLocationConfirmation,
  sendOTPToVendor,
  sendReviewRatingReminder,
  sendPhotoUploadConfirmation,
  generateVendorUploadUrl
}; 
const express = require('express');
const router = express.Router();
const { verifyWebhook, handleWebhook } = require('../controllers/webhookController');
const { sendPhotoUploadInvitation } = require('../services/whatsappService');
const User = require('../models/userModel');

// Webhook verification endpoint
router.get('/webhook', verifyWebhook);

// Webhook message handling endpoint
router.post('/webhook', handleWebhook);

// Send photo upload invitation to vendor
router.post('/send-photo-upload-invitation', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        msg: 'Phone number is required'
      });
    }
    
    // Find vendor by phone number
    const vendor = await User.findOne({ contactNumber: phoneNumber });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: 'Vendor not found with this phone number'
      });
    }
    
    // Send photo upload invitation
    await sendPhotoUploadInvitation(phoneNumber, vendor.name || vendor.businessName || 'Vendor');
    
    return res.status(200).json({
      success: true,
      msg: 'Photo upload invitation sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending photo upload invitation:', error);
    return res.status(500).json({
      success: false,
      msg: 'Error sending photo upload invitation',
      error: error.message
    });
  }
});

module.exports = router; 
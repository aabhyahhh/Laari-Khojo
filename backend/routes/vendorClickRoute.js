const express = require('express');
const router = express.Router();

// Import the controller
const { 
  trackVendorClick, 
  getVendorClickAnalytics, 
  getVendorClickStats 
} = require('../controllers/vendorClickController');

const auth = require('../middlewares/authMiddleware');

// Track vendor marker click (public endpoint - no auth required)
router.post('/track-click', trackVendorClick);

// Get vendor click analytics (admin only)
router.get('/analytics', auth, getVendorClickAnalytics);

// Get click stats for specific vendor (admin only)
router.get('/stats/:vendorId', auth, getVendorClickStats);

module.exports = router;

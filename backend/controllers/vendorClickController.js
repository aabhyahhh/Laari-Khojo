const VendorClick = require('../models/vendorClickModel');
const User = require('../models/userModel');

// Track a vendor marker click
const trackVendorClick = async (req, res) => {
  try {
    const { vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        msg: 'Vendor ID is required'
      });
    }

    // Verify vendor exists
    const vendor = await User.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: 'Vendor not found'
      });
    }

    // Find existing click record or create new one
    const existingClick = await VendorClick.findOne({ vendorId });
    
    if (existingClick) {
      // Update existing record
      existingClick.clickCount += 1;
      existingClick.lastClickedAt = new Date();
      await existingClick.save();
      
      return res.status(200).json({
        success: true,
        msg: 'Vendor click tracked successfully',
        data: {
          vendorId: existingClick.vendorId,
          clickCount: existingClick.clickCount,
          lastClickedAt: existingClick.lastClickedAt
        }
      });
    } else {
      // Create new record
      const newClick = new VendorClick({
        vendorId,
        clickCount: 1,
        firstClickedAt: new Date(),
        lastClickedAt: new Date()
      });
      
      await newClick.save();
      
      return res.status(201).json({
        success: true,
        msg: 'Vendor click tracked successfully',
        data: {
          vendorId: newClick.vendorId,
          clickCount: newClick.clickCount,
          lastClickedAt: newClick.lastClickedAt
        }
      });
    }
  } catch (error) {
    console.error('Error tracking vendor click:', error);
    return res.status(500).json({
      success: false,
      msg: 'Internal server error',
      error: error.message
    });
  }
};

// Get vendor click analytics for admin
const getVendorClickAnalytics = async (req, res) => {
  try {
    // Get all vendor clicks sorted by click count (descending)
    const vendorClicks = await VendorClick.find({})
      .populate('vendorId', 'name email contactNumber mapsLink latitude longitude foodType')
      .sort({ clickCount: -1, lastClickedAt: -1 });

    // Transform data for frontend
    const analytics = vendorClicks.map(click => ({
      vendorId: click.vendorId._id,
      vendorName: click.vendorId.name,
      vendorEmail: click.vendorId.email,
      contactNumber: click.vendorId.contactNumber,
      mapsLink: click.vendorId.mapsLink,
      latitude: click.vendorId.latitude,
      longitude: click.vendorId.longitude,
      foodType: click.vendorId.foodType,
      clickCount: click.clickCount,
      firstClickedAt: click.firstClickedAt,
      lastClickedAt: click.lastClickedAt,
      createdAt: click.createdAt,
      updatedAt: click.updatedAt
    }));

    // Calculate total clicks
    const totalClicks = vendorClicks.reduce((sum, click) => sum + click.clickCount, 0);

    // Calculate statistics
    const stats = {
      totalVendors: vendorClicks.length,
      totalClicks: totalClicks,
      averageClicksPerVendor: vendorClicks.length > 0 ? (totalClicks / vendorClicks.length).toFixed(2) : 0,
      mostClickedVendor: vendorClicks.length > 0 ? {
        name: vendorClicks[0].vendorId.name,
        clickCount: vendorClicks[0].clickCount
      } : null
    };

    return res.status(200).json({
      success: true,
      msg: 'Vendor click analytics retrieved successfully',
      data: {
        analytics,
        stats
      }
    });
  } catch (error) {
    console.error('Error getting vendor click analytics:', error);
    return res.status(500).json({
      success: false,
      msg: 'Internal server error',
      error: error.message
    });
  }
};

// Get click statistics for a specific vendor
const getVendorClickStats = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        msg: 'Vendor ID is required'
      });
    }

    const vendorClick = await VendorClick.findOne({ vendorId })
      .populate('vendorId', 'name email contactNumber mapsLink latitude longitude foodType');

    if (!vendorClick) {
      return res.status(404).json({
        success: false,
        msg: 'No click data found for this vendor'
      });
    }

    return res.status(200).json({
      success: true,
      msg: 'Vendor click stats retrieved successfully',
      data: {
        vendorId: vendorClick.vendorId._id,
        vendorName: vendorClick.vendorId.name,
        vendorEmail: vendorClick.vendorId.email,
        contactNumber: vendorClick.vendorId.contactNumber,
        mapsLink: vendorClick.vendorId.mapsLink,
        latitude: vendorClick.vendorId.latitude,
        longitude: vendorClick.vendorId.longitude,
        foodType: vendorClick.vendorId.foodType,
        clickCount: vendorClick.clickCount,
        firstClickedAt: vendorClick.firstClickedAt,
        lastClickedAt: vendorClick.lastClickedAt,
        createdAt: vendorClick.createdAt,
        updatedAt: vendorClick.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting vendor click stats:', error);
    return res.status(500).json({
      success: false,
      msg: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  trackVendorClick,
  getVendorClickAnalytics,
  getVendorClickStats
};

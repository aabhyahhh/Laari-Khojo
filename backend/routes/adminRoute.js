const express = require('express');
const router = express.Router();

// Import the controller and validator
const { addPermission } = require('../controllers/admin/permissionController');
const { getPermissions } = require('../controllers/admin/permissionController');
const { deletePermission } = require('../controllers/admin/permissionController');
const { updatePermission } = require('../controllers/admin/permissionController');
const { User } = require('../models/userModel');
const VendorLocation = require('../models/vendorLocationModel');

const { Validator, deleteValidator, updateValidator } = require('../helpers/adminValidator');

const auth = require('../middlewares/authMiddleware');

// Helper functions for phone normalization
const digitsOnly = (v) => String(v || '').replace(/\D/g, '');
const withCC = (msisdn) => (/^\d{10}$/.test(msisdn) ? '91' + msisdn : msisdn);

// Add Permission by Admin
router.post('/add-permission', auth, Validator, addPermission);

//Get Permissions from Admin
router.get('/get-permissions', auth, getPermissions);

//Delete Permission by Admin
router.post('/delete-permission', auth, deleteValidator, deletePermission);

//Update Permission by Admin
router.post('/update-permission', auth, updateValidator, updatePermission);

// DELETE /api/admin/vendors/:id
router.delete('/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // First, find the vendor to get their contact number
    const vendor = await User.findById(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    // Normalize the phone number to match VendorLocation format
    const normalizedPhone = withCC(digitsOnly(vendor.contactNumber));
    // Delete the vendor from User collection
    const deletedVendor = await User.findByIdAndDelete(id);
    if (deletedVendor) {
      // Clean up associated VendorLocation entries
      const deletedLocations = await VendorLocation.deleteMany({
        phone: {
          $in: [
            vendor.contactNumber,
            normalizedPhone,
            digitsOnly(vendor.contactNumber)
          ]
        }
      });
      console.log(`Deleted vendor ${id} and ${deletedLocations.deletedCount} associated location entries`);
      res.json({
        success: true,
        message: 'Vendor and associated data deleted successfully',
        deletedLocationEntries: deletedLocations.deletedCount
      });
    } else {
      res.status(404).json({ error: 'Vendor not found' });
    }
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

// Export the router for use in app.js or other modules
module.exports = router;

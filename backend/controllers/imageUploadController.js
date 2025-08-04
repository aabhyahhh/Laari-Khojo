const User = require("../models/userModel");
const cloudinary = require("../cloudinaryConfig");
const multer = require("multer");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload image to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `laari_khojo/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' }, // Resize for profile
          { quality: 'auto' } // Optimize quality
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const file = req.file;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        msg: "Phone number is required"
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        msg: "No image file provided"
      });
    }

    // Normalize phone number - ensure it has +91 prefix
    let normalizedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+91')) {
      normalizedPhoneNumber = `+91${phoneNumber}`;
    }

    // Find vendor by phone number
    const vendor = await User.findOne({ contactNumber: normalizedPhoneNumber });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found"
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file.buffer, 'profile');

    // Update vendor profile picture using findOneAndUpdate to avoid validation issues
    const updatedVendor = await User.findOneAndUpdate(
      { contactNumber: normalizedPhoneNumber },
      { profilePicture: uploadResult.secure_url },
      { new: true, runValidators: false }
    );

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        msg: "Failed to update profile picture"
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Profile picture uploaded successfully",
      data: {
        profilePicture: uploadResult.secure_url
      }
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    return res.status(500).json({
      success: false,
      msg: "Error uploading profile picture",
      error: error.message
    });
  }
};

// Upload carousel images
const uploadCarouselImages = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const files = req.files;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        msg: "Phone number is required"
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No image files provided"
      });
    }

    // Normalize phone number - ensure it has +91 prefix
    let normalizedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+91')) {
      normalizedPhoneNumber = `+91${phoneNumber}`;
    }

    // Find vendor by phone number
    const vendor = await User.findOne({ contactNumber: normalizedPhoneNumber });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found"
      });
    }

    // Upload all images to Cloudinary
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file.buffer, 'carousel')
    );

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map(result => result.secure_url);

    // Add new images to carousel (don't replace existing ones)
    if (!vendor.carouselImages) {
      vendor.carouselImages = [];
    }
    
    const updatedCarouselImages = [...(vendor.carouselImages || []), ...imageUrls];

    // Update carousel images using findOneAndUpdate to avoid validation issues
    const updatedVendor = await User.findOneAndUpdate(
      { contactNumber: normalizedPhoneNumber },
      { carouselImages: updatedCarouselImages },
      { new: true, runValidators: false }
    );

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        msg: "Failed to update carousel images"
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Carousel images uploaded successfully",
      data: {
        carouselImages: updatedCarouselImages,
        newImages: imageUrls
      }
    });

  } catch (error) {
    console.error('Carousel images upload error:', error);
    return res.status(500).json({
      success: false,
      msg: "Error uploading carousel images",
      error: error.message
    });
  }
};

// Get vendor images
const getVendorImages = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        msg: "Phone number is required"
      });
    }

    const vendor = await User.findOne({ contactNumber: phoneNumber });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found"
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Vendor images retrieved successfully",
      data: {
        profilePicture: vendor.profilePicture,
        carouselImages: vendor.carouselImages || []
      }
    });

  } catch (error) {
    console.error('Get vendor images error:', error);
    return res.status(500).json({
      success: false,
      msg: "Error retrieving vendor images",
      error: error.message
    });
  }
};

// Delete carousel image
const deleteCarouselImage = async (req, res) => {
  try {
    const { phoneNumber, imageUrl } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        msg: "Phone number is required"
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        msg: "Image URL is required"
      });
    }

    // Normalize phone number - ensure it has +91 prefix
    let normalizedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+91')) {
      normalizedPhoneNumber = `+91${phoneNumber}`;
    }

    // Find vendor by phone number
    const vendor = await User.findOne({ contactNumber: normalizedPhoneNumber });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found"
      });
    }

    // Check if vendor has carousel images
    if (!vendor.carouselImages || vendor.carouselImages.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No carousel images found"
      });
    }

    // Find the image index
    const imageIndex = vendor.carouselImages.indexOf(imageUrl);
    
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        msg: "Image not found in carousel"
      });
    }

    // Remove the image from the array
    const updatedCarouselImages = vendor.carouselImages.filter(img => img !== imageUrl);

    // Update vendor carousel images using findOneAndUpdate to avoid validation issues
    const updatedVendor = await User.findOneAndUpdate(
      { contactNumber: normalizedPhoneNumber },
      { carouselImages: updatedCarouselImages },
      { new: true, runValidators: false }
    );

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        msg: "Failed to delete carousel image"
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Carousel image deleted successfully",
      data: {
        carouselImages: updatedCarouselImages
      }
    });

  } catch (error) {
    console.error('Delete carousel image error:', error);
    return res.status(500).json({
      success: false,
      msg: "Error deleting carousel image",
      error: error.message
    });
  }
};

// Delete profile picture
const deleteProfilePicture = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        msg: "Phone number is required"
      });
    }

    // Normalize phone number - ensure it has +91 prefix
    let normalizedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+91')) {
      normalizedPhoneNumber = `+91${phoneNumber}`;
    }

    // Find vendor by phone number
    const vendor = await User.findOne({ contactNumber: normalizedPhoneNumber });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found"
      });
    }

    // Check if vendor has a profile picture
    if (!vendor.profilePicture) {
      return res.status(404).json({
        success: false,
        msg: "No profile picture found"
      });
    }

    // Update vendor profile picture to null using findOneAndUpdate to avoid validation issues
    const updatedVendor = await User.findOneAndUpdate(
      { contactNumber: normalizedPhoneNumber },
      { profilePicture: null },
      { new: true, runValidators: false }
    );

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        msg: "Failed to remove profile picture"
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Profile picture removed successfully",
      data: {
        profilePicture: null
      }
    });

  } catch (error) {
    console.error('Delete profile picture error:', error);
    return res.status(500).json({
      success: false,
      msg: "Error removing profile picture",
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadProfilePicture,
  uploadCarouselImages,
  getVendorImages,
  deleteCarouselImage,
  deleteProfilePicture
}; 
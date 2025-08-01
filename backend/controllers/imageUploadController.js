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

    // Find vendor by phone number
    const vendor = await User.findOne({ contactNumber: phoneNumber });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found"
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file.buffer, 'profile');

    // Update vendor profile picture
    vendor.profilePicture = uploadResult.secure_url;
    await vendor.save();

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

    // Limit to 10 images
    if (files.length > 10) {
      return res.status(400).json({
        success: false,
        msg: "Maximum 10 images allowed"
      });
    }

    // Find vendor by phone number
    const vendor = await User.findOne({ contactNumber: phoneNumber });
    
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
    
    vendor.carouselImages.push(...imageUrls);
    
    // Keep only the latest 20 images
    if (vendor.carouselImages.length > 20) {
      vendor.carouselImages = vendor.carouselImages.slice(-20);
    }

    await vendor.save();

    return res.status(200).json({
      success: true,
      msg: "Carousel images uploaded successfully",
      data: {
        carouselImages: vendor.carouselImages,
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

    if (!phoneNumber || !imageUrl) {
      return res.status(400).json({
        success: false,
        msg: "Phone number and image URL are required"
      });
    }

    const vendor = await User.findOne({ contactNumber: phoneNumber });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found"
      });
    }

    // Remove image from carousel
    if (vendor.carouselImages) {
      vendor.carouselImages = vendor.carouselImages.filter(
        img => img !== imageUrl
      );
      await vendor.save();
    }

    return res.status(200).json({
      success: true,
      msg: "Image deleted successfully",
      data: {
        carouselImages: vendor.carouselImages
      }
    });

  } catch (error) {
    console.error('Delete carousel image error:', error);
    return res.status(500).json({
      success: false,
      msg: "Error deleting image",
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadProfilePicture,
  uploadCarouselImages,
  getVendorImages,
  deleteCarouselImage
}; 
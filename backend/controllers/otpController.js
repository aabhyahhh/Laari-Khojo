const User = require("../models/userModel");
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Store OTP codes temporarily (in production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Twilio (WhatsApp or SMS)
const sendOTP = async (req, res) => {
  try {
    const { phoneNumber, method = 'whatsapp' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        msg: "Phone number is required"
      });
    }

    // Check if vendor exists with this phone number
    const vendor = await User.findOne({ contactNumber: phoneNumber });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "No vendor found with this phone number. Please register first."
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(phoneNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Send OTP via Twilio (WhatsApp or SMS)
    if (process.env.NODE_ENV === 'production') {
      try {
        const messageConfig = {
          body: `Your LaariKhojo verification code is: ${otp}. Valid for 5 minutes.`,
          to: phoneNumber
        };

        if (method === 'whatsapp') {
          // Send via WhatsApp
          messageConfig.from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
          messageConfig.to = `whatsapp:${phoneNumber}`;
        } else {
          // Send via SMS
          messageConfig.from = process.env.TWILIO_PHONE_NUMBER;
        }

        await twilioClient.messages.create(messageConfig);
      } catch (twilioError) {
        console.error('Twilio error:', twilioError);
        return res.status(500).json({
          success: false,
          msg: "Failed to send OTP. Please try again."
        });
      }
    } else {
      // In development, just log the OTP
      console.log(`Development OTP for ${phoneNumber} (${method}): ${otp}`);
    }

    return res.status(200).json({
      success: true,
      msg: `OTP sent successfully via ${method}`,
      data: {
        phoneNumber,
        method,
        // In development, include OTP for testing
        ...(process.env.NODE_ENV !== 'production' && { otp })
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({
      success: false,
      msg: "Error sending OTP",
      error: error.message
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        msg: "Phone number and OTP are required"
      });
    }

    // Get stored OTP data
    const storedData = otpStore.get(phoneNumber);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        msg: "OTP expired or not found. Please request a new OTP."
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({
        success: false,
        msg: "OTP has expired. Please request a new OTP."
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP. Please try again."
      });
    }

    // Get vendor data
    const vendor = await User.findOne({ contactNumber: phoneNumber });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found"
      });
    }

    // Clear OTP from store
    otpStore.delete(phoneNumber);

    // Generate vendor token (simple session token)
    const vendorToken = require('crypto').randomBytes(32).toString('hex');

    return res.status(200).json({
      success: true,
      msg: "OTP verified successfully",
      data: {
        vendorToken,
        vendor: {
          _id: vendor._id,
          name: vendor.name,
          contactNumber: vendor.contactNumber,
          profilePicture: vendor.profilePicture,
          carouselImages: vendor.carouselImages
        }
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      msg: "Error verifying OTP",
      error: error.message
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP
}; 
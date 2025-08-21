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

    // Normalize phone number - ensure it has +91 prefix
    let normalizedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+91')) {
      normalizedPhoneNumber = `+91${phoneNumber}`;
    }

    // Check if vendor exists with this phone number (try both formats)
    let vendor = await User.findOne({ contactNumber: normalizedPhoneNumber });
    
    // If not found with +91 prefix, try without prefix
    if (!vendor) {
      const phoneWithoutPrefix = phoneNumber.replace(/^\+91/, '');
      vendor = await User.findOne({ contactNumber: phoneWithoutPrefix });
    }
    
    // If still not found, try with +91 prefix added
    if (!vendor && !phoneNumber.startsWith('+91')) {
      vendor = await User.findOne({ contactNumber: `+91${phoneNumber}` });
    }
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "No vendor found with this phone number. Please register first."
      });
    }
    
    // Use the vendor's actual phone number format for consistency
    const actualPhoneNumber = vendor.contactNumber;

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes) - use actual phone number
    otpStore.set(actualPhoneNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Send OTP via Twilio (WhatsApp or SMS)
    try {
      const messageConfig = {
        body: `Your LaariKhojo verification code is: ${otp}. Valid for 5 minutes.`,
        to: actualPhoneNumber
      };

      if (method === 'whatsapp') {
        // Send via WhatsApp
        const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER?.replace('%', ''); // Remove any trailing % if present
        messageConfig.from = `whatsapp:${whatsappNumber}`;
        messageConfig.to = `whatsapp:${actualPhoneNumber}`;
      } else {
        // Send via SMS
        messageConfig.from = process.env.TWILIO_PHONE_NUMBER;
      }

      console.log('Attempting to send message with config:', {
        ...messageConfig,
        body: messageConfig.body.substring(0, 20) + '...' // Log partial body for security
      });

      const result = await twilioClient.messages.create(messageConfig);
      console.log('Twilio message sent successfully:', result.sid);
      
    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      
      // In development, still return success but log the OTP for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`Development OTP for ${actualPhoneNumber} (${method}): ${otp}`);
      } else {
        return res.status(500).json({
          success: false,
          msg: "Failed to send OTP. Please try again."
        });
      }
    }

    return res.status(200).json({
      success: true,
      msg: `OTP sent successfully via ${method}`,
      data: {
        phoneNumber: actualPhoneNumber,
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

    // Normalize phone number - ensure it has +91 prefix
    let normalizedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+91')) {
      normalizedPhoneNumber = `+91${phoneNumber}`;
    }

    // Try to get stored OTP data with different phone number formats
    let storedData = otpStore.get(normalizedPhoneNumber);
    let actualPhoneNumber = normalizedPhoneNumber;
    
    // If not found with +91 prefix, try without prefix
    if (!storedData) {
      const phoneWithoutPrefix = phoneNumber.replace(/^\+91/, '');
      storedData = otpStore.get(phoneWithoutPrefix);
      if (storedData) {
        actualPhoneNumber = phoneWithoutPrefix;
      }
    }
    
    // If still not found, try with +91 prefix added
    if (!storedData && !phoneNumber.startsWith('+91')) {
      const phoneWithPrefix = `+91${phoneNumber}`;
      storedData = otpStore.get(phoneWithPrefix);
      if (storedData) {
        actualPhoneNumber = phoneWithPrefix;
      }
    }
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        msg: "OTP expired or not found. Please request a new OTP."
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(actualPhoneNumber);
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

    // Get vendor data (try both formats)
    let vendor = await User.findOne({ contactNumber: actualPhoneNumber });
    
    // If not found, try other formats
    if (!vendor) {
      const phoneWithoutPrefix = actualPhoneNumber.replace(/^\+91/, '');
      vendor = await User.findOne({ contactNumber: phoneWithoutPrefix });
    }
    
    if (!vendor && !actualPhoneNumber.startsWith('+91')) {
      vendor = await User.findOne({ contactNumber: `+91${actualPhoneNumber}` });
    }
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found"
      });
    }

    // Clear OTP from store
    otpStore.delete(actualPhoneNumber);

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
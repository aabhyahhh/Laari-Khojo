// Meta API WhatsApp Service - Replacing Twilio implementation
const fetch = require('node-fetch');

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const V = process.env.GRAPH_API_VERSION || "v21.0";
const BASE = `https://graph.facebook.com/${V}/${PHONE_NUMBER_ID}/messages`;

// Validate Meta API environment variables
const validateMetaConfig = () => {
  const requiredVars = [
    'WHATSAPP_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing Meta API environment variables:', missingVars);
    console.error('Please check your .env file or environment configuration');
    return false;
  }
  
  console.log('✅ Meta API environment variables validated');
  return true;
};

// Initialize Meta API configuration
try {
  if (validateMetaConfig()) {
    console.log('✅ Meta API configuration initialized successfully');
  } else {
    console.error('❌ Failed to initialize Meta API configuration due to missing environment variables');
  }
} catch (error) {
  console.error('❌ Error initializing Meta API configuration:', error.message);
}

// Helper function to format phone number to international format
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if the cleaned number is too short (less than 10 digits)
  if (cleaned.length < 10) {
    console.log('⚠️ Phone number too short:', phoneNumber);
    return null;
  }
  
  // If it's a 10-digit Indian number, add +91
  if (cleaned.length === 10 && cleaned.match(/^[789]\d{9}$/)) {
    return `+91${cleaned}`;
  }
  
  // If it already has country code (11 digits starting with 91), add +
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  // If it already has +91, return as is
  if (phoneNumber.startsWith('+91')) {
    return phoneNumber;
  }
  
  // If it's 12 digits starting with 91, add +
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  // For other cases, assume it's already in international format
  return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
};

async function callWhatsApp(payload) {
  if (!validateMetaConfig()) {
    throw new Error('Meta API configuration is missing. Check environment variables.');
  }

  const r = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });
  
  if (!r.ok) {
    const errorText = await r.text();
    console.error('❌ Meta API Error:', r.status, errorText);
    throw new Error(`${r.status} ${errorText}`);
  }
  
  const response = await r.json();
  console.log('✅ Meta API response:', response);
  return response;
}

const sendWhatsAppMessage = async (to, message) => {
  try {
    const formattedNumber = formatPhoneNumber(to);
    if (!formattedNumber) {
      throw new Error('Invalid phone number format');
    }
    
    console.log('📤 Sending WhatsApp message to:', formattedNumber);
    console.log('📝 Message:', message);
    
    const response = await callWhatsApp({ 
      to: formattedNumber, 
      type: "text", 
      text: { body: message } 
    });

    console.log('✅ Message sent successfully');
    return response;
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.message);
    console.error('❌ Error details:', error);
    throw error;
  }
};

// Send WhatsApp template message with variables
const sendWhatsAppTemplateMessage = async (to, templateName, language = "en", components = []) => {
  try {
    const formattedNumber = formatPhoneNumber(to);
    if (!formattedNumber) {
      throw new Error('Invalid phone number format');
    }
    
    console.log('📤 Sending WhatsApp template message to:', formattedNumber);
    console.log('📝 Template:', templateName);
    console.log('🌐 Language:', language);
    console.log('🔧 Components:', components);
    
    const response = await callWhatsApp({
      to: formattedNumber,
      type: "template",
      template: { 
        name: templateName, 
        language: { code: language }, 
        components 
      },
    });

    console.log('✅ Template message sent successfully');
    return response;
  } catch (error) {
    console.error('❌ Error sending WhatsApp template message:', error.message);
    console.error('❌ Error details:', error);
    throw error;
  }
};

// Send review notification to vendor
const sendReviewNotification = async (vendorPhoneNumber, reviewData) => {
  try {
    console.log('📱 Original phone number:', vendorPhoneNumber);
    const formattedNumber = formatPhoneNumber(vendorPhoneNumber);
    console.log('📱 Formatted phone number:', formattedNumber);
    
    // Use template with variables
    const templateName = process.env.WHATSAPP_REVIEW_TEMPLATE_NAME || 'new_review_rating_notif_to_vendor_util';
    const components = [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: reviewData.rating.toString()
          },
          {
            type: "text", 
            text: reviewData.comment || 'No comment provided'
          },
          {
            type: "text",
            text: reviewData.reviewerName
          }
        ]
      }
    ];

    return await sendWhatsAppTemplateMessage(formattedNumber, templateName, "en", components);
  } catch (error) {
    console.error('❌ Error sending review notification:', error.message);
    throw error;
  }
};

// Example of sending a location confirmation message
const sendLocationConfirmation = async (to, latitude, longitude) => {
  const message = `Thank you for sharing your location! Your coordinates have been updated:
Latitude: ${latitude}
Longitude: ${longitude}

You can update your location anytime by sending a new location.`;
  
  return sendWhatsAppMessage(to, message);
};

// Send WhatsApp message with interactive buttons
const sendWhatsAppInteractiveMessage = async (to, message, buttons) => {
  try {
    const formattedNumber = formatPhoneNumber(to);
    if (!formattedNumber) {
      throw new Error('Invalid phone number format');
    }
    
    console.log('📤 Sending WhatsApp interactive message to:', formattedNumber);
    console.log('📝 Message:', message);
    console.log('🔘 Buttons:', buttons);
    
    // Create interactive message with buttons for Meta API
    const interactiveMessage = {
      to: formattedNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: message
        },
        action: {
          buttons: buttons.map((button, index) => ({
            type: 'reply',
            reply: {
              id: `btn_${index}`,
              title: button.title
            }
          }))
        }
      }
    };
    
    const response = await callWhatsApp(interactiveMessage);

    console.log('✅ Interactive message sent successfully');
    return response;
  } catch (error) {
    console.error('❌ Error sending WhatsApp interactive message:', error.message);
    console.error('❌ Error details:', error);
    throw error;
  }
};

// Send photo upload invitation message
const sendPhotoUploadInvitation = async (to, vendorName) => {
  try {
    const templateName = process.env.WHATSAPP_PHOTO_UPLOAD_TEMPLATE_NAME || 'photo_upload_invitation';
    const components = [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: to
          }
        ]
      }
    ];
    
    return await sendWhatsAppTemplateMessage(to, templateName, "en", components);
  } catch (error) {
    console.error('❌ Error sending photo upload invitation:', error.message);
    throw error;
  }
};

// Send photo upload confirmation message
const sendPhotoUploadConfirmation = async (to, vendorName) => {
  try {
    const message = `✅ Your photo has been uploaded successfully! Customers will now see your laari on the map with your picture.`;
    
    return await sendWhatsAppMessage(to, message);
  } catch (error) {
    console.error('❌ Error sending photo upload confirmation:', error.message);
    throw error;
  }
};

// Generate vendor-specific upload URL
const generateVendorUploadUrl = (phoneNumber) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const encodedPhone = encodeURIComponent(phoneNumber);
  return `${baseUrl}/vendor-upload?phone=${encodedPhone}`;
};

// Add new Meta API function names for backward compatibility
const sendText = sendWhatsAppMessage;
const sendTemplate = sendWhatsAppTemplateMessage;

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppTemplateMessage,
  sendText,
  sendTemplate,
  sendReviewNotification,
  sendLocationConfirmation,
  sendWhatsAppInteractiveMessage,
  sendPhotoUploadInvitation,
  sendPhotoUploadConfirmation,
  generateVendorUploadUrl,
  formatPhoneNumber,
  validateMetaConfig
}; 
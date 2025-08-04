const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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

const sendWhatsAppMessage = async (to, message) => {
  try {
    const formattedNumber = formatPhoneNumber(to);
    if (!formattedNumber) {
      throw new Error('Invalid phone number format');
    }
    
    const response = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log('Message sent successfully:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.message);
    throw error;
  }
};

// Send WhatsApp template message with variables
const sendWhatsAppTemplateMessage = async (to, templateId, variables) => {
  try {
    const formattedNumber = formatPhoneNumber(to);
    if (!formattedNumber) {
      throw new Error('Invalid phone number format');
    }
    
    const response = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`,
      contentSid: templateId,
      contentVariables: JSON.stringify(variables)
    });

    console.log('Template message sent successfully:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp template message:', error.message);
    throw error;
  }
};

// Send review notification to vendor
const sendReviewNotification = async (vendorPhoneNumber, reviewData) => {
  try {
    console.log('Original phone number:', vendorPhoneNumber);
    const formattedNumber = formatPhoneNumber(vendorPhoneNumber);
    console.log('Formatted phone number:', formattedNumber);
    
    const templateId = 'HX17af3999106bed9bceb08252052e989b';
    const variables = {
      '1': reviewData.rating.toString(), // Rating
      '2': reviewData.comment || 'No comment provided', // Review comment
      '3': reviewData.reviewerName // Reviewer name
    };

    return await sendWhatsAppTemplateMessage(formattedNumber, templateId, variables);
  } catch (error) {
    console.error('Error sending review notification:', error.message);
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

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppTemplateMessage,
  sendReviewNotification,
  sendLocationConfirmation,
  formatPhoneNumber
}; 
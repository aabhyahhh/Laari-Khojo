const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsAppMessage = async (to, message) => {
  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`
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
    const response = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
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
    const templateId = 'HX17af3999106bed9bceb08252052e989b';
    const variables = {
      '1': reviewData.rating.toString(), // Rating
      '2': reviewData.comment || 'No comment provided', // Review comment
      '3': reviewData.reviewerName // Reviewer name
    };

    return await sendWhatsAppTemplateMessage(vendorPhoneNumber, templateId, variables);
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
  sendLocationConfirmation
}; 
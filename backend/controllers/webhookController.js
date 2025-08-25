const VERIFY_TOKEN = "laarik";
const VendorLocation = require('../models/vendorLocationModel');
const User = require('../models/userModel');
const twilio = require('twilio');
const { 
  sendPhotoUploadInvitation, 
  sendPhotoUploadConfirmation, 
  generateVendorUploadUrl,
  formatPhoneNumber 
} = require('../services/whatsappService');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification attempt:', {
    mode,
    token,
    challenge,
    expectedToken: VERIFY_TOKEN,
    query: req.query
  });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.log('Webhook verification failed:', {
      modeMatch: mode === 'subscribe',
      tokenMatch: token === VERIFY_TOKEN
    });
    res.sendStatus(403);
  }
};

const sendLocationConfirmation = async (to, latitude, longitude) => {
  try {
    const message = `Thank you for sharing your location! Your coordinates have been updated:
Latitude: ${latitude}
Longitude: ${longitude}

You can update your location anytime by sending a new location.`;

    const response = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`
    });

    console.log('Location confirmation sent successfully:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending location confirmation:', error);
    throw error;
  }
};

const handleLocationMessage = async (message) => {
  try {
    const { from, location } = message;
    const { latitude, longitude } = location;

    // Update or create vendor location
    await VendorLocation.findOneAndUpdate(
      { phone: from },
      {
        phone: from,
        location: {
          lat: latitude,
          lng: longitude
        },
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Send confirmation message to the vendor
    await sendLocationConfirmation(from, latitude, longitude);

    console.log(`Updated location for vendor ${from}:`, { latitude, longitude });
    return true;
  } catch (error) {
    console.error('Error handling location message:', error);
    return false;
  }
};

const handleButtonClick = async (message) => {
  try {
    const { from, interactive } = message;
    const buttonId = interactive.button_reply.id;
    const buttonTitle = interactive.button_reply.title;
    
    console.log('Button clicked:', { from, buttonId, buttonTitle });
    
    // Handle photo upload button click
    if (buttonTitle === '📤 Upload Photo') {
      // Find vendor by phone number
      const vendor = await User.findOne({ contactNumber: from });
      
      if (!vendor) {
        console.log('Vendor not found for phone number:', from);
        return false;
      }
      
      // Generate vendor-specific upload URL
      const uploadUrl = generateVendorUploadUrl(from);
      
      // Send confirmation with upload link
      const confirmationMessage = `✅ Great! Click the link below to upload your photos:\n\n${uploadUrl}\n\nThis will take you directly to your vendor dashboard where you can upload your profile picture and business images.`;
      
      await twilioClient.messages.create({
        body: confirmationMessage,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${from}`
      });
      
      console.log('Photo upload link sent to vendor:', from);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error handling button click:', error);
    return false;
  }
};

const handleWebhook = async (req, res) => {
  const body = req.body;

  console.log('Received webhook:', JSON.stringify(body, null, 2));

  try {
    // Handle Twilio webhook format
    if (body.Body && body.From) {
      const message = {
        from: body.From.replace('whatsapp:', ''),
        type: 'text',
        text: { body: body.Body }
      };

      // Check if this is a location message (Twilio doesn't directly support location messages)
      // You might need to handle this differently based on your requirements
      console.log('Received message from Twilio:', message);
      
      // For now, just acknowledge the message
      res.status(200).send('OK');
      return;
    }

    // Handle Meta WhatsApp Business API format (if you switch to it later)
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const messages = body.entry[0].changes[0].value.messages;

      // Process each message
      for (const message of messages) {
        // Handle interactive button clicks
        if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
          await handleButtonClick(message);
        }
        // Handle location messages
        else if (message.type === 'location') {
          await handleLocationMessage(message);
        }
        // Add other message type handlers here as needed
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
};

module.exports = {
  verifyWebhook,
  handleWebhook
}; 
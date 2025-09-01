const VERIFY_TOKEN = "laarik";
const VendorLocation = require('../models/vendorLocationModel');
const User = require('../models/userModel');
const { 
  sendText,
  sendTemplate,
  sendPhotoUploadInvitation, 
  sendPhotoUploadConfirmation, 
  generateVendorUploadUrl,
  formatPhoneNumber 
} = require('../services/metaWhatsAppService');

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

    const response = await sendText(to, message);
    console.log('Location confirmation sent successfully via Meta API');
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
      
      await sendText(from, confirmationMessage);
      
      console.log('Photo upload link sent to vendor via Meta API:', from);
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
    // Handle Meta WhatsApp Business API format
    if (body.entry && body.entry[0]?.changes && body.entry[0].changes[0]?.value?.messages) {
      const messages = body.entry[0].changes[0].value.messages;

      // Process each message
      for (const message of messages) {
        console.log('Processing Meta message:', message);
        
        // Extract sender phone number (MSISDN digits only)
        const sender = message.from;
        
        // Handle different message types
        if (message.type === 'text') {
          // Handle text messages: message.text.body
          const textBody = message.text.body;
          console.log('Received text message from', sender, ':', textBody);
          
          // Process text message as needed
          // You can add custom text message handling logic here
          
        } else if (message.type === 'location') {
          // Handle location messages: message.location.latitude, message.location.longitude
          const locationMessage = {
            from: sender,
            location: {
              latitude: message.location.latitude,
              longitude: message.location.longitude
            }
          };
          await handleLocationMessage(locationMessage);
          
        } else if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
          // Handle interactive button clicks
          const interactiveMessage = {
            from: sender,
            interactive: message.interactive
          };
          await handleButtonClick(interactiveMessage);
          
        } else {
          console.log('Unhandled message type:', message.type);
        }
      }
    } else {
      console.log('Received non-message webhook or invalid format');
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
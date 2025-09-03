const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || process.env.VERIFY_TOKEN || '';
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
  try {
    const mode = req.query['hub.mode'];
    const token = String(req.query['hub.verify_token'] || '');
    const challenge = String(req.query['hub.challenge'] || '');

    const modeOk = mode === 'subscribe';
    const tokenOk = token === VERIFY_TOKEN;

    // Minimal logging without leaking secrets
    console.log('Webhook verification attempt', {
      modeOk,
      tokenProvided: Boolean(token),
      hasServerToken: Boolean(VERIFY_TOKEN)
    });

    if (modeOk && tokenOk) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge); // plain text, no JSON
    }

    console.warn('Webhook verification failed', { modeOk, tokenOk });
    return res.sendStatus(403);
  } catch (err) {
    console.error('verifyWebhook error:', err);
    return res.sendStatus(403);
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

const extractCoordinatesFromMapsUrl = (text) => {
  try {
    // Handle various Google Maps URL formats
    const patterns = [
      // @lat,lng format
      /@([-+]?\d*\.\d+),([-+]?\d*\.\d+)/,
      // ?q=lat,lng format
      /[?&]q=([-+]?\d*\.\d+),([-+]?\d*\.\d+)/,
      // /place/...@lat,lng format
      /\/place\/[^@]+@([-+]?\d*\.\d+),([-+]?\d*\.\d+)/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const latitude = parseFloat(match[1]);
        const longitude = parseFloat(match[2]);
        
        // Validate coordinates
        if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
          return { latitude, longitude };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting coordinates from Maps URL:', error);
    return null;
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
        lastMessageTs: new Date()
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

const handleTextMessage = async (message) => {
  try {
    const { from, text, id, timestamp } = message;
    const textBody = text?.body || '';

    console.log('Processing text message from', from, ':', textBody);

    // Check if it's a Google Maps URL
    const coordinates = extractCoordinatesFromMapsUrl(textBody);
    
    if (coordinates) {
      console.log('Extracted coordinates from Maps URL:', coordinates);
      
      // Update vendor location with extracted coordinates
      await VendorLocation.findOneAndUpdate(
        { phone: from },
        {
          phone: from,
          location: {
            lat: coordinates.latitude,
            lng: coordinates.longitude
          },
          lastMessageId: id,
          lastMessageTs: new Date(timestamp * 1000)
        },
        { upsert: true, new: true }
      );

      // Send confirmation
      await sendText(from, `✅ Location updated from your Maps link!
Latitude: ${coordinates.latitude}
Longitude: ${coordinates.longitude}

Thank you for sharing your location!`);
      
      return true;
    }

    // Handle other text messages as needed
    if (textBody.toLowerCase().includes('help') || textBody.toLowerCase().includes('menu')) {
      const helpMessage = `🤖 Welcome to Laari Khojo!

Here's what you can do:
📍 Send your location to update your business coordinates
🔗 Share a Google Maps link with your location
📤 Upload photos of your business

Need help? Just send "help" anytime!`;
      
      await sendText(from, helpMessage);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error handling text message:', error);
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
          await handleTextMessage(message);
          
        } else if (message.type === 'location') {
          const locationMessage = {
            from: sender,
            location: {
              latitude: message.location.latitude,
              longitude: message.location.longitude
            }
          };
          await handleLocationMessage(locationMessage);
          
        } else if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
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
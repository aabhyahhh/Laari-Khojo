// routes/webhookRoute.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const { sendPhotoUploadInvitation } = require('../services/metaWhatsAppService'); 
const User = require('../models/userModel');
const VendorLocation = require('../models/vendorLocationModel');
const { sendLocationConfirmation } = require('../controllers/webhookController');

/** Helpers */
const digitsOnly = (v) => String(v || '').replace(/\D/g, '');
const withCountryCode = (msisdn) => {
  // Meta expects digits only with country code; add "91" if you store 10-digit Indian numbers
  if (/^\d{10}$/.test(msisdn)) return '91' + msisdn;
  return msisdn;
};

/** Relay signature verification */
function verifyRelaySignature(req) {
  const RELAY_SECRET = process.env.RELAY_SECRET;
  if (!RELAY_SECRET) {
    console.error('RELAY_SECRET not set in environment');
    return false;
  }

  const sig = req.get('X-Relay-Signature');
  if (!sig || !sig.startsWith('sha256=')) {
    console.warn('Missing or invalid X-Relay-Signature header');
    return false;
  }

  const expected = 'sha256=' + crypto
    .createHmac('sha256', RELAY_SECRET)
    .update(req.rawBody || Buffer.from(JSON.stringify(req.body || {})))
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

// In-memory store for idempotency (replace with Redis/DB in production)
const seen = new Set();

/** POST: webhook receiver (relay-verified, idempotent) */
router.post('/webhook', (req, res) => {
  // Verify relay signature
  if (!verifyRelaySignature(req)) {
    console.warn('Invalid relay signature');
    return res.sendStatus(403);
  }

  // ACK immediately for fast response
  res.sendStatus(200);

  // Process webhook asynchronously
  setImmediate(async () => {
    try {
      const value = req.body?.entry?.[0]?.changes?.[0]?.value || {};

      // Process inbound vendor messages for location updates
      if (Array.isArray(value.messages) && value.messages.length) {
        console.log('Processing inbound vendor messages for location updates');
        
        for (const message of value.messages) {
          const phoneNumber = digitsOnly(message.from);
          const messageId = message.id;
          const timestamp = new Date(parseInt(message.timestamp) * 1000);
          
          // Handle location messages
          if (message.type === 'location' && message.location) {
            console.log('Processing location message from:', phoneNumber);
            
            try {
              const locationData = {
                phone: phoneNumber,
                location: {
                  lat: message.location.latitude,
                  lng: message.location.longitude,
                  name: message.location.name || null,
                  address: message.location.address || null
                },
                lastMessageId: messageId,
                lastMessageTs: timestamp
              };
              
              // Update or create vendor location
              await VendorLocation.findOneAndUpdate(
                { phone: phoneNumber },
                locationData,
                { upsert: true, new: true }
              );
              
              console.log('Location updated for vendor:', phoneNumber, 'at:', locationData.location.lat, locationData.location.lng);
              
              // Send confirmation message
              await sendLocationConfirmation(
                withCountryCode(phoneNumber),
                locationData.location.lat,
                locationData.location.lng
              );
              
            } catch (error) {
              console.error('Error processing location message:', error);
            }
          }
          // Handle text messages with Google Maps URLs
          else if (message.type === 'text' && message.text) {
            const text = message.text.body;
            console.log('Processing text message from:', phoneNumber, 'Content:', text);
            
            // Check for Google Maps URLs
            const mapsPatterns = [
              /@([-+]?\d*\.\d+),([-+]?\d*\.\d+)/,
              /[?&]q=([-+]?\d*\.\d+),([-+]?\d*\.\d+)/,
              /\/place\/[^@]+@([-+]?\d*\.\d+),([-+]?\d*\.\d+)/
            ];
            
            let coordinates = null;
            for (const pattern of mapsPatterns) {
              const match = text.match(pattern);
              if (match) {
                const latitude = parseFloat(match[1]);
                const longitude = parseFloat(match[2]);
                
                if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
                  coordinates = { latitude, longitude };
                  break;
                }
              }
            }
            
            if (coordinates) {
              try {
                const locationData = {
                  phone: phoneNumber,
                  location: {
                    lat: coordinates.latitude,
                    lng: coordinates.longitude,
                    name: null,
                    address: null
                  },
                  lastMessageId: messageId,
                  lastMessageTs: timestamp
                };
                
                // Update or create vendor location
                await VendorLocation.findOneAndUpdate(
                  { phone: phoneNumber },
                  locationData,
                  { upsert: true, new: true }
                );
                
                console.log('Location updated from Maps URL for vendor:', phoneNumber, 'at:', coordinates.latitude, coordinates.longitude);
                
                // Send confirmation message
                await sendLocationConfirmation(
                  withCountryCode(phoneNumber),
                  coordinates.latitude,
                  coordinates.longitude
                );
                
              } catch (error) {
                console.error('Error processing Maps URL message:', error);
              }
            }
          }
        }
        return;
      }

      // Handle delivery/read/template status updates (optional)
      const statusId = value?.statuses?.[0]?.id || value?.message_template_id;
      if (statusId) {
        // Check idempotency
        if (seen.has(statusId)) {
          console.log('Duplicate status update ignored:', statusId);
          return;
        }
        seen.add(statusId);
        
        // TODO: persist in DB for analytics/retries
        console.log('Status update received:', {
          id: statusId,
          status: value?.statuses?.[0]?.status,
          timestamp: value?.statuses?.[0]?.timestamp
        });
      }

    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  });
});

/** POST: send photo-upload invitation via Meta */
router.post('/send-photo-upload-invitation', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, msg: 'Phone number is required' });
    }

    // normalize to digits + country code for Meta send
    const toMsisdn = withCountryCode(digitsOnly(phoneNumber));

    // Find vendor (match your stored format; adjust if you store with '+' or spaces)
    const vendor =
      (await User.findOne({ contactNumber: phoneNumber })) ||
      (await User.findOne({ contactNumber: toMsisdn })) ||
      (await User.findOne({ contactNumber: '+' + toMsisdn }));

    if (!vendor) {
      return res.status(404).json({ success: false, msg: 'Vendor not found with this phone number' });
    }

    const name = vendor.name || vendor.businessName || 'Vendor';

    // This function must send a Meta template (or text, if within 24h)
    await sendPhotoUploadInvitation(toMsisdn, name);

    return res.status(200).json({ success: true, msg: 'Photo upload invitation sent successfully' });
  } catch (error) {
    console.error('Error sending photo upload invitation:', error);
    return res.status(500).json({
      success: false,
      msg: 'Error sending photo upload invitation',
      error: error.message,
    });
  }
});

module.exports = router;

// routes/webhookRoute.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const { sendPhotoUploadInvitation } = require('../services/metaWhatsAppService'); 
const User = require('../models/userModel');

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
  setImmediate(() => {
    try {
      const value = req.body?.entry?.[0]?.changes?.[0]?.value || {};

      // Ignore inbound vendor messages — Admin owns conversations
      if (Array.isArray(value.messages) && value.messages.length) {
        console.log('Ignoring inbound vendor message');
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

// routes/webhookRoute.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const { verifyWebhook, handleWebhook } = require('../controllers/webhookController'); 
// ^ update these controller functions to parse Meta payloads (entry -> changes -> value -> messages)

const { sendPhotoUploadInvitation } = require('../services/metaWhatsAppService'); 
// ^ implement this to call Meta Cloud API (not Twilio)

const User = require('../models/userModel');

/** Helpers */
const digitsOnly = (v) => String(v || '').replace(/\D/g, '');
const withCountryCode = (msisdn) => {
  // Meta expects digits only with country code; add "91" if you store 10-digit Indian numbers
  if (/^\d{10}$/.test(msisdn)) return '91' + msisdn;
  return msisdn;
};

/** Middleware: verify Meta's POST signature using your APP_SECRET */
function verifyMetaSignature(req, res, next) {
  try {
    const appSecret = process.env.APP_SECRET;
    if (!appSecret) return res.status(500).send('APP_SECRET not set');

    const signature = req.get('x-hub-signature-256') || '';
    const expected =
      'sha256=' +
      crypto
        .createHmac('sha256', appSecret)
        .update(req.rawBody || JSON.stringify(req.body))
        .digest('hex');

    // timing-safe compare; mismatches = 403
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return res.sendStatus(403);
    }
    return next();
  } catch (e) {
    return res.sendStatus(403);
  }
}

/** GET: webhook verification (uses your VERIFY_TOKEN) */
router.get('/webhook', verifyWebhook);

/** POST: webhook receiver (signature-verified) */
router.post('/webhook', verifyMetaSignature, handleWebhook);

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

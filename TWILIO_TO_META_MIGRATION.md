# Twilio to Meta WhatsApp Business API Migration

## Overview
This document summarizes the complete migration from Twilio's WhatsApp API to Meta's WhatsApp Business API throughout the LaariKhojo project.

## Key Changes Made

### 1. Webhook Payload Parsing Migration

**Before (Twilio format):**
```javascript
// Twilio webhook payload
req.body.Body    // Message text
req.body.From    // Sender phone number (whatsapp:+91XXXXXXXXXX)
req.body.WaId    // WhatsApp ID
```

**After (Meta format):**
```javascript
// Meta webhook payload
const message = req.body.entry[0].changes[0].value.messages[0];
message.text.body                    // Message text
message.location.latitude            // Location latitude
message.location.longitude           // Location longitude  
message.from                         // Sender phone (MSISDN digits only)
```

### 2. Outbound Message API Migration

**Before (Twilio):**
```javascript
await twilioClient.messages.create({
  from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
  to: `whatsapp:${phoneNumber}`,
  body: message
});
```

**After (Meta API):**
```javascript
await sendText(phoneNumber, message);
// or
await sendTemplate(phoneNumber, templateName, language, components);
```

### 3. Template Message Migration

**Before (Twilio):**
```javascript
// Twilio used template SIDs and variables
await twilioClient.messages.create({
  from: `whatsapp:${twilioNumber}`,
  to: `whatsapp:${phoneNumber}`,
  contentSid: 'HX17af3999106bed9bceb08252052e989b',
  contentVariables: JSON.stringify({
    "1": rating,
    "2": comment,
    "3": reviewerName
  })
});
```

**After (Meta API):**
```javascript
// Meta uses template names and structured components
await sendTemplate(phoneNumber, "template_name", "en", [
  {
    type: "body",
    parameters: [
      { type: "text", text: rating.toString() },
      { type: "text", text: comment },
      { type: "text", text: reviewerName }
    ]
  }
]);
```

## Files Modified

### Core Controllers
- ✅ `backend/controllers/webhookController.js` - Updated webhook parsing and outbound messages
- ✅ `backend/controllers/otpController.js` - Migrated OTP sending from Twilio to Meta API
- ✅ `backend/controllers/reviewController.js` - Updated review notification service import
- ✅ `backend/controllers/imageUploadController.js` - Updated service import

### Routes
- ✅ `backend/routes/webhookRoute.js` - Updated service import

### Bulk Messaging Scripts
- ✅ `backend/send-bulk-simple-messages.js` - Migrated to Meta API
- ✅ `backend/send-bulk-test-vendors.js` - Migrated to Meta API
- ✅ `backend/send-bulk-whatsapp-invitations.js` - Updated service import
- ✅ `backend/send-existing-reviews.js` - Updated service import
- ✅ `backend/send-all-existing-reviews.js` - Updated service import

### Test Files
- ✅ `backend/test-review-notification.js` - Updated service import
- ✅ `backend/test-whatsapp.js` - Updated service import
- ✅ `backend/test-meta-whatsapp.js` - Updated service import
- ✅ `backend/test-whatsapp-direct.js` - Updated service import
- ✅ `backend/test-whatsapp-photo-workflow.js` - Updated service import
- ✅ `backend/test-review-flow.js` - Updated service import
- ✅ `backend/test-meta-integration.js` - **NEW** - Comprehensive Meta API test script

## Environment Variables Required

### Remove (Twilio):
```bash
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
TWILIO_PHONE_NUMBER=
```

### Add (Meta WhatsApp Business API):
```bash
WHATSAPP_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
GRAPH_API_VERSION=v21.0
WHATSAPP_REVIEW_TEMPLATE_NAME=review_notification
WHATSAPP_PHOTO_UPLOAD_TEMPLATE_NAME=photo_upload_invitation
```

## Meta API Service Functions

The `metaWhatsAppService.js` provides these functions:

### Text Messages
- `sendText(to, message)` - Send simple text message
- `sendWhatsAppMessage(to, message)` - Alias for sendText

### Template Messages  
- `sendTemplate(to, templateName, language, components)` - Send template message
- `sendWhatsAppTemplateMessage(to, templateName, language, components)` - Alias for sendTemplate

### Specialized Functions
- `sendReviewNotification(phoneNumber, reviewData)` - Send review notification template
- `sendLocationConfirmation(to, latitude, longitude)` - Send location confirmation
- `sendPhotoUploadInvitation(to, vendorName)` - Send photo upload invitation template
- `sendPhotoUploadConfirmation(to, vendorName)` - Send photo upload confirmation
- `sendWhatsAppInteractiveMessage(to, message, buttons)` - Send interactive buttons

### Utility Functions
- `formatPhoneNumber(phoneNumber)` - Format phone number for international use
- `validateMetaConfig()` - Validate Meta API environment variables
- `generateVendorUploadUrl(phoneNumber)` - Generate vendor upload URL

## Webhook Endpoint Changes

### URL Structure
- **Twilio**: Used Twilio's webhook URLs
- **Meta**: Use `https://yourdomain.com/api/webhook` with proper verification

### Verification Process
- **Twilio**: Simple token verification
- **Meta**: Uses hub.mode, hub.verify_token, and hub.challenge for verification

### Payload Structure
- **Twilio**: Flat structure with Body, From, WaId
- **Meta**: Nested structure with entry[0].changes[0].value.messages[0]

## Testing

Run the comprehensive test:
```bash
node backend/test-meta-integration.js
```

This will test:
1. ✅ Meta API configuration validation
2. ✅ Simple text message sending
3. ✅ Template message sending (if templates are approved)
4. ✅ Review notification functionality

## Template Setup Required

### In WhatsApp Manager:
1. Create message templates for:
   - `review_notification` - For review notifications
   - `photo_upload_invitation` - For photo upload invitations
   
2. Get templates approved by Meta

3. Use template names in environment variables:
   ```bash
   WHATSAPP_REVIEW_TEMPLATE_NAME=review_notification
   WHATSAPP_PHOTO_UPLOAD_TEMPLATE_NAME=photo_upload_invitation
   ```

## Migration Benefits

### Reliability
- ✅ Direct integration with Meta (WhatsApp owner)
- ✅ Better message delivery rates
- ✅ More stable API endpoints

### Features
- ✅ Rich interactive messages (buttons, lists)
- ✅ Media messages (images, documents)
- ✅ Location messages
- ✅ Template messages with components

### Cost
- ✅ More predictable pricing
- ✅ No additional Twilio fees
- ✅ Direct billing from Meta

## Files Unchanged (Twilio Test Files)
These files remain for reference but are no longer used in production:
- `backend/test-twilio-otp.js`
- `backend/test-twilio-auth.js`
- `backend/test-simple-message.js`
- `backend/test-whatsapp-sandbox.js`
- `backend/check-*.js` files

## Next Steps

1. **Environment Setup**: Configure Meta API environment variables
2. **Template Approval**: Create and get WhatsApp message templates approved
3. **Webhook Configuration**: Update webhook URL in Meta Developer Console
4. **Testing**: Run `test-meta-integration.js` to verify everything works
5. **Deployment**: Deploy updated code to production
6. **Monitoring**: Monitor message delivery and webhook functionality

## Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Check WHATSAPP_TOKEN
2. **400 Bad Request**: Verify phone number format and API parameters
3. **403 Forbidden**: Check WHATSAPP_PHONE_NUMBER_ID and token permissions
4. **Template errors**: Ensure templates are created and approved in WhatsApp Manager

### Debug Tools:
- Use `test-meta-integration.js` for comprehensive testing
- Check Meta API logs in Developer Console
- Monitor webhook delivery in Meta Developer Console

# WhatsApp Photo Upload Workflow

## Overview

This document describes the WhatsApp workflow for vendors to upload photos to their laari profiles. The workflow provides a seamless experience where vendors receive a WhatsApp message with an "Upload Photo" button, and upon clicking it, they get redirected to a vendor-specific upload page.

## Workflow Steps

### 1. Send Photo Upload Invitation

**Endpoint:** `POST /api/send-photo-upload-invitation`

**Request Body:**
```json
{
  "phoneNumber": "+918130026321"
}
```

**Response:**
```json
{
  "success": true,
  "msg": "Photo upload invitation sent successfully"
}
```

### 2. WhatsApp Message Flow

1. **Invitation Message**: Vendor receives a WhatsApp message with:
   - Personalized greeting with their name
   - Explanation of photo upload benefits
   - "📤 Upload Photo" button

2. **Button Click**: When vendor clicks the button:
   - Webhook receives the button click event
   - System generates a vendor-specific upload URL
   - Vendor receives a confirmation message with the upload link

3. **Upload Confirmation**: After successful upload:
   - Vendor receives confirmation message: "✅ Your photo has been uploaded successfully! Customers will now see your laari on the map with your picture."

### 3. Vendor Upload Page

**URL Format:** `https://yourdomain.com/vendor-upload?phone=+918130026321&name=VendorName`

**Features:**
- Pre-filled phone number from URL parameters
- OTP verification for security
- Upload profile picture or business images
- Real-time file validation
- Success confirmation

## Implementation Details

### Backend Components

#### 1. WhatsApp Service (`backend/services/whatsappService.js`)

**New Functions:**
- `sendWhatsAppInteractiveMessage()` - Sends messages with interactive buttons
- `sendPhotoUploadInvitation()` - Sends the initial invitation message
- `sendPhotoUploadConfirmation()` - Sends confirmation after successful upload
- `generateVendorUploadUrl()` - Creates vendor-specific upload URLs

#### 2. Webhook Controller (`backend/controllers/webhookController.js`)

**New Function:**
- `handleButtonClick()` - Processes button click events from WhatsApp

#### 3. Image Upload Controller (`backend/controllers/imageUploadController.js`)

**Enhanced Functions:**
- `uploadProfilePicture()` - Now sends WhatsApp confirmation
- `uploadCarouselImages()` - Now sends WhatsApp confirmation

#### 4. Webhook Routes (`backend/routes/webhookRoute.js`)

**New Route:**
- `POST /send-photo-upload-invitation` - Triggers the workflow

### Frontend Components

#### 1. Vendor Upload Page (`frontend/src/components/VendorUploadPage.tsx`)

**Features:**
- Modal-style interface
- Phone number pre-filling from URL parameters
- OTP verification flow
- File upload with validation
- Success feedback

#### 2. App Routing (`frontend/src/App.tsx`)

**New Route:**
- `/vendor-upload` - Renders the VendorUploadPage component

## Environment Variables

Add these to your `.env` file:

```env
# Frontend URL for generating upload links
FRONTEND_URL=https://yourdomain.com

# Test phone number for development
TEST_PHONE_NUMBER=918130026321
```

## Testing

### 1. Manual Testing

Run the test script:
```bash
cd backend
node test-whatsapp-photo-workflow.js
```

### 2. API Testing

**Send invitation:**
```bash
curl -X POST http://localhost:3000/api/send-photo-upload-invitation \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+918130026321"}'
```

### 3. WhatsApp Testing

1. Ensure your Twilio WhatsApp number is configured
2. Use a test vendor phone number
3. Send the invitation message
4. Click the button in WhatsApp
5. Verify the upload link works
6. Test the upload functionality

## Security Considerations

1. **OTP Verification**: All uploads require OTP verification
2. **Phone Number Validation**: Only registered vendors can upload
3. **File Validation**: Images are validated for size and type
4. **URL Parameters**: Phone number and name are URL-encoded

## Error Handling

### Common Issues

1. **Vendor Not Found**: Check if phone number exists in database
2. **WhatsApp API Errors**: Verify Twilio credentials and webhook configuration
3. **File Upload Errors**: Check Cloudinary configuration and file size limits
4. **OTP Issues**: Ensure OTP service is working correctly

### Error Responses

```json
{
  "success": false,
  "msg": "Error description",
  "error": "Detailed error message"
}
```

## Monitoring and Logging

The system logs all important events:

- ✅ WhatsApp message sent successfully
- ❌ Error sending WhatsApp message
- 📤 Photo upload invitation sent
- 🔘 Button click received
- 📸 Photo upload completed
- ✅ WhatsApp confirmation sent

## Future Enhancements

1. **Bulk Invitations**: Send invitations to multiple vendors
2. **Analytics**: Track invitation open rates and conversion
3. **Reminder Messages**: Send follow-up reminders
4. **Photo Quality Check**: AI-powered image quality validation
5. **Social Sharing**: Allow vendors to share their updated profiles

## Support

For issues or questions about the WhatsApp photo upload workflow:

1. Check the logs for error messages
2. Verify Twilio webhook configuration
3. Test with the provided test script
4. Review environment variables
5. Check database connectivity

---

**Note:** This workflow requires a properly configured Twilio WhatsApp Business API account and webhook endpoints.

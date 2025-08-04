# WhatsApp Review Notifications

This document explains how the WhatsApp review notification system works when vendors receive new reviews and ratings.

## Overview

When a customer submits a review and rating for a vendor, the system automatically sends a WhatsApp notification to the vendor using a pre-approved template. The notification includes the rating, review comment, and reviewer's name.

## Template Details

- **Template ID**: `HX17af3999106bed9bceb08252052e989b`
- **Template Content**:
  ```
  Hello 👋, you've received a new review on your Laari Khojo profile!  
  नमस्ते 👋, आपकी लारी खोजो प्रोफ़ाइल पर एक नया रिव्यू आया है!

  ⭐ Rating: {{1}}/5  

  🗣️ Comment: "{{2}}"  

  👤 Reviewer: {{3}}  

  To view and respond to your reviews, visit your profile on Laari Khojo.  
  अपने रिव्यू देखने और जवाब देने के लिए, अपनी लारी खोजो प्रोफ़ाइल पर जाएं।

  Thank you for being part of our community!  
  हमारे समुदाय का हिस्सा बनने के लिए धन्यवाद!  

  – Team Laari Khojo  
  – टीम लारी खोजो
  ```

## Variable Mapping

- **{{1}}**: Rating (1-5 stars)
- **{{2}}**: Review comment (or "No comment provided" if empty)
- **{{3}}**: Reviewer's name

## Implementation Details

### Backend Files Modified

1. **`backend/services/whatsappService.js`**
   - Added `sendWhatsAppTemplateMessage()` function
   - Added `sendReviewNotification()` function
   - Handles template message sending with variables

2. **`backend/controllers/reviewController.js`**
   - Modified `addReview()` function
   - Fetches vendor details to get phone number
   - Sends WhatsApp notification after review is saved
   - Graceful error handling (doesn't fail review submission if WhatsApp fails)

### Flow

1. Customer submits review through frontend
2. Frontend calls `/api/add-review` endpoint
3. Backend saves review to database
4. Backend fetches vendor details using `vendorId`
5. Backend sends WhatsApp notification to vendor's phone number
6. Review is successfully saved regardless of WhatsApp notification status

## Testing

### Test File
Run the test file to verify the functionality:
```bash
cd backend
node test-review-notification.js
```

### Manual Testing
1. Submit a review through the frontend
2. Check vendor's WhatsApp for notification
3. Verify template variables are correctly populated

## Environment Variables Required

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
TEST_PHONE_NUMBER=+1234567890  # For testing
```

## Error Handling

The system includes comprehensive error handling:

1. **Vendor not found**: Logs error but doesn't fail review submission
2. **No contact number**: Logs warning but continues
3. **WhatsApp API errors**: Logs error but doesn't fail review submission
4. **Template errors**: Logs specific error codes for debugging

## Common Error Codes

- **21211**: Invalid phone number or not registered with WhatsApp
- **30008**: Template not found or not approved
- **30007**: Template variables don't match template structure

## Troubleshooting

### WhatsApp Notifications Not Sending

1. **Check Twilio credentials**:
   ```bash
   node test-twilio-auth.js
   ```

2. **Test WhatsApp setup**:
   ```bash
   node test-whatsapp.js
   ```

3. **Test review notifications**:
   ```bash
   node test-review-notification.js
   ```

4. **Check vendor phone numbers**:
   - Ensure vendors have valid phone numbers in database
   - Phone numbers should be in international format (+91XXXXXXXXXX)

### Template Issues

1. **Verify template ID**: Ensure `HX17af3999106bed9bceb08252052e989b` is correct
2. **Check template approval**: Template must be approved in Twilio console
3. **Verify variables**: Ensure variable names match template structure

## Production Considerations

1. **Template Approval**: Ensure template is approved for production use
2. **Phone Number Validation**: Validate vendor phone numbers before sending
3. **Rate Limiting**: Monitor Twilio usage and costs
4. **Error Monitoring**: Set up alerts for failed notifications
5. **Logging**: Monitor logs for notification success/failure rates

## Security

- Phone numbers are validated before sending
- Template variables are sanitized
- Errors don't expose sensitive information
- Review submission is not affected by notification failures

## Future Enhancements

1. **Notification Preferences**: Allow vendors to opt-out of notifications
2. **Multiple Templates**: Different templates for different rating ranges
3. **SMS Fallback**: Send SMS if WhatsApp fails
4. **Notification History**: Track sent notifications in database
5. **Custom Messages**: Allow vendors to respond to reviews via WhatsApp 
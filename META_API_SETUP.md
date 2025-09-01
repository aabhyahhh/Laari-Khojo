# Meta API WhatsApp Setup Guide

This guide will help you set up Meta API (Facebook Graph API) for WhatsApp Business messaging to replace the previous Twilio implementation.

## Prerequisites

1. **Meta Developer Account**: You need a Meta Developer account
2. **WhatsApp Business API**: Access to WhatsApp Business API through Meta
3. **Business Verification**: Your business needs to be verified by Meta

## Step 1: Set Up Meta Developer Account

### 1.1 Create Meta Developer Account
1. Go to [Meta Developers](https://developers.facebook.com/)
2. Click "Get Started" and create a developer account
3. Complete the verification process

### 1.2 Create a WhatsApp Business App
1. In Meta Developer Console, click "Create App"
2. Select "Business" as the app type
3. Choose "WhatsApp" as the product
4. Fill in your app details and create the app

## Step 2: Configure WhatsApp Business API

### 2.1 Get WhatsApp Business Account
1. In your app dashboard, go to "WhatsApp" → "Getting Started"
2. Follow the setup wizard to create a WhatsApp Business Account
3. Note down your **Phone Number ID** (you'll need this for environment variables)

### 2.2 Generate Access Token
1. Go to "WhatsApp" → "API Setup"
2. Click "Generate Token"
3. Copy the **Permanent Access Token** (you'll need this for environment variables)

### 2.3 Get Phone Number ID
1. In "WhatsApp" → "API Setup"
2. Note the **Phone Number ID** (this is different from your phone number)

## Step 3: Environment Variables

Update your `.env` file with the following Meta API variables:

```env
# Meta API Configuration (replacing Twilio)
WHATSAPP_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
GRAPH_API_VERSION=v21.0

# Template Names (create these in Meta Developer Console)
WHATSAPP_REVIEW_TEMPLATE_NAME=review_notification
WHATSAPP_PHOTO_UPLOAD_TEMPLATE_NAME=photo_upload_invitation

# Frontend URL (for vendor upload links)
FRONTEND_URL=https://your-domain.com
```

## Step 4: Create WhatsApp Templates

### 4.1 Review Notification Template
1. Go to "WhatsApp" → "Message Templates"
2. Click "Create Template"
3. Set template name: `review_notification`
4. Category: "Customer Care"
5. Language: "English"
6. Template content:
   ```
   Hi! You received a new review with {{1}} stars.
   
   Review: {{2}}
   From: {{3}}
   
   Thank you for your service!
   ```
7. Submit for approval

### 4.2 Photo Upload Invitation Template
1. Create another template with name: `photo_upload_invitation`
2. Category: "Customer Care"
3. Template content:
   ```
   Hi! Would you like to add a photo to your laari profile?
   
   Click here to upload: {{1}}
   
   This will help customers find your laari easily!
   ```
4. Submit for approval

## Step 5: Test the Integration

### 5.1 Test Basic Message
```bash
node test-whatsapp.js
```

### 5.2 Test Template Message
```bash
node test-whatsapp-template.js
```

### 5.3 Test Review Notification
```bash
node test-review-notification.js
```

## Step 6: Webhook Configuration (Optional)

If you need to receive incoming messages:

1. Go to "WhatsApp" → "Configuration"
2. Set your webhook URL: `https://your-domain.com/webhook`
3. Verify token: Create a random string and add it to your environment variables
4. Subscribe to `messages` and `message_status` events

## Troubleshooting

### Common Issues

1. **"Invalid access token"**
   - Verify your `WHATSAPP_TOKEN` is correct
   - Ensure the token has the necessary permissions

2. **"Phone number ID not found"**
   - Check your `WHATSAPP_PHONE_NUMBER_ID` in the Meta Developer Console
   - Ensure the phone number is verified and active

3. **"Template not found"**
   - Verify template names in your environment variables
   - Ensure templates are approved in Meta Developer Console
   - Check template language matches your configuration

4. **"Rate limit exceeded"**
   - Monitor your API usage in Meta Developer Console
   - Implement rate limiting in your application

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=whatsapp:*
```

## Migration from Twilio

### Environment Variables Changes
- Remove: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`
- Add: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `GRAPH_API_VERSION`

### Code Changes
- The service functions remain the same for backward compatibility
- New functions: `sendText()`, `sendTemplate()` for direct Meta API usage
- Template format changed from Twilio's `contentSid` to Meta's template names

### Testing
- Update your test scripts to use the new environment variables
- Test all existing functionality to ensure smooth migration

## Cost and Limits

- **Meta API**: Pay per message after free tier
- **Rate Limits**: Check Meta Developer Console for current limits
- **Template Approval**: Free, but requires business verification

## Support

- [Meta Developer Documentation](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Business API Guide](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Developer Community](https://developers.facebook.com/community/)


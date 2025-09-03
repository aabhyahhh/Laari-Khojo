# Meta WhatsApp Webhook Integration Setup

This guide covers the complete setup for Meta WhatsApp Business API webhook integration.

## Prerequisites

1. **Meta Developer Account**: Access to [developers.facebook.com](https://developers.facebook.com)
2. **WhatsApp Business App**: Created in Meta Developer Console
3. **Phone Number**: Verified WhatsApp Business phone number
4. **Environment Variables**: Properly configured in your `.env` file

## Environment Variables

Add these to your `.env` file:

```bash
# Meta WhatsApp Configuration
APP_SECRET=your_app_secret_from_meta_developer_console
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token
WHATSAPP_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
GRAPH_API_VERSION=v21.0

# MongoDB
MONGO_URI=your_mongodb_connection_string

# Server
PORT=3000
NODE_ENV=production
```

## Step 1: Meta Developer Console Setup

### 1.1 Create WhatsApp Business App
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new app or use existing one
3. Add "WhatsApp" product to your app
4. Navigate to WhatsApp > Getting Started

### 1.2 Configure Webhook
1. In WhatsApp > Configuration > Webhooks
2. Set **Callback URL**: `https://yourdomain.com/api/webhook`
3. Set **Verify Token**: Use the same value as `WHATSAPP_VERIFY_TOKEN`
4. Subscribe to these fields:
   - `messages` (required)
   - `message_template_status_update` (optional)
   - `phone_number_quality_update` (optional)

### 1.3 Get Required Credentials
1. **App Secret**: App Settings > Basic > App Secret
2. **Access Token**: WhatsApp > Getting Started > Access Token
3. **Phone Number ID**: WhatsApp > Getting Started > Phone Number ID

## Step 2: Webhook Implementation

The webhook system is now fully implemented with:

### 2.1 Signature Verification
- Uses `X-Hub-Signature-256` header
- Verifies with `APP_SECRET` using HMAC SHA256
- Timing-safe comparison to prevent attacks

### 2.2 Message Handling
- **Location Messages**: Updates vendor coordinates in MongoDB
- **Text Messages**: Parses Google Maps URLs for coordinates
- **Interactive Messages**: Handles button clicks and responses

### 2.3 Database Updates
- Creates/updates `VendorLocation` documents
- Stores phone number, coordinates, and message metadata
- Timestamps for tracking updates

## Step 3: Testing

### 3.1 Local Testing
```bash
# Start your server
npm start

# Run webhook tests
node test-webhook.js
```

### 3.2 Production Testing
1. Deploy to your server
2. Update webhook URL in Meta Console
3. Send test messages from WhatsApp
4. Check logs for successful processing

## Step 4: Message Types Supported

### 4.1 Location Messages
Users can send their location via WhatsApp:
- Automatically extracts latitude/longitude
- Updates vendor database
- Sends confirmation message

### 4.2 Text Messages with Maps URLs
Users can share Google Maps links:
- Supports multiple URL formats
- Extracts coordinates automatically
- Updates vendor location
- Sends confirmation

### 4.3 Help Commands
Users can type "help" or "menu":
- Provides usage instructions
- Lists available features
- Guides users through the process

## Step 5: Security Features

### 5.1 Signature Verification
- All incoming webhooks are verified
- Uses Meta's `X-Hub-Signature-256` header
- Prevents unauthorized access

### 5.2 Rate Limiting
- Consider implementing rate limiting
- Monitor webhook volume
- Set appropriate limits

### 5.3 Error Handling
- Comprehensive error logging
- Graceful failure handling
- No sensitive data exposure

## Step 6: Monitoring and Debugging

### 6.1 Logs
- Webhook verification attempts
- Message processing results
- Database update confirmations
- Error details (without sensitive data)

### 6.2 Health Checks
- Webhook endpoint availability
- Database connectivity
- Meta API status

## Step 7: Production Deployment

### 7.1 SSL Certificate
- Webhook URL must use HTTPS
- Valid SSL certificate required
- Meta rejects HTTP webhooks

### 7.2 Environment Variables
- Ensure all variables are set
- Use production-grade secrets
- Rotate tokens regularly

### 7.3 Database Indexes
- Phone number indexing for fast lookups
- Timestamp indexing for queries
- Consider compound indexes

## Troubleshooting

### Common Issues

1. **Webhook Verification Fails**
   - Check `WHATSAPP_VERIFY_TOKEN` matches
   - Ensure callback URL is correct
   - Verify HTTPS requirement

2. **Signature Verification Fails**
   - Check `APP_SECRET` is correct
   - Ensure raw body middleware is working
   - Verify header name is correct

3. **Messages Not Processing**
   - Check webhook subscription status
   - Verify field subscriptions
   - Review server logs

4. **Database Updates Fail**
   - Check MongoDB connection
   - Verify model schemas
   - Check phone number format

### Debug Commands

```bash
# Test webhook verification
curl "https://yourdomain.com/api/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test"

# Check webhook logs
tail -f your-app.log | grep webhook

# Test database connection
node -e "require('./models/vendorLocationModel').findOne().then(console.log)"
```

## Next Steps

1. **Message Templates**: Create approved message templates
2. **Rich Media**: Add support for images and documents
3. **Analytics**: Track message processing metrics
4. **Notifications**: Alert admins of important events
5. **Rate Limiting**: Implement webhook rate limiting

## Support

For issues or questions:
1. Check Meta Developer Documentation
2. Review server logs
3. Test with provided test scripts
4. Verify environment configuration

---

**Note**: This implementation follows Meta's security best practices and handles all required webhook scenarios for WhatsApp Business API integration.

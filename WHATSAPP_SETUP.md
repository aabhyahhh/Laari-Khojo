# WhatsApp OTP Setup Instructions

## Prerequisites

1. **Twilio Account**: You need a Twilio account (free tier available)
2. **WhatsApp Business API**: Twilio provides WhatsApp messaging through their API

## Step 1: Set Up Twilio WhatsApp

### 1.1 Create Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your email and phone number

### 1.2 Get Twilio Credentials
1. In Twilio Console, go to **Dashboard**
2. Copy your **Account SID** and **Auth Token**
3. These will be used in your environment variables

### 1.3 Set Up WhatsApp Sandbox (Free Testing)
1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll see a WhatsApp sandbox number (e.g., `+14155238886`)
3. Copy this number for your environment variable

### 1.4 Join WhatsApp Sandbox (For Testing)
1. Send the provided code to the sandbox number via WhatsApp
2. For example, if the code is `join <code>`, send `join <code>` to `+14155238886`
3. You'll receive a confirmation message

## Step 2: Environment Variables

Add these to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886  # Your sandbox number
TWILIO_PHONE_NUMBER=your_sms_number  # Optional: for SMS fallback

# Other required variables
MONGO_URI=your_mongodb_connection_string
ACCESS_SECRET_TOKEN=your_jwt_secret_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

## Step 3: Test WhatsApp OTP

### 3.1 Development Testing
1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. The OTP will be logged to console in development mode:
   ```
   Development OTP for +1234567890 (whatsapp): 123456
   ```

### 3.2 Production Testing
1. Set `NODE_ENV=production` in your `.env`
2. Make sure you've joined the WhatsApp sandbox
3. Test with a real phone number

## Step 4: WhatsApp Business API (Production)

For production use, you'll need to:

### 4.1 Apply for WhatsApp Business API
1. Go to [Twilio WhatsApp Business API](https://www.twilio.com/whatsapp)
2. Apply for WhatsApp Business API access
3. This requires business verification

### 4.2 Get Production WhatsApp Number
1. Once approved, you'll get a dedicated WhatsApp Business number
2. Update `TWILIO_WHATSAPP_NUMBER` with your production number

## Step 5: Testing the Complete Flow

### 5.1 Frontend Testing
1. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Test the image upload flow:
   - Click on any vendor's profile picture or "Add Laari Images" button
   - Enter a phone number (use your WhatsApp number for testing)
   - Check console for OTP in development mode
   - Enter the OTP and proceed with image upload

### 5.2 WhatsApp Testing
1. Make sure your phone number is registered with WhatsApp
2. Join the Twilio WhatsApp sandbox
3. Test with real phone numbers in production mode

## Troubleshooting

### Common Issues:

1. **"Failed to send OTP"**
   - Check Twilio credentials in `.env`
   - Verify WhatsApp sandbox is joined
   - Check Twilio console for error logs

2. **"No vendor found"**
   - Make sure the phone number exists in your database
   - Check the phone number format (should include country code)

3. **WhatsApp not receiving messages**
   - Ensure you've joined the WhatsApp sandbox
   - Check if the phone number is registered with WhatsApp
   - Verify the sandbox number is correct

### Debug Mode:
Add this to your `.env` for detailed logging:
```env
DEBUG=twilio:*
```

## API Endpoints

### Send OTP via WhatsApp:
```bash
POST /api/send-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "method": "whatsapp"
}
```

### Verify OTP:
```bash
POST /api/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

## Security Notes

1. **OTP Expiration**: OTPs expire after 5 minutes
2. **Rate Limiting**: Consider implementing rate limiting for OTP requests
3. **Phone Number Validation**: Validate phone number format
4. **WhatsApp Sandbox**: Only works with joined numbers in sandbox mode

## Cost Considerations

- **Twilio Free Tier**: 1,000 free messages per month
- **WhatsApp Sandbox**: Free for testing
- **Production**: Pay per message (varies by country)

## Next Steps

1. Test the complete flow in development mode
2. Set up production WhatsApp Business API when ready
3. Implement rate limiting and additional security measures
4. Monitor usage and costs in Twilio console 
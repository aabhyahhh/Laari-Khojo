# Quick Start Guide - WhatsApp OTP Testing

## 🚀 Quick Setup for Testing

### 1. Create Environment File
Create a `.env` file in the `backend` directory with these variables:

```env
# MongoDB Connection (replace with your actual MongoDB URI)
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database

# JWT Secret (generate a random string)
ACCESS_SECRET_TOKEN=your_jwt_secret_token_here_make_it_long_and_random

# Twilio Configuration (get from Twilio Console)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary Configuration (get from Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Environment
NODE_ENV=development

# Test phone number (your WhatsApp number)
TEST_PHONE_NUMBER=+1234567890
```

### 2. Get Twilio Credentials (Free)
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for free account
3. Copy Account SID and Auth Token from Dashboard
4. Go to Messaging → Try it out → Send WhatsApp message
5. Copy the sandbox number (usually +14155238886)

### 3. Join WhatsApp Sandbox
1. Open WhatsApp on your phone
2. Send the provided code to the sandbox number
3. Example: If code is `join abc-def`, send `join abc-def` to +14155238886
4. You'll get a confirmation message

### 4. Test the Setup

#### Test Backend:
```bash
cd backend
node test-setup.js
```

#### Test WhatsApp OTP:
```bash
cd backend
node test-whatsapp.js
```

#### Start Backend Server:
```bash
cd backend
npm start
```

#### Start Frontend:
```bash
cd frontend
npm run dev
```

### 5. Test the Complete Flow

1. **Open the app** in your browser
2. **Click on any vendor card** (profile picture or "Add Laari Images" button)
3. **Enter your WhatsApp number** (the one you joined the sandbox with)
4. **Check the console** for OTP (in development mode)
5. **Enter the OTP** and proceed with image upload

### 6. Development vs Production

#### Development Mode (Current):
- OTP is logged to console
- No actual WhatsApp messages sent
- Perfect for testing

#### Production Mode:
- Set `NODE_ENV=production` in `.env`
- Real WhatsApp messages sent
- Requires WhatsApp Business API approval

### 7. Troubleshooting

#### Common Issues:

1. **"Twilio credentials missing"**
   - Check your `.env` file
   - Make sure you copied the credentials correctly

2. **"WhatsApp number not configured"**
   - Add `TWILIO_WHATSAPP_NUMBER=+14155238886` to `.env`

3. **"No vendor found"**
   - Make sure the phone number exists in your database
   - Check phone number format (include country code)

4. **"Failed to send OTP"**
   - Make sure you joined the WhatsApp sandbox
   - Check if your phone number is registered with WhatsApp

### 8. Testing Commands

```bash
# Test environment setup
node test-setup.js

# Test WhatsApp OTP
node test-whatsapp.js

# Start backend server
npm start

# Start frontend (in another terminal)
cd ../frontend && npm run dev
```

### 9. Expected Console Output

When testing, you should see:
```
Development OTP for +1234567890 (whatsapp): 123456
```

### 10. Next Steps

1. ✅ Set up environment variables
2. ✅ Join WhatsApp sandbox
3. ✅ Test backend setup
4. ✅ Test WhatsApp OTP
5. ✅ Test frontend integration
6. 🎉 Enjoy your WhatsApp OTP functionality!

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Make sure you joined the WhatsApp sandbox
4. Test with a real phone number registered with WhatsApp 
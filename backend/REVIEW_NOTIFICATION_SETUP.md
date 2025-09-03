# Review Notification Setup Guide

This guide covers the complete setup for sending review notifications to vendors via Meta WhatsApp when they receive new reviews.

## 🎯 Overview

When a customer submits a review for a vendor, the system automatically sends a WhatsApp notification to the vendor with:
- Bilingual message (English + Hindi)
- Review rating and comment
- Reviewer name
- Instructions to view and respond to reviews

## 🔧 Implementation Details

### 1. Automatic Trigger
The review notification is automatically triggered when:
- A new review is submitted via the API
- The review is successfully saved to the database
- The vendor has a valid phone number

### 2. Message Format
The notification includes:
```
Hello 👋, you've received a new review on your Laari Khojo profile!
नमस्ते 👋, आपकी लारी खोजो प्रोफ़ाइल पर एक नया रिव्यू आया है!

⭐ Rating: 4/5

🗣️ Comment: "Awesome Food! The taste was amazing and service was quick."

👤 Reviewer: John Doe

To view and respond to your reviews, visit your profile on Laari Khojo.
अपने रिव्यू देखने और जवाब देने के लिए, अपनी लारी खोजो प्रोफ़ाइल पर जाएं।

Thank you for being part of our community!
हमारे समुदाय का हिस्सा बनने के लिए धन्यवाद!

– Team Laari Khojo
– टीम लारी खोजो
```

### 3. Dynamic Variables
The message automatically populates:
- `{{1}}` = Rating (1-5)
- `{{2}}` = Review comment
- `{{3}}` = Reviewer name

## 🚀 Setup Instructions

### Step 1: Environment Variables
Add these to your `.env` file:

```bash
# Required for WhatsApp functionality
WHATSAPP_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
GRAPH_API_VERSION=v21.0

# Optional: Template name (if not set, will use text messages)
WHATSAPP_REVIEW_TEMPLATE_NAME=review_notification
```

### Step 2: Meta Developer Console Setup
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Navigate to your WhatsApp Business app
3. Go to WhatsApp > Message Templates
4. Create a new template with the name `review_notification`
5. Use this template structure:

**Template Name**: `review_notification`
**Language**: English
**Category**: Customer Care
**Template Content**:
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

**Variables**:
- `{{1}}` - Rating (text)
- `{{2}}` - Comment (text)  
- `{{3}}` - Reviewer Name (text)

### Step 3: Template Approval
1. Submit the template for approval
2. Wait for Meta's approval (usually 24-48 hours)
3. Once approved, the template will be available for use

## 📱 How It Works

### 1. Review Submission Flow
```
Customer submits review → Review saved to DB → Vendor lookup → WhatsApp notification sent
```

### 2. Phone Number Processing
- System automatically formats phone numbers
- Adds country code (+91) for Indian numbers
- Validates phone number format
- Handles various input formats

### 3. Fallback Mechanism
- If template is not configured: Sends text message
- If template is configured: Sends template message
- If WhatsApp fails: Logs error but doesn't fail review submission

## 🧪 Testing

### 1. Test the Review API
```bash
# Submit a test review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "your_vendor_id",
    "name": "Test User",
    "email": "test@example.com",
    "rating": 5,
    "comment": "Amazing food and service!"
  }'
```

### 2. Test WhatsApp Service
```bash
# Run the test script
node test-review-notification.js

# Set test phone number
export TEST_PHONE_NUMBER=919876543210
node test-review-notification.js
```

### 3. Check Logs
Monitor the console for:
- ✅ Review saved successfully
- ✅ Vendor found
- ✅ WhatsApp notification sent
- ✅ Message ID received

## 🔍 Troubleshooting

### Common Issues

1. **Template Not Found**
   - Check template name in environment variables
   - Verify template is approved in Meta Console
   - Check template language and category

2. **Phone Number Issues**
   - Ensure vendor has contact number
   - Check phone number format
   - Verify country code handling

3. **WhatsApp API Errors**
   - Check `WHATSAPP_TOKEN` is valid
   - Verify `WHATSAPP_PHONE_NUMBER_ID` is correct
   - Ensure business is approved by Meta

4. **Message Not Sent**
   - Check Meta API response
   - Verify phone number is in correct format
   - Check if user has opted out

### Debug Commands

```bash
# Check environment variables
echo $WHATSAPP_TOKEN
echo $WHATSAPP_PHONE_NUMBER_ID

# Test phone number formatting
node -e "const { formatPhoneNumber } = require('./services/metaWhatsAppService'); console.log(formatPhoneNumber('9876543210'));"

# Test Meta API connection
node -e "const { validateMetaConfig } = require('./services/metaWhatsAppService'); console.log(validateMetaConfig());"
```

## 📊 Monitoring

### Success Metrics
- ✅ Review notifications sent successfully
- ✅ WhatsApp message IDs received
- ✅ Vendor engagement (replies, profile visits)

### Error Tracking
- ❌ Failed phone number formatting
- ❌ WhatsApp API errors
- ❌ Template not found
- ❌ Invalid phone numbers

## 🔮 Future Enhancements

1. **Rich Media**: Include review screenshots
2. **Quick Actions**: Reply buttons for common responses
3. **Analytics**: Track notification open rates
4. **Scheduling**: Send notifications at optimal times
5. **Localization**: Support for more languages
6. **A/B Testing**: Test different message formats

## 📞 Support

For issues or questions:
1. Check Meta Developer Documentation
2. Review server logs for errors
3. Test with provided test scripts
4. Verify environment configuration
5. Check template approval status

---

**Status**: ✅ **IMPLEMENTATION COMPLETE**

The review notification system is now fully functional and will automatically send WhatsApp messages to vendors when they receive new reviews. The system supports both template messages (if configured) and fallback text messages.

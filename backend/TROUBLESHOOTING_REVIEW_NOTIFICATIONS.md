# Troubleshooting Review Notifications

## 🚨 **Current Issue: Template Not Found**

### **Error Message**
```
❌ Meta API Error: 404 {"error":{"message":"(#132001) Template name does not exist in the translation","type":"OAuthException","code":132001,"error_data":{"messaging_product":"whatsapp","details":"template name (review_notification) does not exist in en"},"fbtrace_id":"AUw0lcOKM2YCLbp6aq3-R3V"}}
```

### **Root Cause**
The system is trying to use a template called `review_notification`, but your actual template name is `new_review_rating_notif_to_vendor`.

## 🔧 **Immediate Fix**

### **Step 1: Update Environment Variable**
Set the correct template name in your `.env` file:

```bash
WHATSAPP_REVIEW_TEMPLATE_NAME=new_review_rating_notif_to_vendor
```

### **Step 2: Restart Your Application**
After updating the environment variable, restart your application:

```bash
# If using PM2
pm2 restart your-app-name

# If using npm
npm restart

# If running directly
# Stop and start your application
```

## 🧪 **Test the Fix**

### **Run the Test Script**
```bash
node test-template-fallback.js
```

This will:
- Verify the correct template name is set
- Test the template functionality
- Automatically fall back to text messages if template fails

### **Expected Output**
```
📝 Template: new_review_rating_notif_to_vendor
   Status: ✅ CORRECT

📤 Testing review notification...
✅ Template message sent successfully
```

## 🔍 **Verification Steps**

### **1. Check Environment Variables**
```bash
echo $WHATSAPP_REVIEW_TEMPLATE_NAME
# Should output: new_review_rating_notif_to_vendor
```

### **2. Verify Template in Meta Console**
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Navigate to your WhatsApp Business app
3. Go to WhatsApp > Message Templates
4. Verify template `new_review_rating_notif_to_vendor` exists and is approved

### **3. Test Review Submission**
Submit a new review and check the logs for:
```
📝 Attempting to use template: new_review_rating_notif_to_vendor
✅ Template message sent successfully
```

## 🆘 **If Template Still Fails**

### **Automatic Fallback**
The system now includes automatic fallback to text messages. If the template fails, you'll see:

```
⚠️ Template failed, falling back to text message: [error details]
📤 Sending review notification text message to: +918130026321
✅ Review notification text message sent successfully
```

### **Manual Fallback Test**
To test text message fallback, temporarily remove the template name:

```bash
# Comment out or remove this line
# WHATSAPP_REVIEW_TEMPLATE_NAME=new_review_rating_notif_to_vendor
```

## 📱 **Template Structure Requirements**

### **Your Template Should Have**
- **Name**: `new_review_rating_notif_to_vendor`
- **Language**: English
- **Category**: Customer Care
- **Variables**: 3 text parameters
  - `{{1}}` - Rating
  - `{{2}}` - Comment
  - `{{3}}` - Reviewer Name

### **Template Content Example**
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

## 🔄 **Alternative Solutions**

### **Option 1: Use Text Messages Only**
Remove template configuration to use text messages:

```bash
# Comment out template name
# WHATSAPP_REVIEW_TEMPLATE_NAME=new_review_rating_notif_to_vendor
```

### **Option 2: Create New Template**
If the current template has issues:
1. Create a new template with a different name
2. Update the environment variable
3. Wait for approval

### **Option 3: Fix Existing Template**
1. Check template approval status
2. Verify variable count matches
3. Ensure template is in correct language

## 📊 **Monitoring & Debugging**

### **Check Logs For**
- ✅ Template name being used
- ✅ Template success/failure
- ✅ Fallback to text messages
- ✅ Final message delivery status

### **Common Success Patterns**
```
📝 Attempting to use template: new_review_rating_notif_to_vendor
✅ Template message sent successfully
📋 Result: { messages: [{ id: 'msg_123' }] }
```

### **Common Error Patterns**
```
❌ Template failed, falling back to text message: [error]
📤 Sending review notification text message to: +918130026321
✅ Review notification text message sent successfully
```

## 🎯 **Expected Outcome After Fix**

1. **Template Found**: System uses your approved template
2. **Variables Populated**: Rating, comment, and reviewer name are inserted
3. **Message Sent**: Vendor receives formatted WhatsApp notification
4. **Success Logged**: Confirmation in application logs

## 📞 **Still Having Issues?**

1. **Check Template Status**: Ensure template is approved in Meta Console
2. **Verify Variables**: Confirm template has exactly 3 text parameters
3. **Test Fallback**: Verify text message fallback is working
4. **Check Logs**: Look for specific error messages
5. **Contact Support**: Share error logs and template details

---

**Status**: 🔧 **FIX AVAILABLE**

The issue has been identified and fixed. Update your environment variable to use the correct template name `new_review_rating_notif_to_vendor` and restart your application.

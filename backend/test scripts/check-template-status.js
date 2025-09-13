require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function checkTemplateStatus() {
  console.log('🔍 Checking WhatsApp Template Status\n');
  
  const templateId = process.env.WHATSAPP_PHOTO_UPLOAD_TEMPLATE_ID;
  
  if (!templateId) {
    console.log('❌ No template ID found in environment variables');
    return;
  }
  
  console.log('📤 Template ID:', templateId);
  
  try {
    // Get template details
    const template = await twilioClient.messaging.v1.contentTemplates(templateId).fetch();
    
    console.log('\n📊 Template Details:');
    console.log('Name:', template.friendlyName);
    console.log('Status:', template.status);
    console.log('Language:', template.language);
    console.log('Category:', template.category);
    console.log('Created:', template.dateCreated);
    console.log('Updated:', template.dateUpdated);
    
    if (template.status === 'APPROVED') {
      console.log('\n✅ Template is APPROVED for production use!');
    } else if (template.status === 'PENDING') {
      console.log('\n⏳ Template is PENDING approval');
      console.log('💡 You need to wait for WhatsApp to approve this template');
    } else if (template.status === 'REJECTED') {
      console.log('\n❌ Template was REJECTED');
      console.log('💡 You need to fix the template and resubmit');
    } else {
      console.log('\n⚠️ Template status:', template.status);
    }
    
  } catch (error) {
    console.error('\n❌ Error checking template status:', error.message);
    
    if (error.code === 20008) {
      console.log('💡 Template not found. Check if the template ID is correct.');
    } else if (error.code === 20003) {
      console.log('💡 Authentication error. Check your Twilio credentials.');
    }
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkTemplateStatus();
}

module.exports = { checkTemplateStatus };

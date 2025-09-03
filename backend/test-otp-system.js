const { sendOTPMessage, sendOTPTemplate, formatPhoneNumber, validateMetaConfig } = require('./services/metaWhatsAppService');

// Test OTP message sending
async function testOTPMessage() {
  try {
    console.log('🧪 Testing OTP Message Sending\n');
    
    // Test phone number (replace with actual test number)
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '918130026321';
    const testOTP = '123456';
    
    console.log('📱 Test Phone Number:', testPhoneNumber);
    console.log('🔐 Test OTP:', testOTP);
    console.log('📝 Formatted Phone Number:', formatPhoneNumber(testPhoneNumber));
    
    console.log('\n📤 Sending OTP message...');
    
    const result = await sendOTPMessage(testPhoneNumber, testOTP);
    
    console.log('✅ OTP message sent successfully!');
    console.log('📋 Result:', result);
    
  } catch (error) {
    console.error('❌ Error testing OTP message:', error.message);
    
    if (error.message.includes('Meta API configuration is missing')) {
      console.log('\n💡 Solution: Check your environment variables:');
      console.log('   - WHATSAPP_TOKEN');
      console.log('   - WHATSAPP_PHONE_NUMBER_ID');
      console.log('   - GRAPH_API_VERSION (optional, defaults to v21.0)');
    }
    
    if (error.message.includes('Invalid phone number format')) {
      console.log('\n💡 Solution: Check your phone number format');
      console.log('   - Should be 10 digits for Indian numbers');
      console.log('   - Or include country code');
    }
  }
}

// Test OTP template sending
async function testOTPTemplate() {
  try {
    console.log('\n🧪 Testing OTP Template Sending\n');
    
    // Check if template is configured
    const templateName = process.env.WHATSAPP_OTP_TEMPLATE_NAME;
    
    if (!templateName) {
      console.log('⚠️ No OTP template configured, skipping template test');
      console.log('💡 Set WHATSAPP_OTP_TEMPLATE_NAME in your .env file to test templates');
      return;
    }
    
    // Test phone number (replace with actual test number)
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER || '918130026321';
    const testOTP = '654321';
    
    console.log('📱 Test Phone Number:', testPhoneNumber);
    console.log('🔐 Test OTP:', testOTP);
    console.log('📝 Template Name:', templateName);
    
    console.log('\n📤 Sending OTP via template...');
    
    const result = await sendOTPTemplate(testPhoneNumber, testOTP);
    
    console.log('✅ OTP template sent successfully!');
    console.log('📋 Result:', result);
    
  } catch (error) {
    console.error('❌ Error testing OTP template:', error.message);
    
    if (error.message.includes('Template name does not exist')) {
      console.log('\n💡 Solution: The OTP template is not approved or doesn\'t exist');
      console.log('   - Check template name in Meta Developer Console');
      console.log('   - Ensure template is approved');
      console.log('   - The system will automatically fall back to text messages');
    }
  }
}

// Test phone number formatting
function testPhoneNumberFormatting() {
  console.log('\n🧪 Testing Phone Number Formatting\n');
  
  const testNumbers = [
    '8130026321',           // 10-digit Indian
    '+918130026321',        // With +91
    '918130026321',         // With 91
    '08130026321',          // With 0 prefix
    '+1-555-123-4567',     // US format
    'invalid',              // Invalid
    ''                      // Empty
  ];
  
  testNumbers.forEach(number => {
    try {
      const formatted = formatPhoneNumber(number);
      console.log(`📱 ${number} -> ${formatted || 'INVALID'}`);
    } catch (error) {
      console.log(`📱 ${number} -> ERROR: ${error.message}`);
    }
  });
}

// Test OTP generation and validation
function testOTPGeneration() {
  console.log('\n🧪 Testing OTP Generation\n');
  
  const otps = [];
  
  // Generate 5 OTPs to test uniqueness and format
  for (let i = 0; i < 5; i++) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps.push(otp);
    
    console.log(`🔐 OTP ${i + 1}: ${otp}`);
    console.log(`   Length: ${otp.length} digits`);
    console.log(`   Valid: ${otp.length === 6 && /^\d{6}$/.test(otp)}`);
  }
  
  // Check for duplicates
  const uniqueOtps = new Set(otps);
  console.log(`\n📊 OTP Analysis:`);
  console.log(`   Total Generated: ${otps.length}`);
  console.log(`   Unique OTPs: ${uniqueOtps.size}`);
  console.log(`   Duplicates: ${otps.length - uniqueOtps.size}`);
}

// Test Meta API configuration
function testMetaConfiguration() {
  console.log('\n🔧 Testing Meta API Configuration\n');
  
  const configValid = validateMetaConfig();
  
  if (configValid) {
    console.log('✅ Meta API configuration is valid');
    console.log('   WHATSAPP_TOKEN:', process.env.WHATSAPP_TOKEN ? 'SET' : 'NOT SET');
    console.log('   WHATSAPP_PHONE_NUMBER_ID:', process.env.WHATSAPP_PHONE_NUMBER_ID ? 'SET' : 'NOT SET');
    console.log('   GRAPH_API_VERSION:', process.env.GRAPH_API_VERSION || 'v21.0 (default)');
  } else {
    console.log('❌ Meta API configuration is missing');
    console.log('💡 Please check your environment variables');
  }
}

// Test environment variables
function testEnvironmentVariables() {
  console.log('\n📋 Testing Environment Variables\n');
  
  const requiredVars = [
    'WHATSAPP_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID'
  ];
  
  const optionalVars = [
    'WHATSAPP_OTP_TEMPLATE_NAME',
    'WHATSAPP_REVIEW_TEMPLATE_NAME',
    'WHATSAPP_PHOTO_UPLOAD_TEMPLATE_NAME',
    'GRAPH_API_VERSION'
  ];
  
  console.log('🔑 Required Variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅ SET' : '❌ NOT SET';
    console.log(`   ${varName}: ${status}`);
  });
  
  console.log('\n🔑 Optional Variables:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅ SET' : '⚠️ NOT SET';
    console.log(`   ${varName}: ${status}`);
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting OTP System Tests\n');
  
  // Test environment and configuration first
  testEnvironmentVariables();
  testMetaConfiguration();
  
  // Test phone number formatting
  testPhoneNumberFormatting();
  
  // Test OTP generation
  testOTPGeneration();
  
  // Test OTP message sending
  await testOTPMessage();
  
  // Test OTP template sending
  await testOTPTemplate();
  
  console.log('\n✨ All OTP tests completed!');
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testOTPMessage,
  testOTPTemplate,
  testPhoneNumberFormatting,
  testOTPGeneration,
  testMetaConfiguration,
  testEnvironmentVariables,
  runAllTests
};

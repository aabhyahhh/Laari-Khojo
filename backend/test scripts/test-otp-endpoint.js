require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testOTPEndpoint() {
  console.log('🧪 Testing OTP endpoint...\n');
  
  try {
    // Use the exact phone number format from the database
    const testPhoneNumber = '+918130026321'; // This matches the vendor in the database
    
    console.log('📱 Testing with phone number:', testPhoneNumber);
    console.log('🌐 API URL:', `${API_BASE_URL}/api/send-otp`);
    console.log('');

    // Test sending OTP
    const response = await axios.post(`${API_BASE_URL}/api/send-otp`, {
      phoneNumber: testPhoneNumber,
      method: 'whatsapp'
    });

    console.log('✅ OTP sent successfully!');
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('📋 Response details:');
      console.log('- Success:', response.data.success);
      console.log('- Message:', response.data.msg);
      console.log('- Phone Number:', response.data.data?.phoneNumber);
      console.log('- Method:', response.data.data?.method);
      
      // In development, the OTP should be included in the response
      if (response.data.data?.otp) {
        console.log('- OTP (for testing):', response.data.data.otp);
      }
      
      console.log('\n🎉 OTP endpoint is working correctly!');
      console.log('📱 Check your WhatsApp for the OTP message.');
      
    } else {
      console.log('❌ OTP sending failed:', response.data.msg);
    }
    
  } catch (error) {
    console.error('❌ Error testing OTP endpoint:');
    
    if (error.response) {
      // Server responded with error status
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received. Is the server running?');
      console.error('Make sure to start the server with: npm start');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testOTPEndpoint().catch(console.error);

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testOTPVerification() {
  console.log('🧪 Testing OTP verification...\n');
  
  try {
    // Use the exact phone number format from the database
    const testPhoneNumber = '+918130026321';
    const testOTP = '889803'; // Use the OTP from the previous test
    
    console.log('📱 Testing with phone number:', testPhoneNumber);
    console.log('🔢 Testing with OTP:', testOTP);
    console.log('🌐 API URL:', `${API_BASE_URL}/api/verify-otp`);
    console.log('');

    // Test verifying OTP
    const response = await axios.post(`${API_BASE_URL}/api/verify-otp`, {
      phoneNumber: testPhoneNumber,
      otp: testOTP
    });

    console.log('✅ OTP verification successful!');
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('📋 Response details:');
      console.log('- Success:', response.data.success);
      console.log('- Message:', response.data.msg);
      console.log('- Vendor Token:', response.data.data?.vendorToken);
      console.log('- Vendor Name:', response.data.data?.vendor?.name);
      console.log('- Vendor Phone:', response.data.data?.vendor?.contactNumber);
      
      console.log('\n🎉 OTP verification endpoint is working correctly!');
      
    } else {
      console.log('❌ OTP verification failed:', response.data.msg);
    }
    
  } catch (error) {
    console.error('❌ Error testing OTP verification:');
    
    if (error.response) {
      // Server responded with error status
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received. Is the server running?');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testOTPVerification().catch(console.error);

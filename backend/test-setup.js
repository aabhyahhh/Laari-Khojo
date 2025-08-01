const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const twilio = require('twilio');

console.log('Testing backend setup...\n');

// Test MongoDB connection
console.log('1. Testing MongoDB connection...');
if (process.env.MONGO_URI) {
  console.log('✅ MONGO_URI is set');
} else {
  console.log('❌ MONGO_URI is not set');
}

// Test Cloudinary configuration
console.log('\n2. Testing Cloudinary configuration...');
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  console.log('✅ Cloudinary credentials are set');
} else {
  console.log('❌ Cloudinary credentials are missing');
}

// Test Twilio configuration
console.log('\n3. Testing Twilio configuration...');
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  console.log('✅ Twilio credentials are set');
  
  if (process.env.TWILIO_WHATSAPP_NUMBER) {
    console.log('✅ WhatsApp number is configured');
  } else {
    console.log('⚠️  WhatsApp number not set (will use SMS)');
  }
  
  if (process.env.TWILIO_PHONE_NUMBER) {
    console.log('✅ SMS number is configured');
  } else {
    console.log('⚠️  SMS number not set');
  }
} else {
  console.log('❌ Twilio credentials are missing');
}

// Test JWT secret
console.log('\n4. Testing JWT configuration...');
if (process.env.ACCESS_SECRET_TOKEN) {
  console.log('✅ JWT secret is set');
} else {
  console.log('❌ JWT secret is not set');
}

console.log('\n5. Testing required modules...');
try {
  require('./models/userModel');
  console.log('✅ User model loaded');
} catch (error) {
  console.log('❌ Error loading user model:', error.message);
}

try {
  require('./controllers/otpController');
  console.log('✅ OTP controller loaded');
} catch (error) {
  console.log('❌ Error loading OTP controller:', error.message);
}

try {
  require('./controllers/imageUploadController');
  console.log('✅ Image upload controller loaded');
} catch (error) {
  console.log('❌ Error loading image upload controller:', error.message);
}

console.log('\nSetup test completed!');
console.log('\nNext steps:');
console.log('1. Set up your .env file with the required variables');
console.log('2. Start the backend server with: npm start');
console.log('3. Test the frontend by clicking on vendor cards'); 
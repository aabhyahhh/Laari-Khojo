const crypto = require('crypto');
const axios = require('axios');

// Test webhook signature verification
async function testWebhookSignature() {
  const APP_SECRET = process.env.APP_SECRET || 'test_secret';
  const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhook';
  
  // Sample webhook payload (Meta WhatsApp format)
  const payload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: '123456789',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '1234567890',
            phone_number_id: '987654321'
          },
          messages: [{
            from: '919876543210',
            id: 'msg_123',
            timestamp: '1234567890',
            type: 'text',
            text: {
              body: 'Hello from test!'
            }
          }]
        },
        field: 'messages'
      }]
    }]
  };

  // Create signature
  const body = JSON.stringify(payload);
  const signature = 'sha256=' + crypto
    .createHmac('sha256', APP_SECRET)
    .update(body)
    .digest('hex');

  try {
    console.log('Testing webhook with signature:', signature);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature
      }
    });
    
    console.log('✅ Webhook test successful! Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Webhook test failed! Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('❌ Webhook test failed! Error:', error.message);
    }
  }
}

// Test webhook verification challenge
async function testWebhookVerification() {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || process.env.VERIFY_TOKEN || 'test_token';
  const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhook';
  
  try {
    console.log('\nTesting webhook verification challenge...');
    console.log('Verify token:', VERIFY_TOKEN);
    
    const response = await axios.get(WEBHOOK_URL, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': VERIFY_TOKEN,
        'hub.challenge': 'challenge_string_123'
      }
    });
    
    console.log('✅ Webhook verification successful! Status:', response.status);
    console.log('Challenge response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Webhook verification failed! Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('❌ Webhook verification failed! Error:', error.message);
    }
  }
}

// Test Google Maps URL parsing
function testMapsUrlParsing() {
  console.log('\nTesting Google Maps URL parsing...');
  
  const testUrls = [
    'https://maps.google.com/?q=28.7041,77.1025',
    'https://maps.google.com/maps?q=28.7041,77.1025',
    'https://maps.google.com/maps/place/Some+Place/@28.7041,77.1025,15z',
    'https://maps.google.com/maps?q=28.7041,77.1025&z=15',
    'Invalid URL',
    'https://maps.google.com/maps?q=New+Delhi'
  ];
  
  testUrls.forEach(url => {
    // This would be the actual function from the controller
    const patterns = [
      /@([-+]?\d*\.\d+),([-+]?\d*\.\d+)/,
      /[?&]q=([-+]?\d*\.\d+),([-+]?\d*\.\d+)/,
      /\/place\/[^@]+@([-+]?\d*\.\d+),([-+]?\d*\.\d+)/
    ];

    let coordinates = null;
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const latitude = parseFloat(match[1]);
        const longitude = parseFloat(match[2]);
        
        if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
          coordinates = { latitude, longitude };
          break;
        }
      }
    }
    
    if (coordinates) {
      console.log(`✅ ${url} -> Lat: ${coordinates.latitude}, Lng: ${coordinates.longitude}`);
    } else {
      console.log(`❌ ${url} -> No coordinates found`);
    }
  });
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Meta WhatsApp Webhook Integration\n');
  
  await testWebhookVerification();
  await testWebhookSignature();
  testMapsUrlParsing();
  
  console.log('\n✨ Tests completed!');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testWebhookSignature,
  testWebhookVerification,
  testMapsUrlParsing
};

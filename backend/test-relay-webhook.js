require('dotenv').config();
const crypto = require('crypto');

const RELAY_SECRET = process.env.RELAY_SECRET || 'test-secret-key';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testRelayWebhook() {
  console.log('🧪 Testing Relay Webhook System\n');

  // Test payload (simulating Meta webhook)
  const testPayload = {
    entry: [{
      changes: [{
        value: {
          statuses: [{
            id: 'test-message-id-123',
            status: 'delivered',
            timestamp: Math.floor(Date.now() / 1000)
          }]
        }
      }]
    }]
  };

  const payloadString = JSON.stringify(testPayload);
  const signature = 'sha256=' + crypto
    .createHmac('sha256', RELAY_SECRET)
    .update(payloadString)
    .digest('hex');

  console.log('📤 Test payload:', JSON.stringify(testPayload, null, 2));
  console.log('🔐 Generated signature:', signature);

  try {
    const response = await fetch(`${BASE_URL}/api/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Relay-Signature': signature
      },
      body: payloadString
    });

    console.log('\n📊 Response Status:', response.status);
    console.log('📄 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.status === 200) {
      console.log('✅ Webhook accepted successfully');
    } else if (response.status === 403) {
      console.log('❌ Webhook rejected - signature verification failed');
    } else {
      console.log('⚠️ Unexpected response status');
    }

    const responseText = await response.text();
    if (responseText) {
      console.log('📝 Response Body:', responseText);
    }

  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
  }

  // Test without signature (should fail)
  console.log('\n🧪 Testing without signature (should fail)...');
  try {
    const response = await fetch(`${BASE_URL}/api/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payloadString
    });

    console.log('📊 Response Status:', response.status);
    if (response.status === 403) {
      console.log('✅ Correctly rejected request without signature');
    } else {
      console.log('❌ Should have rejected request without signature');
    }

  } catch (error) {
    console.error('❌ Error testing webhook without signature:', error.message);
  }

  // Test with wrong signature (should fail)
  console.log('\n🧪 Testing with wrong signature (should fail)...');
  try {
    const wrongSignature = 'sha256=' + crypto
      .createHmac('sha256', 'wrong-secret')
      .update(payloadString)
      .digest('hex');

    const response = await fetch(`${BASE_URL}/api/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Relay-Signature': wrongSignature
      },
      body: payloadString
    });

    console.log('📊 Response Status:', response.status);
    if (response.status === 403) {
      console.log('✅ Correctly rejected request with wrong signature');
    } else {
      console.log('❌ Should have rejected request with wrong signature');
    }

  } catch (error) {
    console.error('❌ Error testing webhook with wrong signature:', error.message);
  }

  console.log('\n🎉 Relay webhook testing completed!');
  console.log('\n📋 Environment Variables Required:');
  console.log('- RELAY_SECRET: Shared secret with your router');
  console.log('- BASE_URL: Your server URL (defaults to http://localhost:3000)');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRelayWebhook().catch(console.error);
}

module.exports = { testRelayWebhook };

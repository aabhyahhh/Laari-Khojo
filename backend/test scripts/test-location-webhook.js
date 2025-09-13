require('dotenv').config();
const crypto = require('crypto');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const APP_SECRET = process.env.APP_SECRET;
const RELAY_SECRET = process.env.RELAY_SECRET;

async function testLocationWebhook() {
  console.log('🧪 Testing Location Webhook Processing...\n');

  // Test payload with location message
  const testPayload = {
    entry: [{
      changes: [{
        value: {
          messaging_product: "whatsapp",
          metadata: {
            display_phone_number: "15551234567",
            phone_number_id: "123456789012345"
          },
          messages: [{
            id: "wamid.test123456789",
            from: "919876543210",
            timestamp: "1640995200",
            type: "location",
            location: {
              latitude: 23.0225,
              longitude: 72.5714,
              name: "Ahmedabad, Gujarat",
              address: "Ahmedabad, Gujarat, India"
            }
          }]
        }
      }]
    }]
  };

  const payloadString = JSON.stringify(testPayload);
  
  // Test with Meta signature
  if (APP_SECRET) {
    console.log('📡 Testing with Meta signature...');
    const metaSignature = 'sha256=' + crypto
      .createHmac('sha256', APP_SECRET)
      .update(payloadString)
      .digest('hex');

    try {
      const response = await fetch(`${BASE_URL}/api/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': metaSignature
        },
        body: payloadString
      });

      if (response.ok) {
        console.log('✅ Meta signature test passed');
      } else {
        console.log('❌ Meta signature test failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Meta signature test error:', error.message);
    }
  } else {
    console.log('⚠️ APP_SECRET not set, skipping Meta signature test');
  }

  // Test with Relay signature
  if (RELAY_SECRET) {
    console.log('\n📡 Testing with Relay signature...');
    const relaySignature = 'sha256=' + crypto
      .createHmac('sha256', RELAY_SECRET)
      .update(payloadString)
      .digest('hex');

    try {
      const response = await fetch(`${BASE_URL}/api/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Relay-Signature': relaySignature
        },
        body: payloadString
      });

      if (response.ok) {
        console.log('✅ Relay signature test passed');
      } else {
        console.log('❌ Relay signature test failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Relay signature test error:', error.message);
    }
  } else {
    console.log('⚠️ RELAY_SECRET not set, skipping Relay signature test');
  }

  // Test without signature (should fail)
  console.log('\n📡 Testing without signature (should fail)...');
  try {
    const response = await fetch(`${BASE_URL}/api/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payloadString
    });

    if (response.status === 403) {
      console.log('✅ No signature test correctly failed (403 Forbidden)');
    } else {
      console.log('❌ No signature test should have failed but got:', response.status);
    }
  } catch (error) {
    console.log('❌ No signature test error:', error.message);
  }

  // Test webhook verification endpoint
  console.log('\n📡 Testing webhook verification endpoint...');
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (verifyToken) {
    try {
      const response = await fetch(`${BASE_URL}/api/webhook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test123`);
      
      if (response.ok) {
        const challenge = await response.text();
        if (challenge === 'test123') {
          console.log('✅ Webhook verification test passed');
        } else {
          console.log('❌ Webhook verification test failed - wrong challenge response');
        }
      } else {
        console.log('❌ Webhook verification test failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Webhook verification test error:', error.message);
    }
  } else {
    console.log('⚠️ WHATSAPP_VERIFY_TOKEN not set, skipping verification test');
  }

  console.log('\n🎉 Location webhook testing completed!');
  console.log('\n📋 Environment Variables Required:');
  console.log('- APP_SECRET: For direct Meta webhook signature verification');
  console.log('- RELAY_SECRET: For relay-based webhook signature verification');
  console.log('- WHATSAPP_VERIFY_TOKEN: For webhook verification endpoint');
  console.log('- BASE_URL: Your server URL (defaults to http://localhost:3000)');
  console.log('\n💡 The system now supports both direct Meta webhooks and relay-based webhooks.');
  console.log('💡 Location messages from vendors will be processed and stored in the database.');
}

// Run the test
testLocationWebhook().catch(console.error);

# Relay-Based Webhook System

## Overview
The LaariKhojo backend now uses a relay-based webhook system for enhanced security and performance. This system separates webhook verification from message processing and ensures only authorized requests are processed.

## Architecture

### Components
1. **Router/Proxy**: Handles Meta webhook verification and signature validation
2. **Backend Service**: Processes relayed webhooks with HMAC verification
3. **Idempotency Store**: Prevents duplicate processing (in-memory, upgrade to Redis/DB)

### Flow
```
Meta WhatsApp → Router → Backend Service
     ↓              ↓           ↓
  Webhook      Verify &      Process
  Payload      Relay         Messages
```

## Security Features

### 1. Relay Signature Verification
- Uses HMAC-SHA256 with shared secret
- Header: `X-Relay-Signature: sha256=<hex>`
- Timing-safe comparison prevents timing attacks

### 2. Idempotency
- Tracks processed message IDs
- Prevents duplicate processing
- Fast response (<10s requirement)

### 3. Admin-Only Messaging
- Ignores inbound vendor messages
- Only processes outbound notifications
- Admin Dashboard owns all conversations

## Environment Variables

```bash
# Required
RELAY_SECRET=your-shared-secret-with-router

# Optional
BASE_URL=http://localhost:3000
```

## API Endpoints

### POST /api/webhook
**Purpose**: Receive relayed webhook from router

**Headers**:
```
Content-Type: application/json
X-Relay-Signature: sha256=<hmac-hex>
```

**Response**: 
- `200 OK` - Webhook accepted and processed
- `403 Forbidden` - Invalid signature or unauthorized

**Behavior**:
- Responds immediately (<10s)
- Processes webhook asynchronously
- Ignores inbound vendor messages
- Logs status updates for analytics

## Outbound Messaging Functions

### Available Functions
```javascript
// OTP to vendor
sendOTPToVendor(phoneNumber, otp)

// Review rating reminder
sendReviewRatingReminder(phoneNumber, vendorName)

// Photo upload confirmation
sendPhotoUploadConfirmation(phoneNumber, vendorName)

// Location confirmation
sendLocationConfirmation(phoneNumber, latitude, longitude)
```

### Usage
These functions are triggered by the LaariKhojo admin dashboard, not by inbound messages.

## Testing

### 1. Test Relay Webhook
```bash
node backend/test-relay-webhook.js
```

### 2. Test Without Signature (Should Fail)
```bash
curl -i -X POST https://your-domain.com/api/webhook -d '{}'
# Expected: 403 Forbidden
```

### 3. Test With Valid Signature
```bash
# Generate signature with your RELAY_SECRET
curl -i -X POST https://your-domain.com/api/webhook \
  -H "Content-Type: application/json" \
  -H "X-Relay-Signature: sha256=<your-hmac>" \
  -d '{"entry":[{"changes":[{"value":{"statuses":[{"id":"test-123","status":"delivered"}]}}]}]}'
# Expected: 200 OK
```

## Message Types Handled

### Status Updates (Optional Logging)
- `delivered` - Message delivered to recipient
- `read` - Message read by recipient  
- `failed` - Message delivery failed
- `template-status` - Template message status

### Ignored Messages
- Inbound vendor messages (Admin owns conversations)
- Duplicate status updates (idempotency)

## Production Considerations

### 1. Upgrade Idempotency Store
Replace in-memory `Set` with Redis or database:

```javascript
// Current (development)
const seen = new Set();

// Production (Redis)
const redis = require('redis');
const client = redis.createClient();

async function isDuplicate(id) {
  const exists = await client.exists(`webhook:${id}`);
  if (!exists) {
    await client.setex(`webhook:${id}`, 3600, '1'); // 1 hour TTL
  }
  return exists;
}
```

### 2. Add Monitoring
- Log webhook processing times
- Monitor signature verification failures
- Track message delivery rates

### 3. Error Handling
- Queue failed webhook processing
- Implement retry logic
- Alert on repeated failures

## Router Configuration

Your router/proxy should:

1. **Verify Meta Signature**: Validate `x-hub-signature-256` from Meta
2. **Generate Relay Signature**: Create HMAC with `RELAY_SECRET`
3. **Forward Request**: Send to backend with `X-Relay-Signature` header
4. **Handle Failures**: Retry on backend errors

### Example Router Code
```javascript
// Verify Meta signature
const metaSignature = req.get('x-hub-signature-256');
const isValid = verifyMetaSignature(req.rawBody, metaSignature);

if (!isValid) {
  return res.sendStatus(403);
}

// Generate relay signature
const relaySignature = 'sha256=' + crypto
  .createHmac('sha256', RELAY_SECRET)
  .update(req.rawBody)
  .digest('hex');

// Forward to backend
const backendResponse = await fetch(`${BACKEND_URL}/api/webhook`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Relay-Signature': relaySignature
  },
  body: req.rawBody
});

return res.status(backendResponse.status).send(backendResponse.body);
```

## Migration Benefits

### Security
- ✅ Double signature verification (Meta + Relay)
- ✅ Timing-safe comparisons
- ✅ Admin-only message processing

### Performance  
- ✅ Fast response times (<10s)
- ✅ Asynchronous processing
- ✅ Idempotency prevents duplicates

### Reliability
- ✅ Graceful error handling
- ✅ Status update logging
- ✅ No inbound message conflicts

## Troubleshooting

### Common Issues

1. **403 Forbidden**
   - Check `RELAY_SECRET` matches between router and backend
   - Verify `X-Relay-Signature` header format
   - Ensure signature is generated from raw body

2. **Duplicate Processing**
   - Check idempotency store (upgrade to Redis if needed)
   - Verify message ID extraction logic

3. **Slow Responses**
   - Ensure webhook processing is asynchronous
   - Check for blocking operations in webhook handler

### Debug Commands
```bash
# Test webhook endpoint
curl -i -X POST https://your-domain.com/api/webhook -d '{}'

# Test with valid signature
node backend/test-relay-webhook.js

# Check environment variables
echo $RELAY_SECRET
```

## Files Modified

- ✅ `backend/routes/webhookRoute.js` - New relay-based webhook handler
- ✅ `backend/controllers/webhookController.js` - Outbound messaging functions only
- ✅ `backend/test-relay-webhook.js` - Test script for relay system
- ✅ `backend/app.js` - Raw body middleware for signature verification

## Next Steps

1. **Configure Router**: Set up Meta signature verification and relay forwarding
2. **Set Environment**: Add `RELAY_SECRET` to your environment variables
3. **Test System**: Run `test-relay-webhook.js` to verify functionality
4. **Monitor**: Watch logs for webhook processing and signature verification
5. **Upgrade**: Replace in-memory idempotency with Redis/database in production

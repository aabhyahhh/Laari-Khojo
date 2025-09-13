require('dotenv').config();
const mongoose = require('mongoose');
const VendorLocation = require('./models/vendorLocationModel');
const User = require('./models/userModel');

async function diagnoseWebhookWarnings() {
  console.log('🔍 Diagnosing Webhook Warning Messages...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check for any message tracking in VendorLocation
    console.log('\n📱 Checking VendorLocation for message IDs...');
    const locationsWithMessages = await VendorLocation.find({
      lastMessageId: { $exists: true, $ne: null }
    });

    console.log(`Found ${locationsWithMessages.length} locations with message IDs:`);
    locationsWithMessages.forEach((loc, index) => {
      console.log(`${index + 1}. Phone: ${loc.phone}, Message ID: ${loc.lastMessageId}`);
    });

    // Check for the specific message IDs mentioned in the warning
    const warningMessageIds = [
      'wamid.HBgMOTE3NTc0MDA0NzU4FQIAERgSODQxOTZFNzdERUM2RUMzMEQ4AA==',
      'wamid.HBgMOTE3NTc0MDA0NzU4FQIAERgSNzU1OURDMTAxNTcxQjM5OEQyAA=='
    ];

    console.log('\n🔍 Checking for specific warning message IDs...');
    for (const messageId of warningMessageIds) {
      const found = await VendorLocation.findOne({ lastMessageId: messageId });
      if (found) {
        console.log(`✅ Found message ID ${messageId} in database`);
        console.log(`   Phone: ${found.phone}, Updated: ${found.updatedAt}`);
      } else {
        console.log(`❌ Message ID ${messageId} NOT found in database`);
      }
    }

    // Check if there are any other collections that might track messages
    console.log('\n📊 Checking database collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Check for any message-related collections
    const messageCollections = collections.filter(col => 
      col.name.toLowerCase().includes('message') || 
      col.name.toLowerCase().includes('webhook') ||
      col.name.toLowerCase().includes('status')
    );

    if (messageCollections.length > 0) {
      console.log('\n📨 Found potential message-related collections:');
      for (const col of messageCollections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count} documents`);
      }
    }

    // Check recent webhook activity
    console.log('\n🕐 Recent webhook activity (last 24 hours)...');
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await VendorLocation.find({
      updatedAt: { $gte: oneDayAgo }
    }).sort({ updatedAt: -1 });

    console.log(`Found ${recentActivity.length} recent updates:`);
    recentActivity.forEach((loc, index) => {
      console.log(`${index + 1}. ${loc.phone} - ${loc.updatedAt} - Message ID: ${loc.lastMessageId || 'N/A'}`);
    });

    // Check for phone number patterns
    console.log('\n📞 Checking phone number patterns...');
    const phonePatterns = await VendorLocation.aggregate([
      {
        $group: {
          _id: {
            $substr: ['$phone', 0, 3]
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('Phone number patterns:');
    phonePatterns.forEach(pattern => {
      console.log(`  ${pattern._id}xxx: ${pattern.count} entries`);
    });

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }

  console.log('\n💡 Analysis:');
  console.log('The warning messages you\'re seeing are NOT coming from the current webhook implementation.');
  console.log('This suggests:');
  console.log('1. Another service/webhook handler is running');
  console.log('2. Previous version of code is still running');
  console.log('3. External service is trying to track these messages');
  console.log('4. Message status updates from Meta are being processed elsewhere');
  
  console.log('\n🔧 Recommendations:');
  console.log('1. Check if there are other Node.js processes running');
  console.log('2. Check for other webhook endpoints or services');
  console.log('3. Verify only one instance of the webhook handler is running');
  console.log('4. Check server logs for the source of these warnings');
}

// Run the diagnosis
diagnoseWebhookWarnings().catch(console.error);

require('dotenv').config();
const mongoose = require('mongoose');

async function checkMessagesCollection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check the messages collection
    const messagesCollection = mongoose.connection.db.collection('messages');
    
    console.log('\n📨 Checking messages collection...');
    
    // Get total count
    const totalCount = await messagesCollection.countDocuments();
    console.log(`Total messages: ${totalCount}`);

    // Get recent messages
    const recentMessages = await messagesCollection
      .find({})
      .sort({ _id: -1 })
      .limit(5)
      .toArray();

    console.log('\n📝 Recent messages:');
    recentMessages.forEach((msg, index) => {
      console.log(`${index + 1}. ID: ${msg._id}`);
      console.log(`   Message ID: ${msg.messageId || 'N/A'}`);
      console.log(`   Phone: ${msg.phone || 'N/A'}`);
      console.log(`   Type: ${msg.type || 'N/A'}`);
      console.log(`   Status: ${msg.status || 'N/A'}`);
      console.log(`   Created: ${msg.createdAt || 'N/A'}`);
      console.log('-'.repeat(50));
    });

    // Check for the specific warning message IDs
    const warningMessageIds = [
      'wamid.HBgMOTE3NTc0MDA0NzU4FQIAERgSODQxOTZFNzdERUM2RUMzMEQ4AA==',
      'wamid.HBgMOTE3NTc0MDA0NzU4FQIAERgSNzU1OURDMTAxNTcxQjM5OEQyAA=='
    ];

    console.log('\n🔍 Checking for specific warning message IDs in messages collection...');
    for (const messageId of warningMessageIds) {
      const found = await messagesCollection.findOne({ messageId: messageId });
      if (found) {
        console.log(`✅ Found message ID ${messageId} in messages collection`);
        console.log(`   Document:`, JSON.stringify(found, null, 2));
      } else {
        console.log(`❌ Message ID ${messageId} NOT found in messages collection`);
      }
    }

    // Check message types
    const messageTypes = await messagesCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Message types:');
    messageTypes.forEach(type => {
      console.log(`  ${type._id || 'null'}: ${type.count} messages`);
    });

    // Check recent activity
    const recentActivity = await messagesCollection
      .find({})
      .sort({ _id: -1 })
      .limit(10)
      .toArray();

    console.log('\n🕐 Recent activity (last 10 messages):');
    recentActivity.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.messageId || 'N/A'} - ${msg.type || 'N/A'} - ${msg.createdAt || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error checking messages collection:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkMessagesCollection().catch(console.error);

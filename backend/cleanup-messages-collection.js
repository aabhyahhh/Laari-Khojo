require('dotenv').config();
const mongoose = require('mongoose');

async function cleanupMessagesCollection() {
  console.log('🧹 Cleaning up messages collection...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const messagesCollection = mongoose.connection.db.collection('messages');
    
    // Check current state
    const totalMessages = await messagesCollection.countDocuments();
    console.log(`📊 Current messages collection: ${totalMessages} documents`);

    if (totalMessages === 0) {
      console.log('✅ Messages collection is already empty');
      return;
    }

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will permanently delete all documents from the messages collection.');
    console.log('This collection appears to be unused by the current webhook system.');
    console.log('The current webhook system uses the vendorlocations collection instead.');
    
    // Delete all documents
    console.log('\n🗑️  Deleting all documents from messages collection...');
    const result = await messagesCollection.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} documents from messages collection`);
    
    // Verify cleanup
    const remainingCount = await messagesCollection.countDocuments();
    console.log(`📊 Remaining documents: ${remainingCount}`);

    if (remainingCount === 0) {
      console.log('✅ Messages collection successfully cleaned up');
      console.log('🎉 The warning messages should now stop appearing');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }

  console.log('\n💡 Note:');
  console.log('The messages collection was likely used by a previous version of the webhook system.');
  console.log('The current system uses the vendorlocations collection for tracking location updates.');
  console.log('This cleanup will not affect your current webhook functionality.');
}

// Run the cleanup
cleanupMessagesCollection().catch(console.error);

require('dotenv').config();
const mongoose = require('mongoose');
const { sendPhotoUploadInvitation } = require('./services/whatsappService');
const User = require('./models/userModel');

async function sendBulkWhatsAppInvitations() {
  console.log('📤 Sending WhatsApp Photo Upload Invitations to All Vendors\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all vendors with phone numbers
    const vendors = await User.find({
      contactNumber: { $exists: true, $ne: null, $ne: '' }
    }).select('name businessName vendorName contactNumber profilePicture carouselImages');
    
    console.log(`📊 Found ${vendors.length} vendors with phone numbers`);
    
    if (vendors.length === 0) {
      console.log('❌ No vendors found with phone numbers');
      return;
    }
    
    // Filter vendors who need photos (no profile picture or no carousel images)
    const vendorsNeedingPhotos = vendors.filter(vendor => 
      !vendor.profilePicture || !vendor.carouselImages || vendor.carouselImages.length === 0
    );
    
    console.log(`📸 ${vendorsNeedingPhotos.length} vendors need photos uploaded`);
    
    if (vendorsNeedingPhotos.length === 0) {
      console.log('✅ All vendors already have photos uploaded!');
      return;
    }
    
    // Process vendors in batches to avoid rate limiting
    const batchSize = 5;
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    console.log(`\n📤 Sending invitations in batches of ${batchSize}...\n`);
    
    for (let i = 0; i < vendorsNeedingPhotos.length; i += batchSize) {
      const batch = vendorsNeedingPhotos.slice(i, i + batchSize);
      
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vendorsNeedingPhotos.length / batchSize)}`);
      
      for (const vendor of batch) {
        try {
          // Format phone number to +91XXXXXXXXXX format
          let phoneNumber = vendor.contactNumber;
          
          // Remove any non-digit characters
          phoneNumber = phoneNumber.replace(/\D/g, '');
          
          // Ensure it's a 10-digit number
          if (phoneNumber.length === 10 && phoneNumber.match(/^[789]\d{9}$/)) {
            phoneNumber = `+91${phoneNumber}`;
          } else if (phoneNumber.length === 12 && phoneNumber.startsWith('91')) {
            phoneNumber = `+${phoneNumber}`;
          } else if (!phoneNumber.startsWith('+91')) {
            console.log(`⚠️ Skipping ${vendor.name || vendor.businessName || 'Unknown'}: Invalid phone format ${vendor.contactNumber}`);
            skippedCount++;
            continue;
          }
          
          const vendorName = vendor.name || vendor.businessName || vendor.vendorName || 'Vendor';
          
          console.log(`📤 Sending to ${vendorName} (${phoneNumber})...`);
          
          // Send the invitation
          await sendPhotoUploadInvitation(phoneNumber, vendorName);
          
          console.log(`✅ Sent to ${vendorName}`);
          successCount++;
          
          // Add delay between messages to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ Error sending to ${vendor.name || vendor.businessName || 'Unknown'}:`, error.message);
          errorCount++;
        }
      }
      
      // Add delay between batches
      if (i + batchSize < vendorsNeedingPhotos.length) {
        console.log('⏳ Waiting 5 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully sent: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`⚠️ Skipped (invalid phone): ${skippedCount}`);
    console.log(`📸 Total vendors needing photos: ${vendorsNeedingPhotos.length}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Bulk invitation campaign completed!');
      console.log('📋 Next steps:');
      console.log('1. Monitor WhatsApp for responses');
      console.log('2. Check vendor upload page analytics');
      console.log('3. Follow up with vendors who haven\'t uploaded photos');
    }
    
  } catch (error) {
    console.error('❌ Error in bulk invitation campaign:', error.message);
    console.error('Error details:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the bulk campaign if this file is executed directly
if (require.main === module) {
  sendBulkWhatsAppInvitations();
}

module.exports = { sendBulkWhatsAppInvitations };


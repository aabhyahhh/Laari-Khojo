const mongoose = require('mongoose');

const vendorLocationSchema = new mongoose.Schema({
  // WhatsApp sender number, digits only (e.g., "9198xxxxxxxx")
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true,
    set: v => String(v || '').replace(/\D/g, '')  // strip +, spaces, etc.
  },

  // Sender profile name if you want it (from contacts[0].profile.name)
  profileName: { type: String },

  // Latest location from WhatsApp m.location
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String },     // optional: place name
    address: { type: String }   // optional: formatted address
  },

  // For idempotency/ordering (from m.id and m.timestamp)
  lastMessageId: { type: String, index: true },
  lastMessageTs: { type: Date }
}, {
  timestamps: true   // adds createdAt & updatedAt; you can remove your manual updatedAt
});

const VendorLocation = mongoose.model('VendorLocation', vendorLocationSchema);
module.exports = VendorLocation;

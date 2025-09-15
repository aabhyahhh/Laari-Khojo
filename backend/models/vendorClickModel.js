const mongoose = require('mongoose');

const vendorClickSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  clickCount: {
    type: Number,
    default: 1,
    min: 0
  },
  lastClickedAt: {
    type: Date,
    default: Date.now
  },
  firstClickedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
vendorClickSchema.index({ vendorId: 1, clickCount: -1 });
vendorClickSchema.index({ clickCount: -1, lastClickedAt: -1 });

// Ensure only one document per vendor
vendorClickSchema.index({ vendorId: 1 }, { unique: true });

vendorClickSchema.on('index', function(err) {
  if (err) {
    console.error('Error creating vendor click indexes:', err);
  } else {
    console.log('Vendor click model indexes created successfully');
  }
});

module.exports = mongoose.model('VendorClick', vendorClickSchema);

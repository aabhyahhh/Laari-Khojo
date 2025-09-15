const mongoose = require('mongoose');
const operatingHoursSchema = require('./operatingHoursModel').schema;
const { isVendorOpenNow } = require('../helpers/timeUtils');

const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password:{
        type: String,
        required: true
    },
    contactNumber:{
        type: String, 
        required: true,
        index: true
    },
    mapsLink:{
        type: String, 
        required: true
    },
    operatingHours: {
        type: operatingHoursSchema,
        required: true
    },
    latitude: {
        type: Number,
        required: false
    },
    longitude: {
        type: Number,
        required: false
    },
    foodType: {
        type: String,
        enum: ['veg', 'non-veg', 'swaminarayan', 'jain', 'none', 'admin'],
        default: 'none'
    },
    profilePicture: {
        type: String,
        default: null
    },
    carouselImages: [{
        type: String
    }]

},{timestamps: true}
);

userSchema.index({ updatedAt: -1 });

userSchema.on('index', function(err) {
    if (err) {
        console.error('Error creating indexes:', err);
    } else {
        console.log('User model indexes created successfully');
    }
});

module.exports = mongoose.model('User', userSchema);
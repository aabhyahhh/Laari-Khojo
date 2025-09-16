const express = require('express');
const router = express.Router();
const { addReview, getReviews } = require('../controllers/reviewController');
const auth = require('../middlewares/authMiddleware');

// Add a review (requires auth)
router.post('/reviews', auth, addReview);

// Get reviews for a vendor
router.get('/reviews', getReviews);

module.exports = router; 
const express = require('express');
const {
  createReview,
  getGigReviews,
  getUserReviews,
  getMyReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController.js');
const auth = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/', auth, createReview);
router.get('/gig/:gigId', getGigReviews);
router.get('/user/:userId', getUserReviews);
router.get('/my-reviews', auth, getMyReviews);
router.put('/:reviewId', auth, updateReview);
router.delete('/:reviewId', auth, deleteReview);

module.exports = router;
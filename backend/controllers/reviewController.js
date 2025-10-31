const Review = require('../models/Review.js');
const Gig = require('../models/Gig.js');
const User = require('../models/User.js');

exports.createReview = async (req, res) => {
  try {
    const { gigId, revieweeId, rating, comment, type } = req.body;

    if (!gigId || !revieweeId || !rating || !comment || !type) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    if (gig.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed gigs'
      });
    }

    const isClient = gig.client.toString() === req.userId;
    const isFreelancer = gig.hiredFreelancer && gig.hiredFreelancer.toString() === req.userId;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this gig'
      });
    }

    if (type === 'client_to_freelancer' && !isClient) {
      return res.status(403).json({
        success: false,
        message: 'Only client can review freelancer'
      });
    }

    if (type === 'freelancer_to_client' && !isFreelancer) {
      return res.status(403).json({
        success: false,
        message: 'Only freelancer can review client'
      });
    }

    const existingReview = await Review.findOne({
      gig: gigId,
      reviewer: req.userId,
      type: type
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this gig'
      });
    }

    const review = new Review({
      gig: gigId,
      reviewer: req.userId,
      reviewee: revieweeId,
      rating,
      comment,
      type
    });

    await review.save();
    await review.populate('reviewer', 'username avatar');
    await review.populate('reviewee', 'username avatar');

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully'
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating review',
      error: error.message
    });
  }
};

exports.getGigReviews = async (req, res) => {
  try {
    const { gigId } = req.params;

    const reviews = await Review.find({ gig: gigId })
      .populate('reviewer', 'username avatar')
      .populate('reviewee', 'username avatar')
      .sort({ createdAt: -1 });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      data: reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length
    });

  } catch (error) {
    console.error('Get gig reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reviews',
      error: error.message
    });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'username avatar')
      .populate('gig', 'title')
      .sort({ createdAt: -1 });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    const ratingCounts = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length
    };

    res.json({
      success: true,
      data: reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingCounts
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reviews',
      error: error.message
    });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviewsGiven = await Review.find({ reviewer: req.userId })
      .populate('reviewee', 'username avatar')
      .populate('gig', 'title')
      .sort({ createdAt: -1 });

    const reviewsReceived = await Review.find({ reviewee: req.userId })
      .populate('reviewer', 'username avatar')
      .populate('gig', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        given: reviewsGiven,
        received: reviewsReceived
      }
    });

  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reviews',
      error: error.message
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({ _id: reviewId, reviewer: req.userId });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or not authorized'
      });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();
    await review.populate('reviewer', 'username avatar');
    await review.populate('reviewee', 'username avatar');

    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating review',
      error: error.message
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId, reviewer: req.userId });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or not authorized'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting review',
      error: error.message
    });
  }
};
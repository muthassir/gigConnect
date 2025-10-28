const User = require('../models/User');
const Review = require('../models/Review');

exports.submitReview = async (req, res) => {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const newReview = new Review({
            product: productId,
            user: userId,
            rating,
            comment
        });
        await newReview.save();
        res.status(201).json({ message: 'Review submitted successfully', review: newReview });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Server error while submitting review' });
    }
};

   
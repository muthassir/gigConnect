import React from "react";
import StarRating from "./StarRating";

const ReviewList = ({ reviews, averageRating, totalReviews, ratingCounts }) => {
  if (totalReviews === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-2xl text-gray-500 mb-4">🌟</div>
        <p className="text-gray-600">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Rating Summary</h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{averageRating}</div>
              <StarRating rating={averageRating} readonly size="lg" />
              <div className="text-sm text-gray-600 mt-2">{totalReviews} reviews</div>
            </div>

            {/* Rating Breakdown */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-8">{star} star</span>
                  <progress 
                    className="progress progress-primary flex-1" 
                    value={ratingCounts[star] || 0} 
                    max={totalReviews}
                  ></progress>
                  <span className="text-sm w-8">({ratingCounts[star] || 0})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Reviews ({totalReviews})</h3>
        {reviews.map((review) => (
          <div key={review._id} className="card bg-base-100 border">
            <div className="card-body">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img 
                        src={review.reviewer.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'} 
                        alt={review.reviewer.username}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{review.reviewer.username}</div>
                    <div className="text-sm text-gray-600">
                      {review.type === 'client_to_freelancer' ? 'Client' : 'Freelancer'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <StarRating rating={review.rating} readonly />
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700">{review.comment}</p>
              
              {review.gig && (
                <div className="mt-2 text-sm text-gray-600">
                  For gig: <span className="font-medium">{review.gig.title}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
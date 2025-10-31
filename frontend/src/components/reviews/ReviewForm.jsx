import React, { useState } from "react";
import { createReview } from "../../services/api";
import StarRating from "./StarRating";
import Alert from "../Alert";

const ReviewForm = ({ gig, reviewee, type, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a review");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createReview({
        gigId: gig._id,
        revieweeId: reviewee._id,
        rating,
        comment: comment.trim(),
        type
      });

      if (response.success) {
        setRating(0);
        setComment("");
        onReviewSubmitted(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to submit review");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (type === 'client_to_freelancer') {
      return `Review ${reviewee.username} (Freelancer)`;
    } else {
      return `Review ${reviewee.username} (Client)`;
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg border">
      <div className="card-body">
        <h3 className="card-title">{getTitle()}</h3>
        
        {error && <Alert alert={error} type="error" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Rating *</span>
            </label>
            <StarRating 
              rating={rating} 
              onRatingChange={setRating}
              size="lg"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Your Review *</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience working with this person..."
              className="textarea textarea-bordered w-full h-32"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Submitting Review...
              </>
            ) : (
              "Submit Review"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
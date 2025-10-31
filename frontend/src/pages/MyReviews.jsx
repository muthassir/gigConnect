import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyReviews } from "../services/api";
import Alert from "../components/Alert";
import StarRating from "../components/reviews/StarRating";


function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState({ given: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyReviews();
  }, []);

  const loadMyReviews = async () => {
    try {
      setLoading(true);
      const response = await getMyReviews();
      if (response.success) {
        setReviews(response.data);
      }
    } catch (err) {
      setError("Failed to load reviews");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-warning">
          <span>Please log in to view your reviews.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">My Reviews</h1>
        <p className="text-gray-600 mt-2">Manage your given and received reviews</p>
      </div>

      {error && <Alert alert={error} type="error" />}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reviews Given */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Reviews Given ({reviews.given.length})</h2>
            {reviews.given.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-4">📝</div>
                <p>You haven't given any reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.given.map((review) => (
                  <div key={review._id} className="card bg-base-100 border">
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full">
                              <img 
                                src={review.reviewee.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'} 
                                alt={review.reviewee.username}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">{review.reviewee.username}</div>
                            <div className="text-sm text-gray-600">
                              {review.type === 'client_to_freelancer' ? 'Freelancer' : 'Client'}
                            </div>
                          </div>
                        </div>
                        <StarRating rating={review.rating} readonly />
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      {review.gig && (
                        <div className="mt-2 text-sm text-gray-600">
                          For: <span className="font-medium">{review.gig.title}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews Received */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Reviews Received ({reviews.received.length})</h2>
            {reviews.received.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-4">⭐</div>
                <p>You haven't received any reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.received.map((review) => (
                  <div key={review._id} className="card bg-base-100 border">
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-3">
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
                        <StarRating rating={review.rating} readonly />
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      {review.gig && (
                        <div className="mt-2 text-sm text-gray-600">
                          For: <span className="font-medium">{review.gig.title}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyReviews;
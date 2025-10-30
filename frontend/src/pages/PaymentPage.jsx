import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchGig } from "../services/api";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "../components/payments/PaymentForm";
import Alert from "../components/Alert";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    loadGig();
  }, [id]);

  const loadGig = async () => {
    try {
      setLoading(true);
      const response = await fetchGig(id);
      setGig(response.data);
    } catch (err) {
      setError("Failed to load gig details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentSuccess(true);
    // You could also show a success message or redirect
    setTimeout(() => {
      navigate('/client/payments');
    }, 3000);
  };

  // Check if user is authorized to make payment
  if (user?.role !== 'client') {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-error">
          <span>Only clients can make payments.</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-error">
          <span>Gig not found.</span>
        </div>
      </div>
    );
  }

  if (gig.client?._id !== user._id) {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-error">
          <span>You are not authorized to make payment for this gig.</span>
        </div>
      </div>
    );
  }

  if (!gig.hiredFreelancer) {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-warning">
          <span>No freelancer has been hired for this gig yet.</span>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="card-title justify-center text-2xl mb-4">Payment Successful!</h2>
            <p className="text-lg mb-2">Thank you for your payment of <strong>${gig.budget}</strong></p>
            <p className="text-gray-600 mb-6">
              The freelancer will receive ${(gig.budget * 0.9).toFixed(2)} after platform fees.
            </p>
            <div className="card-actions justify-center">
              <Link to="/client/payments" className="btn btn-primary">
                View Payment History
              </Link>
              <Link to="/client/dashboard" className="btn btn-ghost">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li><Link to="/gigfeeds">Gig Feed</Link></li>
          <li><Link to={`/gigs/${id}`}>Gig Details</Link></li>
          <li>Make Payment</li>
        </ul>
      </div>

      {error && <Alert alert={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gig Summary */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Gig Summary</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{gig.title}</h3>
                <p className="text-gray-600 mt-1">{gig.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-600">Category:</span>
                  <p>{gig.category}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Budget Type:</span>
                  <p className="capitalize">{gig.budgetType}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Location:</span>
                  <p>{gig.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className={`badge ${
                    gig.status === 'open' ? 'badge-success' :
                    gig.status === 'in-progress' ? 'badge-warning' :
                    gig.status === 'completed' ? 'badge-info' : 'badge-error'
                  }`}>
                    {gig.status}
                  </span>
                </div>
              </div>

              {/* Hired Freelancer */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Hired Freelancer</h4>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      <img 
                        src={gig.hiredFreelancer?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'} 
                        alt={gig.hiredFreelancer?.username}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{gig.hiredFreelancer?.username}</div>
                    <div className="text-sm text-gray-600">Freelancer</div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {gig.skillsRequired && gig.skillsRequired.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {gig.skillsRequired.map((skill, index) => (
                      <span key={index} className="badge badge-outline badge-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          <Elements stripe={stripePromise}>
            <PaymentForm 
              gig={gig} 
              onPaymentSuccess={handlePaymentSuccess}
            />
          </Elements>

          {/* Payment Information */}
          <div className="card bg-info/10 border border-info/20 mt-6">
            <div className="card-body">
              <h4 className="font-semibold text-info mb-3">Payment Information</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-info mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Secure payment processed by Stripe</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-info mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Platform fee: 10% of the total amount</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-info mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Freelancer receives: 90% of the total amount</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-info mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Payment protected by GigConnect escrow</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Test Card Information */}
          <div className="card bg-warning/10 border border-warning/20 mt-4">
            <div className="card-body">
              <h4 className="font-semibold text-warning mb-3">Test Mode</h4>
              <p className="text-sm text-warning mb-2">
                Use the following test card for payments:
              </p>
              <div className="space-y-1 text-sm">
                <div><strong>Card Number:</strong> 4242 4242 4242 4242</div>
                <div><strong>Expiry:</strong> Any future date</div>
                <div><strong>CVC:</strong> Any 3 digits</div>
                <div><strong>ZIP:</strong> Any 5 digits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
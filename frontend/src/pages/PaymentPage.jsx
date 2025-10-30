import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchGig, createPaymentIntent } from "../services/api";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "../components/payments/PaymentForm";
import Alert from "../components/Alert";

const VITE_STRIPE_PUBLISHABLE_KEY = "pk_test_51SI13CIhBdydcxhCtdPmoscbTSZGI5UHQyhJP5kZYwJjBHma4qPiko8pkiu5L6a2agG18UmCffs4vVSFR445msAc00ZR3zplo8"

const stripePromise = loadStripe(VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState(""); 

  useEffect(() => {
    loadGig();
  }, [id]);

  const loadGig = async () => {
    try {
      setLoading(true);
      const response = await fetchGig(id);
      setGig(response.data);
      
      if (response.data) {
        await initializePaymentIntent(response.data._id);
      }
    } catch (err) {
      setError("Failed to load gig details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initializePaymentIntent = async (gigId) => {
    try {
      console.log('Initializing payment intent for gig:', gigId);
      const response = await createPaymentIntent({
        gigId: gigId
      });

      console.log('Payment intent response:', response);

      if (response.success && response.clientSecret) {
        setClientSecret(response.clientSecret);
        console.log('Client secret set:', response.clientSecret);
      } else {
        setError(response.message || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Initialize payment intent error:', err);
      setError('Failed to initialize payment. Please try again.');
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    setPaymentSuccess(true);
    setTimeout(() => {
      navigate('/client/payments');
    }, 3000);
  };

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
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          {clientSecret ? (
            <Elements 
              stripe={stripePromise}
              options={{
                clientSecret: clientSecret,
              }}
            >
              <PaymentForm 
                gig={gig} 
                onPaymentSuccess={handlePaymentSuccess}
              />
            </Elements>
          ) : (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <span className="loading loading-spinner loading-lg mb-4"></span>
                <p>Initializing payment...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
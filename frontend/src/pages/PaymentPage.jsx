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
  const [initializingPayment, setInitializingPayment] = useState(false);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentInitialized, setPaymentInitialized] = useState(false); 

  useEffect(() => {
    loadGig();
  }, [id]);

  const loadGig = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchGig(id);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to load gig');
      }
      
      setGig(response.data);
      
      // FIX: Only initialize payment if not already done and gig exists
      if (response.data && !paymentInitialized && !clientSecret) {
        await initializePaymentIntent(response.data._id);
      }
    } catch (err) {
      setError(err.message || "Failed to load gig details");
      console.error('Load gig error:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializePaymentIntent = async (gigId) => {
    // FIX: Prevent multiple simultaneous calls
    if (initializingPayment) {
      console.log('Payment initialization already in progress');
      return;
    }

    try {
      setInitializingPayment(true);
      setPaymentInitialized(true); // Mark as initialized
      console.log('Initializing payment intent for gig:', gigId);
      
      const response = await createPaymentIntent({
        gigId: gigId
      });

      console.log('Payment intent response:', response);

      if (response.success && response.clientSecret) {
        setClientSecret(response.clientSecret);
        console.log('Client secret set successfully');
        
        // If this is an existing payment, show info message
        if (response.existingPayment) {
          setError("Using existing payment session. Complete the payment or try again if needed.");
        }
      } else {
        throw new Error(response.message || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Initialize payment intent error:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
      setPaymentInitialized(false); // Reset on error to allow retry
    } finally {
      setInitializingPayment(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    setPaymentSuccess(true);
    setTimeout(() => {
      navigate('/client/payments', { 
        state: { message: 'Payment completed successfully!' } 
      });
    }, 3000);
  };

  const handleRetryPayment = async () => {
    setError("");
    setPaymentInitialized(false); // Reset to allow new initialization
    setClientSecret(""); // Clear old client secret
    if (gig) {
      await initializePaymentIntent(gig._id);
    }
  };

  // FIX: Add cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup if component unmounts during payment
      setClientSecret("");
    };
  }, []);

  // Authorization checks
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
        <span className="ml-4">Loading gig details...</span>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-error">
          <span>Gig not found.</span>
        </div>
        <div className="text-center mt-4">
          <Link to="/gigfeeds" className="btn btn-primary">
            Back to Gig Feed
          </Link>
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
        <div className="text-center mt-4">
          <Link to={`/gigs/${gig._id}`} className="btn btn-primary">
            View Gig Details
          </Link>
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
            <div className="card-actions justify-center gap-4">
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

      {error && (
        <div className="mb-6">
          <Alert alert={error} type="error" />
          {gig && (
            <div className="text-center mt-4">
              <button 
                onClick={handleRetryPayment} 
                className="btn btn-primary"
                disabled={initializingPayment}
              >
                {initializingPayment ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Retrying...
                  </>
                ) : (
                  "Retry Payment Setup"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gig Summary */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Gig Summary</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold">{gig.title}</h3>
                <p className="text-gray-600 text-sm">{gig.description}</p>
              </div>
              <div className="flex justify-between">
                <span>Budget:</span>
                <span className="font-bold text-success">${gig.budget}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (10%):</span>
                <span className="text-warning">-${(gig.budget * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Freelancer Receives:</span>
                <span className="font-bold text-primary">${(gig.budget * 0.9).toFixed(2)}</span>
              </div>
              {gig.hiredFreelancer && (
                <div className="mt-4 p-3 bg-base-200 rounded-lg">
                  <p className="text-sm">
                    Payment to: <strong>{gig.hiredFreelancer.username}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          {initializingPayment ? (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <span className="loading loading-spinner loading-lg mb-4"></span>
                <p>Setting up secure payment...</p>
              </div>
            </div>
          ) : clientSecret ? (
            <Elements 
              stripe={stripePromise}
              options={{
                clientSecret: clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <PaymentForm 
                gig={gig} 
                onPaymentSuccess={handlePaymentSuccess}
                clientSecret={clientSecret}
              />
            </Elements>
          ) : (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <div className="text-error mb-4">Payment setup failed</div>
                <button 
                  onClick={handleRetryPayment} 
                  className="btn btn-primary"
                  disabled={initializingPayment}
                >
                  {initializingPayment ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Setting up...
                    </>
                  ) : (
                    "Try Again"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
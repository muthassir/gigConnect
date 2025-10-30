import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import { createPaymentIntent, confirmPayment } from '../../services/api';
import Alert from '../Alert';

function PaymentForm({ gig, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user, API } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentId, setPaymentId] = useState('');

  React.useEffect(() => {
    initializePayment();
  }, [gig]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      const response = await createPaymentIntent({
        gigId: gig._id,
        amount: gig.budget,
        description: `Payment for gig: ${gig.title}`
      });

      if (response.success) {
        setClientSecret(response.clientSecret);
        setPaymentId(response.paymentId);
      } else {
        setError(response.message || 'Failed to initialize payment');
      }
    } catch (err) {
      setError('Failed to initialize payment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required'
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      // Confirm payment with our backend
      if (paymentIntent) {
        const confirmResponse = await confirmPayment({
          paymentIntentId: paymentIntent.id,
          paymentId: paymentId
        });

        if (confirmResponse.success) {
          onPaymentSuccess(paymentIntent);
        } else {
          setError(confirmResponse.message || 'Payment confirmation failed');
        }
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title mb-4">Complete Payment</h2>
        
        {error && <Alert alert={error} type="error" />}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <PaymentElement />
          </div>

          <div className="bg-base-200 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Gig Budget:</span>
                <span>${gig.budget}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (10%):</span>
                <span>${(gig.budget * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Freelancer Receives:</span>
                <span className="text-success">${(gig.budget * 0.9).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || loading}
            className="btn btn-success w-full"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processing...
              </>
            ) : (
              `Pay $${gig.budget}`
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Test Card: 4242 4242 4242 4242</p>
          <p>Any future expiry date, any CVC</p>
        </div>
      </div>
    </div>
  );
}

export default PaymentForm;
import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useAuth } from "../../context/AuthContext";
import { confirmPayment } from "../../services/api";
import Alert from "../Alert";

function PaymentForm({ gig, onPaymentSuccess, clientSecret }) { // Add clientSecret prop
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe not loaded');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/client/payments`,
        },
        redirect: 'if_required'
      });

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      console.log('Payment intent result:', paymentIntent);

      // If payment requires action, Stripe.js will handle it
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment with our backend
        const confirmResponse = await confirmPayment({
          paymentIntentId: paymentIntent.id
        });

        if (confirmResponse.success) {
          console.log('Payment confirmed successfully');
          onPaymentSuccess(paymentIntent);
        } else {
          setError(confirmResponse.message || 'Payment confirmation failed');
        }
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        setError('Payment is processing. Please wait...');
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Stripe.js will handle the redirect
        return;
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-2">Complete Payment</h2>
        <p className="text-gray-600 mb-6">Secure payment processed by Stripe</p>
        
        {error && <Alert alert={error} type="error" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <PaymentElement 
              options={{
                layout: "tabs",
              }}
            />
          </div>

          {/* Payment Summary */}
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-lg">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Gig Budget:</span>
                <span>${gig.budget}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (10%):</span>
                <span>${(gig.budget * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 text-lg">
                <span>Total Amount:</span>
                <span className="text-success">${gig.budget}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 border-t pt-2">
                <span>Freelancer Receives:</span>
                <span>${(gig.budget * 0.9).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || loading}
            className="btn btn-success btn-lg w-full"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processing Payment...
              </>
            ) : (
              `Pay $${gig.budget}`
            )}
          </button>
        </form>

        {/* Test Card Information */}
        <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <h4 className="font-semibold text-warning mb-2">Test Mode</h4>
          <p className="text-sm text-warning mb-3">
            Use the following test card for payments:
          </p>
          <div className="space-y-1 text-sm">
            <div><strong>Card Number:</strong> 4242 4242 4242 4242</div>
            <div><strong>Expiry:</strong> Any future date (e.g., 12/34)</div>
            <div><strong>CVC:</strong> Any 3 digits (e.g., 123)</div>
            <div><strong>ZIP:</strong> Any 5 digits (e.g., 12345)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentForm;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Gig = require('../models/Gig.js');
const Payment = require('../models/Payment.js');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { gigId } = req.body;

    console.log('Creating payment intent for gig:', gigId);

    const gig = await Gig.findById(gigId)
      .populate('client', 'username email')
      .populate('hiredFreelancer', 'username email');

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check if client owns the gig
    if (gig.client._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this gig'
      });
    }

    if (!gig.hiredFreelancer) {
      return res.status(400).json({
        success: false,
        message: 'No freelancer hired for this gig'
      });
    }

    // FIX: Check for existing payment intent first
    let payment = await Payment.findOne({
      gig: gigId,
      status: { $in: ['pending', 'processing'] }
    });

    // If existing pending payment exists, use it
    if (payment && payment.stripePaymentIntentId) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
        
        // If existing intent is still valid, return it
        if (existingIntent.status === 'requires_payment_method' || 
            existingIntent.status === 'requires_confirmation') {
          
          console.log('Reusing existing payment intent:', payment.stripePaymentIntentId);
          
          return res.json({
            success: true,
            clientSecret: existingIntent.client_secret,
            paymentId: payment._id,
            amount: gig.budget,
            existingPayment: true
          });
        }
      } catch (stripeError) {
        // If stripe intent doesn't exist, continue to create new one
        console.log('Existing stripe intent invalid, creating new one');
      }
    }

    // Check for completed payment
    const completedPayment = await Payment.findOne({
      gig: gigId,
      status: 'completed'
    });

    if (completedPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this gig'
      });
    }

    // Calculate amounts
    const totalAmount = Math.round(gig.budget * 100); 
    const platformFee = Math.round(totalAmount * 0.10); 
    const freelancerEarnings = totalAmount - platformFee;

    // Create NEW payment record only if no valid pending one exists
    if (!payment) {
      payment = new Payment({
        gig: gigId,
        client: req.userId,
        freelancer: gig.hiredFreelancer._id,
        amount: gig.budget,
        platformFee: platformFee / 100,
        freelancerEarnings: freelancerEarnings / 100,
        status: 'pending',
        description: `Payment for gig: ${gig.title}`
      });
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      metadata: {
        paymentId: payment._id.toString(),
        gigId: gigId,
        clientId: req.userId,
        freelancerId: gig.hiredFreelancer._id.toString()
      },
      description: `Payment for gig: ${gig.title}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update payment with stripe intent ID
    payment.stripePaymentIntentId = paymentIntent.id;
    await payment.save();

    console.log('Payment intent created:', paymentIntent.id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      amount: gig.budget
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment',
      error: error.message
    });
  }
};

// Confirm Payment - ONLY CHANGED THIS FUNCTION
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    console.log('Confirming payment:', paymentIntentId);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find the payment in database
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId })
      .populate('gig')
      .populate('client', 'username email')
      .populate('freelancer', 'username email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status based on Stripe status
    let updatedStatus = payment.status;
    let message = 'Payment status checked';

    if (paymentIntent.status === 'succeeded') {
      updatedStatus = 'completed';
      payment.completedAt = new Date();
      payment.transactionId = paymentIntent.id;
      message = 'Payment completed successfully';
      
      // ✅ CRITICAL FIX: Update gig status to completed
      if (payment.gig) {
        await Gig.findByIdAndUpdate(payment.gig._id, { 
          status: 'completed' 
        });
        console.log('Gig status updated to completed for gig:', payment.gig._id);
      }
    } else if (paymentIntent.status === 'processing') {
      updatedStatus = 'processing';
      message = 'Payment is processing';
    } else if (paymentIntent.status === 'requires_payment_method') {
      updatedStatus = 'failed';
      message = 'Payment failed - requires payment method';
    } else if (paymentIntent.status === 'canceled') {
      updatedStatus = 'cancelled';
      message = 'Payment was cancelled';
    }

    // Update payment status
    payment.status = updatedStatus;
    await payment.save();

    console.log('Payment confirmed with status:', updatedStatus);

    res.json({
      success: true,
      data: {
        payment: payment,
        stripeStatus: paymentIntent.status
      },
      message: message
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error confirming payment',
      error: error.message
    });
  }
};

// Get client payments
exports.getClientPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ client: req.userId })
      .populate('gig', 'title category')
      .populate('freelancer', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get client payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments',
      error: error.message
    });
  }
};

// Get freelancer payments
exports.getFreelancerPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ freelancer: req.userId })
      .populate('gig', 'title category')
      .populate('client', 'username avatar')
      .sort({ createdAt: -1 });

    // Calculate stats
    const totalEarnings = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.freelancerEarnings, 0);

    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;

    res.json({
      success: true,
      data: payments,
      stats: {
        totalEarnings,
        completedPayments,
        pendingPayments,
        totalPayments: payments.length
      }
    });
  } catch (error) {
    console.error('Get freelancer payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments',
      error: error.message
    });
  }
};
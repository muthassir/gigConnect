const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Gig = require('../models/Gig.js');
const Payment = require('../models/Payment.js');
const User = require('../models/User.js');

// Create Payment Intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { gigId, amount, description } = req.body;

    // Validate gig exists and user is authorized
    const gig = await Gig.findById(gigId)
      .populate('client', 'username email')
      .populate('hiredFreelancer', 'username email');

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check if user is the client who owns the gig
    if (gig.client._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this gig'
      });
    }

    // Check if gig has a hired freelancer
    if (!gig.hiredFreelancer) {
      return res.status(400).json({
        success: false,
        message: 'No freelancer hired for this gig'
      });
    }

    // Calculate amounts
    const totalAmount = Math.round(amount * 100); // Convert to cents
    const platformFee = Math.round(totalAmount * 0.10); // 10% platform fee
    const freelancerEarnings = totalAmount - platformFee;

    // Create payment record in database with 'pending' status
    const payment = new Payment({
      gig: gigId,
      client: req.userId,
      freelancer: gig.hiredFreelancer._id,
      amount: amount,
      platformFee: platformFee / 100,
      freelancerEarnings: freelancerEarnings / 100,
      status: 'pending',
      description: description || `Payment for gig: ${gig.title}`
    });

    await payment.save();

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
      description: description || `Payment for gig: ${gig.title}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update payment with Stripe payment intent ID
    payment.stripePaymentIntentId = paymentIntent.id;
    await payment.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      amount: amount
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

// Confirm Payment (without webhooks)
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, paymentId } = req.body;

    if (!paymentIntentId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and payment ID are required'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find the payment in database
    const payment = await Payment.findById(paymentId)
      .populate('gig')
      .populate('client', 'username email')
      .populate('freelancer', 'username email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user is authorized
    if (payment.client._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this payment'
      });
    }

    // Update payment status based on Stripe status
    let updatedStatus = payment.status;
    let message = 'Payment status checked';

    switch (paymentIntent.status) {
      case 'succeeded':
        updatedStatus = 'completed';
        payment.completedAt = new Date();
        payment.transactionId = paymentIntent.id;
        message = 'Payment completed successfully';
        
        // Update gig status to completed
        if (payment.gig) {
          payment.gig.status = 'completed';
          await payment.gig.save();
        }
        break;
        
      case 'processing':
        updatedStatus = 'processing';
        message = 'Payment is processing';
        break;
        
      case 'requires_payment_method':
        updatedStatus = 'failed';
        message = 'Payment failed - requires payment method';
        break;
        
      case 'canceled':
        updatedStatus = 'cancelled';
        message = 'Payment was cancelled';
        break;
        
      default:
        updatedStatus = 'pending';
        message = 'Payment is still pending';
    }

    // Update payment status
    payment.status = updatedStatus;
    await payment.save();

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

// Check payment status
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('gig', 'title')
      .populate('client', 'username email')
      .populate('freelancer', 'username email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user is authorized (either client or freelancer)
    const isClient = payment.client._id.toString() === req.userId;
    const isFreelancer = payment.freelancer._id.toString() === req.userId;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    // If payment has Stripe ID, check status with Stripe
    if (payment.stripePaymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
        
        // Update payment status if different
        if (payment.status !== paymentIntent.status && paymentIntent.status === 'succeeded') {
          payment.status = 'completed';
          payment.completedAt = new Date();
          payment.transactionId = paymentIntent.id;
          await payment.save();
        }
      } catch (stripeError) {
        console.error('Stripe retrieval error:', stripeError);
        // Continue with current payment status if Stripe check fails
      }
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking payment status',
      error: error.message
    });
  }
};

// Request payment release (for freelancers)
exports.requestPaymentRelease = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('freelancer', 'username email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user is the freelancer
    if (payment.freelancer._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to request release for this payment'
      });
    }

    // Update payment to indicate release requested
    payment.releaseRequested = true;
    payment.releaseRequestedAt = new Date();
    await payment.save();

    res.json({
      success: true,
      message: 'Payment release requested successfully',
      data: payment
    });

  } catch (error) {
    console.error('Request payment release error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error requesting payment release',
      error: error.message
    });
  }
};
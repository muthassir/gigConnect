const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    required: true
  },
  freelancerEarnings: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true
  },
  transactionId: String,
  description: String,
  paymentMethod: {
    type: String,
    default: 'card'
  },
  releaseRequested: {
    type: Boolean,
    default: false
  },
  releaseRequestedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ client: 1, createdAt: -1 });
paymentSchema.index({ freelancer: 1, createdAt: -1 });
paymentSchema.index({ gig: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
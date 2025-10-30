const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  getClientPayments,
  getFreelancerPayments
} = require('../controllers/paymentController.js');
const auth = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/create-intent', auth, createPaymentIntent);
router.post('/confirm', auth, confirmPayment);
router.get('/client/my-payments', auth, getClientPayments);
router.get('/freelancer/my-payments', auth, getFreelancerPayments);

module.exports = router;
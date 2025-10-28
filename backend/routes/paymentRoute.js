const express = require('express');
const { getPaymentStatus, processPayment } = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');
const router = express.Router(); 
   
router.post('/', auth, processPayment);
router.get('/status', auth, getPaymentStatus);
module.exports = router;
 
const express = require('express');
const { getPayments, processPayment } = require('../controllers/paymentController.js');
const auth = require('../middleware/authMiddleware.js');

const router = express.Router(); 
   
router.post('/', auth, processPayment);
router.get('/', auth, getPayments);

module.exports = router;
 
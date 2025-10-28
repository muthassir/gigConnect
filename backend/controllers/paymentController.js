const  User = require('../models/User.js');
const Payment = require('../models/Payment.js');

exports.processPayment = async (req, res) => {  
    const { amount, method, transactionId } = req.body;
    try {
        const newPayment = new Payment({    
            amount,
            method,
            status: 'Completed',    
            transactionId
        });
        await newPayment.save();
        res.status(201).json({ message: 'Payment processed successfully', payment: newPayment });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Server error while processing payment' });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.status(200).json({ payments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Server error while fetching payments' });
    }
};


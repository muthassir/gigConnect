const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        const token = generateToken(newUser._id);
        res.status(201).json({ token });
    } catch (error) {
        console.error('Register controller error:', error); 
  res.status(500).json({ message: error.message || 'Server error' });
    }   
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }   
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user._id);
        res.status(200).json({ token });
    }   catch (error) {     
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUser = async (req, res) => { 
    try {
        const user = await User.findById(req.user.userId).select('-password');  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }   
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }   
};
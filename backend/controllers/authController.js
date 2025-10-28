const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

const getUserDataForResponse = (userDoc) => {
    const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc }; 
    delete user.password;
    return user;
}

// register 
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, role });
        
        await newUser.save();
        
        const token = generateToken(newUser._id);
        const user = getUserDataForResponse(newUser)

        res.status(201).json({ token, user }); 
        
    } catch (error) {
        console.error('Register controller error:', error); 
        res.status(500).json({ message: 'Server error during registration' });
    } 
};

// login
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
        const userResponseData = getUserDataForResponse(user)
        res.status(200).json({ token, user: userResponseData });
        
    } catch (error) {     
        console.error('Login controller error:', error); 
        res.status(500).json({ message: 'Server error during login' });
    }
};

// get user
exports.getUser = async (req, res) => { 
    try {
        const user = await User.findById(req.userId).select('-password'); 
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        } 
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Get user controller error:', error); 
        res.status(500).json({ message: 'Server error' });
    } 
};
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true, 
        unique: true,
    },
    password: {         
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['client', 'freelancer'],
        required: true
    },
    skills: [{
        type: String
    }],
    bio: {
        type: String,
    },
    location: {
        type: String
    },
    portfolio: [{
        title: String,
        description: String,
        imageUrl: String,
        projectUrl: String
    }],
    avatar: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema)
const User = require("../models/User.js")

exports.getProfile = async (req, res) =>{
    try {
        const user = await User.findById(req.userId).select('-password')
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        
        const userProfile = user.toObject ? user.toObject() : { ...user };
        delete userProfile.password;

        res.json({user: userProfile}) 

    } catch (err) {
        console.error("Get profile error", err);
        res.status(500).json({message: "Server error fetching profile."})       
    }
}
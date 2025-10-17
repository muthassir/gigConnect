const User = require("../models/User.js")

exports.getProfile = async (req, res) =>{
    try {
         const user = await User.findById(req.userId)

         if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
         }
        
         res.json({user})

    } catch (err) {
        console.error("Get profile error",err);
        res.status(500).json({message: err})       
    }
}
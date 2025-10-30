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


exports.updateProfile = async (req, res) => {
  try {
    const { username, email, bio, location, skills, avatar } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.skills = skills || user.skills;
    user.avatar = avatar || user.avatar;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: "Server error during profile update",
      error: error.message
    });
  }
};
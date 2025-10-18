const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "No authentication token, authorization denied" });
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) {
            return res.status(401).json({ message: "Token verification failed, authorization denied" });
        }
        req.userId = verified.userId
        next()
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

module.exports = auth;
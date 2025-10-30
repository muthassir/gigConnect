const express = require("express")
const { getProfile, updateProfile } = require("../controllers/userController.js")
const auth = require("../middleware/authMiddleware.js") 

const router = express.Router()

router.get("/profiles", auth, getProfile)
router.put("/profiles", auth, updateProfile)


module.exports = router
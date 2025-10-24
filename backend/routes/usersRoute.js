const express = require("express")
const { getProfile } = require("../controllers/userController.js")
const auth = require("../middleware/authMiddleware.js") 

const router = express.Router()

router.get("/profiles", auth, getProfile)

module.exports = router
const express = require("express")
const { getProfile } = require("../controllers/userController.js")

const router = express.Router()

router.get("/profiles", getProfile)

module.exports = router
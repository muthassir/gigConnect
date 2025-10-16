const express = require('express');
const auth = require('../middleware/authMiddleware.js');

const router = express.Router();

const authController = require('../controllers/authController');

const auth = require("../middleware/authMiddleware.js")

router.post("/register", authController.register)
router.post("/login", authController.login)
router.get("/getUser", auth, authController.getUser)

module.exports = router;
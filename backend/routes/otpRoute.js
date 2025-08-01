const express = require("express");
const router = express.Router();

const otpController = require("../controllers/otpController");

// OTP routes
router.post("/send-otp", otpController.sendOTP);
router.post("/verify-otp", otpController.verifyOTP);

module.exports = router; 
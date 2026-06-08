const express = require('express');
const router  = express.Router();

const {
  sendOTP,
  verifyOTP,
  completeRegistration,
  checkEmailAvailability,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const {
  loginLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
} = require('../middleware/rateLimitMiddleware');

// ── Registration ───────────────────────────────────
router.post('/send-otp',              resendVerificationLimiter, sendOTP);
router.post('/verify-otp',            verifyOTP);
router.post('/complete-registration', completeRegistration);
router.get('/check-email',            checkEmailAvailability);

// ── Auth ───────────────────────────────────────────
router.post('/login',           loginLimiter,          login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password',  resetPassword);
router.get('/me',               protect,               getMe);
router.put('/profile',          protect,               updateProfile);

module.exports = router;
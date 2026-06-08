const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/responseHandler');

const makeLimit = (options) =>
  rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max:      options.max      || 10,
    standardHeaders: true,
    legacyHeaders:   false,
    handler: (req, res) => {
      const wait = Math.ceil(options.windowMs / 60000);
      return sendError(
        res, 429,
        `Too many requests. Please wait ${wait} minute${wait > 1 ? 's' : ''} before trying again.`
      );
    },
    skip: (req) => process.env.NODE_ENV === 'test',
    ...options,
  });

// Login — 10 attempts per 15 min
const loginLimiter = makeLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

// Register — 5 per hour
const registerLimiter = makeLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
});

// Forgot password — 5 per hour
const forgotPasswordLimiter = makeLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
});

// Verification resend — 3 per 5 min
const resendVerificationLimiter = makeLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
});

// General API — 200 per 15 min
const apiLimiter = makeLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
  apiLimiter,
};
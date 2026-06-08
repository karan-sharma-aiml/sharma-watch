const mongoose = require('mongoose');
const crypto   = require('crypto');

const pendingRegistrationSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: true,
    trim:     true,
    maxlength: 50,
  },
  email: {
    type:      String,
    required:  true,
    lowercase: true,
    trim:      true,
  },
  otpHash: {
    type:     String,
    required: true,
  },
  otpExpiry: {
    type:     Date,
    required: true,
  },
  attempts: {
    type:    Number,
    default: 0,
  },
  lockUntil: {
    type:    Date,
    default: null,
  },
  isVerified: {
    type:    Boolean,
    default: false,
  },
  verifiedAt: {
    type:    Date,
    default: null,
  },
  // TTL index — MongoDB auto-deletes after 30 minutes
  createdAt: {
    type:    Date,
    default: Date.now,
  },
});

// ── TTL Index — auto-delete expired entries ────────
pendingRegistrationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 1800 } // 30 minutes
);

// ── Unique email — one pending reg per email ───────
pendingRegistrationSchema.index({ email: 1 }, { unique: true });

// ── Instance methods ───────────────────────────────
pendingRegistrationSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

pendingRegistrationSchema.methods.isOTPExpired = function () {
  return !this.otpExpiry || this.otpExpiry < new Date();
};

// ── Static methods ─────────────────────────────────
pendingRegistrationSchema.statics.generateOTP = function () {
  // 6-digit numeric OTP
  const otp  = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  return { otp, hash };
};

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);
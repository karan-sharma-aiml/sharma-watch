const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const addressSchema = new mongoose.Schema({
  street:   { type: String, default: '' },
  city:     { type: String, default: '' },
  district: { type: String, default: '' },
  province: { type: String, default: '' },
  country:  { type: String, default: 'Nepal' },
  pincode:  { type: String, default: '' },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 50 },
    email:    { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role:     { type: String, enum: ['customer', 'admin'], default: 'customer' },

    // ── Profile ───────────────────────────────────
    phone:   { type: String, default: '', trim: true },
    address: { type: addressSchema, default: () => ({}) },

    // ── Verification ──────────────────────────────
    isVerified:         { type: Boolean, default: false },
    verificationToken:  { type: String, select: false },
    verificationExpiry: { type: Date,   select: false },

    // ── Password Reset ────────────────────────────
    resetPasswordToken:  { type: String, select: false },
    resetPasswordExpiry: { type: Date,   select: false },

    // ── Rate Limiting ─────────────────────────────
    verificationEmailCount:    { type: Number, default: 0 },
    verificationEmailLastSent: { type: Date,   default: null },
    verificationCooldownUntil: { type: Date,   default: null },

    loginAttempts: { type: Number, default: 0 },
    lockUntil:     { type: Date,   default: null },

    lastLogin:  { type: Date,   default: null },
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt    = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generateVerificationToken = function () {
  const plainToken = crypto.randomBytes(32).toString('hex');
  this.verificationToken  = crypto.createHash('sha256').update(plainToken).digest('hex');
  this.verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return plainToken;
};

userSchema.methods.generateResetToken = function () {
  const plainToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken  = crypto.createHash('sha256').update(plainToken).digest('hex');
  this.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
  return plainToken;
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

userSchema.methods.canSendVerificationEmail = function () {
  const now     = new Date();
  const fiveMin = 5 * 60 * 1000;
  if (this.verificationCooldownUntil && this.verificationCooldownUntil > now) {
    return { allowed: false, waitSeconds: Math.ceil((this.verificationCooldownUntil - now) / 1000) };
  }
  if (this.verificationEmailLastSent && (now - this.verificationEmailLastSent) > fiveMin) {
    return { allowed: true, reset: true };
  }
  if (this.verificationEmailCount >= 3) {
    this.verificationCooldownUntil = new Date(now.getTime() + fiveMin);
    return { allowed: false, waitSeconds: 300 };
  }
  return { allowed: true, reset: false };
};

userSchema.index({ email: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

module.exports = mongoose.model('User', userSchema);
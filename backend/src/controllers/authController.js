const crypto = require('crypto');
const User                 = require('../models/User');
const PendingRegistration  = require('../models/PendingRegistration');
const { generateToken }    = require('../config/jwt');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} = require('../services/emailService');

// ── SEND OTP (Step 1 of Registration) ─────────────
// Does NOT create a User — only a PendingRegistration
const sendOTP = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name?.trim()) return sendError(res, 400, 'Name is required.');
    if (!email?.trim()) return sendError(res, 400, 'Email is required.');

    console.log('\n📝 [sendOTP] Request for:', email);

    // 1. Check if email already has a verified User account
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 409,
        'An account with this email already exists. Please login.'
      );
    }

    // 2. Check existing pending registration
    let pending = await PendingRegistration.findOne({
      email: email.toLowerCase(),
    });

    if (pending) {
      // Check if locked
      if (pending.isLocked()) {
        const waitMs   = pending.lockUntil - Date.now();
        const waitMins = Math.ceil(waitMs / 60000);
        return sendError(res, 429,
          `Too many attempts. Please wait ${waitMins} minute(s).`
        );
      }

      // Rate limit OTP sends — max 1 per 60 seconds
      const lastSent = pending.createdAt;
      const elapsed  = Date.now() - new Date(lastSent).getTime();
      if (elapsed < 60 * 1000 && !pending.isOTPExpired()) {
        const waitSec = Math.ceil((60000 - elapsed) / 1000);
        return sendError(res, 429,
          `Please wait ${waitSec} seconds before requesting a new OTP.`
        );
      }

      // Delete old pending — fresh start
      await PendingRegistration.deleteOne({ email: email.toLowerCase() });
    }

    // 3. Generate OTP
    const { otp, hash } = PendingRegistration.generateOTP();

    console.log('   OTP generated:', otp);
    console.log('   Hash stored:', hash.substring(0, 20) + '...');

    // 4. Save pending registration
    await PendingRegistration.create({
      name:      name.trim(),
      email:     email.toLowerCase().trim(),
      otpHash:   hash,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts:  0,
    });

    console.log('   PendingRegistration saved');

    // 5. Send OTP email
    try {
      await sendOTPEmail(name.trim(), email, otp);
    } catch (emailErr) {
      // If email fails, delete pending and tell user
      await PendingRegistration.deleteOne({ email: email.toLowerCase() });
      console.error('   ❌ Email send failed:', emailErr.message);
      return sendError(res, 500,
        'Failed to send OTP email. Please check your email address and try again.'
      );
    }

    return sendSuccess(res, 200,
      'OTP sent to your email. Check your inbox.', {
        email: email.toLowerCase(),
        expiresIn: 600, // 10 minutes in seconds
      }
    );
  } catch (error) {
    console.error('[sendOTP] Error:', error);
    next(error);
  }
};

// ── VERIFY OTP (Step 2 of Registration) ───────────
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email) return sendError(res, 400, 'Email is required.');
    if (!otp)   return sendError(res, 400, 'OTP is required.');
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return sendError(res, 400, 'OTP must be a 6-digit number.');
    }

    console.log('\n🔍 [verifyOTP] Checking OTP for:', email);

    const pending = await PendingRegistration.findOne({
      email: email.toLowerCase(),
    });

    if (!pending) {
      return sendError(res, 400,
        'OTP expired or not found. Please request a new one.'
      );
    }

    // Check lock
    if (pending.isLocked()) {
      const waitMins = Math.ceil(
        (pending.lockUntil - Date.now()) / 60000
      );
      return sendError(res, 429,
        `Too many wrong attempts. Wait ${waitMins} minute(s).`
      );
    }

    // Check OTP expiry
    if (pending.isOTPExpired()) {
      await PendingRegistration.deleteOne({ email: email.toLowerCase() });
      return sendError(res, 400,
        'OTP has expired. Please request a new one.'
      );
    }

    // Hash and compare
    const inputHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    console.log('   Input hash:', inputHash.substring(0, 20) + '...');
    console.log('   Stored hash:', pending.otpHash.substring(0, 20) + '...');

    if (inputHash !== pending.otpHash) {
      pending.attempts += 1;
      console.log('   ❌ Wrong OTP. Attempts:', pending.attempts);

      if (pending.attempts >= 3) {
        pending.lockUntil = new Date(Date.now() + 5 * 60 * 1000);
        await pending.save();
        return sendError(res, 429,
          'Too many wrong attempts. Locked for 5 minutes.'
        );
      }

      await pending.save();
      const remaining = 3 - pending.attempts;
      return sendError(res, 400,
        `Wrong OTP. ${remaining} attempt(s) remaining.`
      );
    }

    // ✅ OTP correct — mark verified
    pending.isVerified  = true;
    pending.verifiedAt  = new Date();
    pending.attempts    = 0;
    pending.lockUntil   = null;
    await pending.save();

    console.log('   ✅ OTP verified for:', email);

    return sendSuccess(res, 200,
      'OTP verified successfully!', {
        email:      pending.email,
        name:       pending.name,
        verified:   true,
      }
    );
  } catch (error) {
    console.error('[verifyOTP] Error:', error);
    next(error);
  }
};

// ── COMPLETE REGISTRATION (Step 3) ────────────────
// Only called AFTER OTP verification
// This is where the User document is created
const completeRegistration = async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email)    return sendError(res, 400, 'Email is required.');
    if (!password) return sendError(res, 400, 'Password is required.');
    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters.');
    }
    if (password !== confirmPassword) {
      return sendError(res, 400, 'Passwords do not match.');
    }

    console.log('\n✅ [completeRegistration] for:', email);

    // 1. Find verified pending registration
    const pending = await PendingRegistration.findOne({
      email:      email.toLowerCase(),
      isVerified: true,
    });

    if (!pending) {
      return sendError(res, 400,
        'Email not verified. Please complete OTP verification first.'
      );
    }

    // 2. Double-check no User already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await PendingRegistration.deleteOne({ email: email.toLowerCase() });
      return sendError(res, 409,
        'Account already exists. Please login.'
      );
    }

    // 3. Create the User
    const user = await User.create({
      name:       pending.name,
      email:      pending.email,
      password,
      isVerified: true, // Already verified via OTP
    });

    console.log('   ✅ User created:', user._id, '|', user.email);

    // 4. Delete pending registration — no longer needed
    await PendingRegistration.deleteOne({ email: email.toLowerCase() });

    // 5. Issue JWT — auto-login
    const jwtToken = generateToken({ id: user._id, role: user.role });

    return sendSuccess(res, 201,
      'Account created successfully! Welcome to Sharma Watch Store.', {
        token: jwtToken,
        user: {
          id:         user._id,
          name:       user.name,
          email:      user.email,
          role:       user.role,
          isVerified: true,
        },
      }
    );
  } catch (error) {
    console.error('[completeRegistration] Error:', error);
    next(error);
  }
};

// ── CHECK EMAIL AVAILABILITY ───────────────────────
const checkEmailAvailability = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return sendError(res, 400, 'Email is required.');

    const exists = await User.findOne({ email: email.toLowerCase() });

    return sendSuccess(res, 200, 'Email check complete.', {
      available: !exists,
      email: email.toLowerCase(),
    });
  } catch (error) {
    next(error);
  }
};

// ── LOGIN ─────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('\n🔑 [login] Attempt:', email);

    const user = await User.findOne({ email: email?.toLowerCase() }).select(
      '+password +isVerified +lockUntil +loginAttempts'
    );

    if (!user) {
      console.log('[login] ❌ User not found:', email);
      return sendError(res, 401, 'Invalid email or password.');
    }

    console.log('[login] User found:', user.email, '| role:', user.role, '| isVerified:', user.isVerified);

    // Check account lock
    if (user.lockUntil && user.lockUntil > new Date()) {
      const wait = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return sendError(res, 423,
        `Account locked. Try again in ${wait} minute(s).`
      );
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil     = new Date(Date.now() + 15 * 60 * 1000);
        user.loginAttempts = 0;
        console.log('[login] ❌ Account locked — too many attempts');
      }
      await user.save();
      return sendError(res, 401, 'Invalid email or password.');
    }

    // ✅ FIXED: Admin accounts bypass email verification
    // Admin is created manually — they never go through OTP flow
    if (!user.isVerified && user.role !== 'admin') {
      console.log('[login] ❌ Email not verified for customer:', email);
      return sendError(res, 403, 'EMAIL_NOT_VERIFIED');
    }

    // Reset login tracking
    user.loginAttempts = 0;
    user.lockUntil     = null;
    user.lastLogin     = new Date();
    user.loginCount    = (user.loginCount || 0) + 1;

    // ✅ Ensure admin accounts get isVerified=true on successful login
    if (user.role === 'admin' && !user.isVerified) {
      user.isVerified = true;
      console.log('[login] Auto-verified admin account:', email);
    }

    await user.save();

    const jwtToken = generateToken({ id: user._id, role: user.role });

    console.log('[login] ✅ Success:', user.email, '| role:', user.role);

    return sendSuccess(res, 200, 'Login successful.', {
      token: jwtToken,
      user: {
        id:         user._id,
        name:       user.name,
        email:      user.email,
        role:       user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('[login] Error:', error);
    next(error);
  }
};

// ── FORGOT PASSWORD ───────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, 'Email is required.');

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+resetPasswordToken +resetPasswordExpiry');

    if (!user) {
      return sendSuccess(res, 200,
        'If this email is registered, a reset link has been sent.', {}
      );
    }

    const plainToken = user.generateResetToken();
    await user.save();

    try {
      await sendPasswordResetEmail(user, plainToken);
    } catch (emailErr) {
      console.error('[forgotPassword] Password reset email failed:', emailErr.message);
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save();
      return sendSuccess(res, 200,
        'If this email is registered, a reset link has been sent.', {}
      );
    }

    return sendSuccess(res, 200,
      'If this email is registered, a reset link has been sent.', {}
    );
  } catch (error) {
    next(error);
  }
};

// ── VERIFY EMAIL TOKEN ────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return sendError(res, 400, 'Verification token required.');

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpiry: { $gt: new Date() },
    });

    if (!user) {
      return sendError(res, 400, 'Invalid or expired verification token.');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpiry = undefined;
    await user.save();

    return sendSuccess(res, 200, 'Email verified successfully.', {});
  } catch (error) {
    next(error);
  }
};

// ── RESEND VERIFICATION EMAIL ─────────────────────
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, 'Email is required.');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return sendError(res, 404, 'Email not found.');
    if (user.isVerified) return sendError(res, 400, 'Email already verified.');

    const limit = user.canSendVerificationEmail();
    if (!limit.allowed) {
      const waitMinutes = Math.ceil(limit.waitSeconds / 60);
      return sendError(res, 429,
        `Please wait ${waitMinutes} minute(s) before requesting another verification email.`
      );
    }

    const plainToken = user.generateVerificationToken();
    user.verificationEmailLastSent = new Date();
    user.verificationEmailCount = (user.verificationEmailCount || 0) + 1;
    if (limit.reset) {
      user.verificationEmailCount = 1;
      user.verificationCooldownUntil = null;
    }

    await user.save();

    try {
      await sendVerificationEmail(user, plainToken);
    } catch (sendErrorException) {
      console.error('[resendVerification] Email send failed:', sendErrorException.message);
      return sendError(res, 500,
        'Failed to send verification email. Please try again later.'
      );
    }

    return sendSuccess(res, 200,
      'Verification email sent. Check your inbox.', { email: user.email }
    );
  } catch (error) {
    next(error);
  }
};

// ── RESET PASSWORD ────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token)    return sendError(res, 400, 'Reset token required.');
    if (!password) return sendError(res, 400, 'Password required.');
    if (password.length < 6) {
      return sendError(res, 400, 'Password min 6 characters.');
    }
    if (password !== confirmPassword) {
      return sendError(res, 400, 'Passwords do not match.');
    }

    const plainToken  = decodeURIComponent(token);
    const hashedToken = crypto
      .createHash('sha256')
      .update(plainToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
    }).select('+resetPasswordToken +resetPasswordExpiry');

    if (!user) {
      return sendError(res, 400, 'Invalid token. Request a new one.');
    }

    if (!user.resetPasswordExpiry ||
        user.resetPasswordExpiry < new Date()) {
      return sendError(res, 400, 'Token expired. Request a new one.');
    }

    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpiry = undefined;
    user.loginAttempts       = 0;
    user.lockUntil           = null;
    await user.save();

    return sendSuccess(res, 200,
      'Password reset successfully. Please login.', {}
    );
  } catch (error) {
    next(error);
  }
};

// ── GET ME ────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, 'User not found.');
    return sendSuccess(res, 200, 'Profile fetched.', { user });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE PROFILE ────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const {
      name, phone,
      street, city, district, province, country, pincode,
    } = req.body;

    const updates = {};

    if (name?.trim())   updates.name  = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    // Build address object — only update provided fields
    updates.address = {
      street:   street   || '',
      city:     city     || '',
      district: district || '',
      province: province || '',
      country:  country  || 'Nepal',
      pincode:  pincode  || '',
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) return sendError(res, 404, 'User not found.');

    console.log('[updateProfile] Updated for:', user.email);

    return sendSuccess(res, 200, 'Profile updated successfully.', { user });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  sendOTP,
  verifyOTP,
  completeRegistration,
  checkEmailAvailability,
  login,
  forgotPassword,
  verifyEmail,
  resendVerification,
  resetPassword,
  getMe,
  updateProfile
};
import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser, FiMail, FiLock, FiEye, FiEyeOff,
  FiCheck, FiArrowRight, FiRefreshCw,
} from 'react-icons/fi';
import { authAPI }       from '../services/api';
import { useAuth }       from '../context/AuthContext';
import { useToast }      from '../context/ToastContext';

// ── Styles ─────────────────────────────────────────
const G      = '#d4af37';
const bg     = '#080808';
const card   = '#111111';
const c2     = '#1a1a1a';
const border = '#2a2a2a';

// ── Password Strength ──────────────────────────────
const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6)                        score += 1;
  if (pw.length >= 10)                       score += 1;
  if (/[A-Z]/.test(pw))                      score += 1;
  if (/[0-9]/.test(pw))                      score += 1;
  if (/[^A-Za-z0-9]/.test(pw))              score += 1;

  const levels = [
    { label: '',            color: '' },
    { label: 'Very Weak',   color: '#ef4444' },
    { label: 'Weak',        color: '#f97316' },
    { label: 'Fair',        color: '#fbbf24' },
    { label: 'Strong',      color: '#84cc16' },
    { label: 'Very Strong', color: '#22c55e' },
  ];
  return { score, ...levels[score] };
};

// ── OTP Input Component ────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([]);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;

    const char   = val.slice(-1);
    const newOTP = value.split('');
    newOTP[index] = char;
    onChange(newOTP.join(''));

    // Auto-focus next
    if (char && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOTP  = value.split('');
      newOTP[index] = '';
      onChange(newOTP.join(''));
      if (index > 0) inputs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft'  && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, '').slice(0, 6));
      const nextIndex = Math.min(pasted.length, 5);
      inputs.current[nextIndex]?.focus();
    }
  };

  return (
    <div style={{
      display: 'flex', gap: 10, justifyContent: 'center',
    }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: 48, height: 56,
            textAlign: 'center',
            fontSize: 22, fontWeight: 700,
            background: value[i] ? 'rgba(212,175,55,0.08)' : c2,
            border: `2px solid ${value[i] ? G : border}`,
            borderRadius: 12, color: G,
            outline: 'none',
            transition: 'all 0.15s',
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.5 : 1,
            fontFamily: 'monospace',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = G;
            e.target.style.boxShadow = `0 0 0 3px rgba(212,175,55,0.15)`;
          }}
          onBlur={(e) => {
            if (!value[i]) e.target.style.borderColor = border;
            e.target.style.boxShadow = 'none';
          }}
        />
      ))}
    </div>
  );
}

// ── Main Register Component ────────────────────────
export default function Register() {
  const navigate       = useNavigate();
  const { saveAuth }   = useAuth();
  const { addToast }   = useToast();

  // ── Steps ─────────────────────────────────────────
  // 1 = identity, 2 = otp, 3 = password
  const [step, setStep] = useState(1);

  // ── Form State ─────────────────────────────────────
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [otp,             setOtp]             = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── UI State ───────────────────────────────────────
  const [loading,       setLoading]       = useState(false);
  const [errors,        setErrors]        = useState({});
  const [showPw,        setShowPw]        = useState(false);
  const [showCPw,       setShowCPw]       = useState(false);
  const [emailAvailable, setEmailAvail]   = useState(null);
  const [checkingEmail,  setCheckingEmail] = useState(false);

  // ── OTP Timer ─────────────────────────────────────
  const [countdown,    setCountdown]    = useState(0);
  const [otpLocked,    setOtpLocked]    = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const timerRef = useRef(null);

  const pwStrength = getPasswordStrength(password);

  // ── Email availability debounce check ─────────────
  useEffect(() => {
    if (step !== 1) return;
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailAvail(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const { data } = await authAPI.checkEmail(email);
        setEmailAvail(data.data.available);
      } catch {
        setEmailAvail(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [email, step]);

  // ── OTP countdown ──────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [countdown]);

  // ── Lock countdown ──────────────────────────────────
  useEffect(() => {
    if (lockCountdown <= 0) { setOtpLocked(false); return; }
    const t = setInterval(() => {
      setLockCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          setOtpLocked(false);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [lockCountdown]);

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  // ── Step 1 — Send OTP ──────────────────────────────
  const handleSendOTP = async () => {
    const e = {};
    if (!name.trim())     e.name  = 'Name is required.';
    if (name.trim().length < 2) e.name = 'Min 2 characters.';
    if (!email.trim())    e.email = 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email.';
    if (emailAvailable === false) e.email = 'This email is already registered.';

    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setErrors({});

    try {
      await authAPI.sendOTP({ name: name.trim(), email: email.trim() });
      addToast(`OTP sent to ${email}!`, 'success');
      setStep(2);
      setOtp('');
      setCountdown(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP.';
      if (msg.includes('already exists')) {
        setErrors({ email: 'This email is already registered.' });
      } else if (msg.includes('wait')) {
        const match = msg.match(/(\d+) second/);
        if (match) setCountdown(parseInt(match[1]));
        addToast(msg, 'warning');
      } else {
        addToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 — Verify OTP ────────────────────────────
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: 'Enter all 6 digits.' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await authAPI.verifyOTP({ email: email.trim(), otp });
      addToast('Email verified successfully!', 'success');
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP.';

      if (msg.includes('Locked') || msg.includes('Too many')) {
        setOtpLocked(true);
        const match = msg.match(/(\d+) minute/);
        if (match) setLockCountdown(parseInt(match[1]) * 60);
        addToast(msg, 'error');
      } else {
        setErrors({ otp: msg });
      }
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      await authAPI.sendOTP({ name: name.trim(), email: email.trim() });
      addToast('New OTP sent!', 'success');
      setOtp('');
      setCountdown(60);
      setErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend.';
      const match = msg.match(/(\d+) second/);
      if (match) setCountdown(parseInt(match[1]));
      addToast(msg, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3 — Complete Registration ─────────────────
  const handleCompleteRegistration = async () => {
    const e = {};
    if (!password)          e.password = 'Password is required.';
    if (password.length < 6) e.password = 'Minimum 6 characters.';
    if (password !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setErrors({});

    try {
      const { data } = await authAPI.completeRegistration({
        email: email.trim(),
        password,
        confirmPassword,
      });

      saveAuth(data.data.user, data.data.token);
      addToast(`Welcome to Sharma Watch Store, ${data.data.user.name}! 🎉`, 'success');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      addToast(msg, 'error');
      if (msg.includes('OTP') || msg.includes('verified')) {
        setStep(1);
        addToast('Please start registration again.', 'warning');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Input style ────────────────────────────────────
  const inputWrap = (hasError) => ({
    display: 'flex', alignItems: 'center',
    background: c2, border: `1px solid ${hasError ? '#ef4444' : border}`,
    borderRadius: 12, overflow: 'hidden',
    transition: 'border-color 0.2s',
  });

  const inputStyle = {
    flex: 1, background: 'transparent', border: 'none',
    padding: '12px', color: '#fff', fontSize: 13, outline: 'none',
  };

  const iconStyle = { marginLeft: 14, flexShrink: 0 };

  const labelStyle = {
    display: 'block', color: '#888', fontSize: 11,
    fontWeight: 600, marginBottom: 6, letterSpacing: 0.5,
  };

  const errStyle = { color: '#ef4444', fontSize: 11, marginTop: 5 };

  // ── Step indicator ─────────────────────────────────
  const steps = [
    { n: 1, label: 'Identity'     },
    { n: 2, label: 'Verify Email' },
    { n: 3, label: 'Password'     },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: bg,
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <p style={{
              color: G, fontSize: 24, fontWeight: 800,
              letterSpacing: 5, fontFamily: 'Georgia, serif', margin: 0,
            }}>
              SHARMA
            </p>
            <p style={{
              color: '#555', fontSize: 9,
              letterSpacing: 5, margin: '3px 0 0',
            }}>
              WATCH STORE
            </p>
          </Link>
        </div>

        {/* Step Indicator */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 0, marginBottom: 28,
        }}>
          {steps.map((s, idx) => (
            <React.Fragment key={s.n}>
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  background: step > s.n
                    ? '#22c55e'
                    : step === s.n
                      ? G
                      : '#1a1a1a',
                  border: `2px solid ${
                    step > s.n
                      ? '#22c55e'
                      : step === s.n
                        ? G
                        : border
                  }`,
                  transition: 'all 0.3s',
                }}>
                  {step > s.n
                    ? <FiCheck size={14} color="#fff" />
                    : <span style={{
                        color: step === s.n ? '#000' : '#666',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {s.n}
                      </span>
                  }
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: step === s.n ? G : '#555',
                  letterSpacing: 0.5,
                  transition: 'color 0.3s',
                }}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div style={{
                  flex: 1, height: 2, maxWidth: 60,
                  background: step > s.n ? '#22c55e' : border,
                  marginBottom: 20,
                  transition: 'background 0.3s',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: card, border: `1px solid ${border}`,
          borderRadius: 24, padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}>

          {/* ── STEP 1: Identity ─────────────────────── */}
          {step === 1 && (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  color: '#fff', fontSize: 22, fontWeight: 700,
                  margin: '0 0 6px', fontFamily: 'Georgia, serif',
                }}>
                  Create Account
                </h2>
                <p style={{ color: '#666', fontSize: 13, margin: 0 }}>
                  Enter your details to get started
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Name */}
                <div>
                  <label style={labelStyle}>FULL NAME</label>
                  <div style={inputWrap(errors.name)}>
                    <FiUser size={15} color="#555" style={iconStyle} />
                    <input
                      type="text" value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearError('name');
                      }}
                      placeholder="Your full name"
                      style={inputStyle}
                    />
                    {name.trim().length >= 2 && (
                      <FiCheck
                        size={14} color="#22c55e"
                        style={{ marginRight: 14 }}
                      />
                    )}
                  </div>
                  {errors.name && (
                    <p style={errStyle}>{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>EMAIL ADDRESS</label>
                  <div style={inputWrap(errors.email)}>
                    <FiMail size={15} color="#555" style={iconStyle} />
                    <input
                      type="email" value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError('email');
                        setEmailAvail(null);
                      }}
                      placeholder="you@example.com"
                      style={inputStyle}
                    />
                    <div style={{ marginRight: 14 }}>
                      {checkingEmail && (
                        <div style={{
                          width: 14, height: 14,
                          borderRadius: '50%',
                          border: '2px solid #333',
                          borderTopColor: G,
                          animation: 'spin 0.8s linear infinite',
                        }} />
                      )}
                      {!checkingEmail && emailAvailable === true && (
                        <FiCheck size={14} color="#22c55e" />
                      )}
                      {!checkingEmail && emailAvailable === false && (
                        <span style={{
                          color: '#ef4444', fontSize: 16,
                        }}>✕</span>
                      )}
                    </div>
                  </div>
                  {errors.email && (
                    <p style={errStyle}>{errors.email}</p>
                  )}
                  {!errors.email && emailAvailable === false && (
                    <p style={errStyle}>
                      Email already registered.{' '}
                      <Link
                        to="/login"
                        style={{ color: G }}
                      >
                        Login instead?
                      </Link>
                    </p>
                  )}
                  {!errors.email && emailAvailable === true && (
                    <p style={{ color: '#22c55e', fontSize: 11, marginTop: 5 }}>
                      ✓ Email available
                    </p>
                  )}
                </div>

                {/* Send OTP Button */}
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading || emailAvailable === false}
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    background: G, color: '#000', border: 'none',
                    padding: '13px', borderRadius: 12,
                    fontWeight: 700, fontSize: 14,
                    cursor: loading || emailAvailable === false
                      ? 'not-allowed' : 'pointer',
                    opacity: loading || emailAvailable === false ? 0.7 : 1,
                    boxShadow: '0 4px 15px rgba(212,175,55,0.2)',
                    marginTop: 4,
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2px solid rgba(0,0,0,0.3)',
                        borderTopColor: '#000',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Sending OTP…
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <FiArrowRight size={15} />
                    </>
                  )}
                </button>

                <p style={{
                  textAlign: 'center', color: '#555',
                  fontSize: 12, margin: 0,
                }}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{ color: G }}
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* ── STEP 2: OTP ──────────────────────────── */}
          {step === 2 && (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  color: '#fff', fontSize: 22, fontWeight: 700,
                  margin: '0 0 6px', fontFamily: 'Georgia, serif',
                }}>
                  Verify Your Email
                </h2>
                <p style={{ color: '#666', fontSize: 13, margin: 0 }}>
                  We sent a 6-digit code to{' '}
                  <strong style={{ color: '#aaa' }}>{email}</strong>
                </p>
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column',
                gap: 20,
              }}>

                {/* OTP Input */}
                <div>
                  <OTPInput
                    value={otp}
                    onChange={(v) => {
                      setOtp(v);
                      clearError('otp');
                    }}
                    disabled={loading || otpLocked}
                  />
                  {errors.otp && (
                    <p style={{
                      ...errStyle, textAlign: 'center', marginTop: 12,
                    }}>
                      {errors.otp}
                    </p>
                  )}
                </div>

                {/* Lock Warning */}
                {otpLocked && (
                  <div style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 10, padding: '12px 16px',
                    textAlign: 'center',
                  }}>
                    <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>
                      🔒 Too many attempts.
                      Try again in{' '}
                      {Math.floor(lockCountdown / 60)}:
                      {String(lockCountdown % 60).padStart(2, '0')}
                    </p>
                  </div>
                )}

                {/* Verify Button */}
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6 || otpLocked}
                  style={{
                    background: otp.length === 6 && !otpLocked
                      ? G : '#222',
                    color: otp.length === 6 && !otpLocked
                      ? '#000' : '#555',
                    border: 'none', padding: '13px', borderRadius: 12,
                    fontWeight: 700, fontSize: 14,
                    cursor: loading || otp.length !== 6 || otpLocked
                      ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2px solid rgba(0,0,0,0.3)',
                        borderTopColor: otp.length === 6 ? '#000' : '#555',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Verifying…
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                {/* Resend */}
                <div style={{ textAlign: 'center' }}>
                  {countdown > 0 ? (
                    <p style={{ color: '#555', fontSize: 13, margin: 0 }}>
                      Resend OTP in{' '}
                      <strong style={{ color: G }}>
                        {countdown}s
                      </strong>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      style={{
                        background: 'none', border: 'none',
                        color: G, fontSize: 13, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center',
                        gap: 5, textDecoration: 'underline',
                      }}
                    >
                      <FiRefreshCw size={13} />
                      Resend OTP
                    </button>
                  )}
                </div>

                {/* Back */}
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrors({}); }}
                  style={{
                    background: 'none', border: 'none',
                    color: '#555', fontSize: 12,
                    cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  ← Change email address
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Password ─────────────────────── */}
          {step === 3 && (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 10, marginBottom: 6,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FiCheck size={14} color="#22c55e" />
                  </div>
                  <p style={{ color: '#22c55e', fontSize: 13, margin: 0 }}>
                    {email} verified
                  </p>
                </div>
                <h2 style={{
                  color: '#fff', fontSize: 22, fontWeight: 700,
                  margin: '0 0 6px', fontFamily: 'Georgia, serif',
                }}>
                  Create Password
                </h2>
                <p style={{ color: '#666', fontSize: 13, margin: 0 }}>
                  Choose a strong password for your account
                </p>
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>

                {/* Password */}
                <div>
                  <label style={labelStyle}>PASSWORD</label>
                  <div style={inputWrap(errors.password)}>
                    <FiLock size={15} color="#555" style={iconStyle} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearError('password');
                      }}
                      placeholder="Min 6 characters"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      style={{
                        background: 'none', border: 'none',
                        color: '#555', padding: '0 14px',
                        cursor: 'pointer',
                      }}
                    >
                      {showPw
                        ? <FiEyeOff size={15} />
                        : <FiEye size={15} />}
                    </button>
                  </div>

                  {/* Strength Meter */}
                  {password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{
                        display: 'flex', gap: 4, marginBottom: 4,
                      }}>
                        {[1,2,3,4,5].map((i) => (
                          <div key={i} style={{
                            flex: 1, height: 3, borderRadius: 2,
                            background: i <= pwStrength.score
                              ? pwStrength.color
                              : '#2a2a2a',
                            transition: 'background 0.2s',
                          }} />
                        ))}
                      </div>
                      <p style={{
                        fontSize: 11, margin: 0,
                        color: pwStrength.color,
                      }}>
                        {pwStrength.label}
                      </p>
                    </div>
                  )}

                  {errors.password && (
                    <p style={errStyle}>{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={labelStyle}>CONFIRM PASSWORD</label>
                  <div style={inputWrap(errors.confirmPassword)}>
                    <FiLock size={15} color="#555" style={iconStyle} />
                    <input
                      type={showCPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearError('confirmPassword');
                      }}
                      placeholder="Repeat password"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCPw(!showCPw)}
                      style={{
                        background: 'none', border: 'none',
                        color: '#555', padding: '0 14px',
                        cursor: 'pointer',
                      }}
                    >
                      {showCPw
                        ? <FiEyeOff size={15} />
                        : <FiEye size={15} />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p style={{
                      fontSize: 11, marginTop: 5,
                      color: password === confirmPassword
                        ? '#22c55e' : '#ef4444',
                    }}>
                      {password === confirmPassword
                        ? '✓ Passwords match'
                        : '✗ Passwords do not match'}
                    </p>
                  )}
                  {errors.confirmPassword && (
                    <p style={errStyle}>{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Create Account Button */}
                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  disabled={loading}
                  style={{
                    background: G, color: '#000', border: 'none',
                    padding: '14px', borderRadius: 12,
                    fontWeight: 700, fontSize: 14,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    boxShadow: '0 4px 15px rgba(212,175,55,0.25)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    marginTop: 4,
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2px solid rgba(0,0,0,0.3)',
                        borderTopColor: '#000',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Creating Account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <FiArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #1a1a1a inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>
    </div>
  );
}
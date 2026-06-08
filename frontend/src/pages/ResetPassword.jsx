import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const { addToast }    = useToast();
  const token           = searchParams.get('token');

  const [form,    setForm]    = useState({ password: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const G = '#d4af37';

  const validate = () => {
    const e = {};
    if (!form.password)         e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password: form.password, confirmPassword: form.confirm });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      addToast(err.response?.data?.message || 'Reset failed.', 'error');
      if (err.response?.data?.message?.includes('expired')) {
        setErrors({ general: 'Token expired. Please request a new reset link.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontSize: 16 }}>Invalid reset link.</p>
          <Link to="/forgot-password" style={{ color: G, fontSize: 14 }}>Request a new one</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <p style={{ color: G, fontSize: 22, fontWeight: 800, letterSpacing: 3, fontFamily: 'serif', margin: 0 }}>SHARMA</p>
            <p style={{ color: '#555', fontSize: 9, letterSpacing: 4, margin: '2px 0 0' }}>WATCH STORE</p>
          </Link>
        </div>

        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 24, padding: '36px 32px' }}>

          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FiCheckCircle size={26} color="#34d399" />
              </div>
              <h2 style={{ color: '#fff', fontFamily: 'serif', fontSize: 20, margin: '0 0 8px' }}>Password Reset!</h2>
              <p style={{ color: '#888', fontSize: 13 }}>Redirecting to login in 3 seconds…</p>
            </div>
          ) : (
            <>
              <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 6px', fontFamily: 'serif' }}>
                Reset Password
              </h2>
              <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>
                Enter your new password below.
              </p>

              {errors.general && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                  <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* New Password */}
                <div>
                  <label style={{ display: 'block', color: '#888', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
                    NEW PASSWORD
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', border: `1px solid ${errors.password ? '#ef4444' : '#2a2a2a'}`, borderRadius: 12, overflow: 'hidden' }}>
                    <FiLock size={14} color="#555" style={{ marginLeft: 14 }} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Min 6 characters"
                      style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: '#fff', fontSize: 13, outline: 'none' }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', color: '#555', padding: '0 14px', cursor: 'pointer' }}>
                      {showPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                  {errors.password && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', color: '#888', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
                    CONFIRM PASSWORD
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', border: `1px solid ${errors.confirm ? '#ef4444' : '#2a2a2a'}`, borderRadius: 12, overflow: 'hidden' }}>
                    <FiLock size={14} color="#555" style={{ marginLeft: 14 }} />
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                      placeholder="Repeat new password"
                      style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: '#fff', fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  {errors.confirm && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.confirm}</p>}
                </div>

                <button type="submit" disabled={loading}
                  style={{ background: G, color: '#000', border: 'none', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 15px rgba(212,175,55,0.2)' }}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
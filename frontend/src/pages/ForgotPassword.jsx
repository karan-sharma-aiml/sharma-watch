import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const G      = '#d4af37';
  const bg     = '#080808';
  const card   = '#111111';
  const border = '#2a2a2a';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required.'); return; }
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('Too many')) {
        setError(msg);
      } else {
        setError('Unable to send reset link right now. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <p style={{ color: G, fontSize: 22, fontWeight: 800, letterSpacing: 3, fontFamily: 'serif', margin: 0 }}>SHARMA</p>
            <p style={{ color: '#555', fontSize: 9, letterSpacing: 4, margin: '2px 0 0' }}>WATCH STORE</p>
          </Link>
        </div>

        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 24, padding: '36px 32px', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: `1px solid rgba(212,175,55,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <FiMail size={24} color={G} />
              </div>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 10px', fontFamily: 'serif' }}>
                Check Your Email
              </h2>
              <p style={{ color: '#888', fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
                If <strong style={{ color: '#ccc' }}>{email}</strong> is registered,
                a password reset link has been sent. Check your inbox and spam folder.
              </p>
              <p style={{ color: '#555', fontSize: 11, marginBottom: 20 }}>
                Link expires in <strong style={{ color: G }}>1 hour</strong>
              </p>
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#888', fontSize: 13, textDecoration: 'none' }}>
                <FiArrowLeft size={13} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 6px', fontFamily: 'serif' }}>
                  Forgot Password?
                </h2>
                <p style={{ color: '#666', fontSize: 13 }}>
                  Enter your email and we'll send a reset link.
                </p>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                  <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', color: '#888', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
                    EMAIL ADDRESS
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
                    <FiMail size={15} color="#555" style={{ marginLeft: 14, flexShrink: 0 }} />
                    <input
                      type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: '#fff', fontSize: 13, outline: 'none' }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: G, color: '#000', border: 'none', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 15px rgba(212,175,55,0.2)' }}>
                  <FiSend size={15} />
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>

                <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#666', fontSize: 13, textDecoration: 'none', marginTop: 4 }}>
                  <FiArrowLeft size={13} /> Back to Login
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import {
  FiCheckCircle, FiXCircle, FiMail,
} from 'react-icons/fi';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status,    setStatus]    = useState('loading');
  const [email,     setEmail]     = useState('');
  const [resending, setResending] = useState(false);
  const [resent,    setResent]    = useState(false);
  const [cooldown,  setCooldown]  = useState(0);
  const [errMsg,    setErrMsg]    = useState('');

  useEffect(() => {
    const rawToken = searchParams.get('token');

    console.log('[VerifyEmail] Raw token:', rawToken?.substring(0, 30));

    if (!rawToken) {
      setStatus('invalid');
      return;
    }

    // Call backend to verify
    authAPI.verifyEmail(rawToken)
      .then(() => {
        console.log('[VerifyEmail] ✅ Success');
        setStatus('success');
      })
      .catch((err) => {
        const msg = err.response?.data?.message || '';
        console.log('[VerifyEmail] ❌ Error:', msg);
        setStatus('invalid');
        setErrMsg(msg);
      });
  }, []);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setResending(true);
    setErrMsg('');

    try {
      await authAPI.resendVerification(email.trim());
      setResent(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error hua।';
      if (msg.toLowerCase().includes('minute')) {
        const match = msg.match(/(\d+) minute/);
        if (match) setCooldown(parseInt(match[1]));
      }
      setErrMsg(msg);
    } finally {
      setResending(false);
    }
  };

  // ── Styles ──────────────────────────────────────
  const G      = '#d4af37';
  const bg     = '#080808';
  const card   = '#111111';
  const border = '#2a2a2a';

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 460,
        background: card,
        border: `1px solid ${border}`,
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }}>

        {/* Logo Header */}
        <div style={{
          background: 'linear-gradient(135deg,#0d0d0d,#1a1400)',
          padding: '28px 32px',
          textAlign: 'center',
          borderBottom: `1px solid ${border}`,
        }}>
          <p style={{
            color: G, fontSize: 20, fontWeight: 800,
            letterSpacing: 5, margin: 0,
          }}>
            SHARMA
          </p>
          <p style={{
            color: '#555', fontSize: 9,
            letterSpacing: 4, margin: '4px 0 0',
          }}>
            WATCH STORE
          </p>
        </div>

        <div style={{ padding: '40px 32px' }}>

          {/* LOADING */}
          {status === 'loading' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: '50%',
                border: `3px solid ${border}`,
                borderTopColor: G,
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px',
              }} />
              <p style={{ color: '#888', fontSize: 14 }}>
                Verification ho rahi hai…
              </p>
            </div>
          )}

          {/* SUCCESS */}
          {status === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: 'rgba(52,211,153,0.1)',
                border: '2px solid rgba(52,211,153,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <FiCheckCircle size={32} color="#34d399" />
              </div>
              <h2 style={{
                color: '#fff', fontSize: 24,
                fontWeight: 700, margin: '0 0 12px',
                fontFamily: 'Georgia, serif',
              }}>
                Email Verified! ✅
              </h2>
              <p style={{
                color: '#888', fontSize: 14,
                lineHeight: 1.7, marginBottom: 28,
              }}>
                Tera account activate ho gaya।<br />
                Ab login karke shopping shuru karo।
              </p>
              <Link to="/login" style={{
                display: 'inline-block',
                background: G, color: '#000',
                textDecoration: 'none',
                padding: '13px 40px',
                borderRadius: 12,
                fontWeight: 700, fontSize: 15,
              }}>
                Login Karo →
              </Link>
            </div>
          )}

          {/* INVALID / EXPIRED */}
          {status === 'invalid' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.1)',
                border: '2px solid rgba(239,68,68,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <FiXCircle size={32} color="#ef4444" />
              </div>
              <h2 style={{
                color: '#fff', fontSize: 22,
                fontWeight: 700, margin: '0 0 10px',
                fontFamily: 'Georgia, serif',
              }}>
                Link Kaam Nahi Kiya
              </h2>
              <p style={{
                color: '#888', fontSize: 14,
                lineHeight: 1.7, marginBottom: 24,
              }}>
                Verification link expire ho gayi ya already use ho chuki hai।
                <br />Naya link mangwao neeche।
              </p>

              {resent ? (
                <div style={{
                  background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.25)',
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <p style={{ color: '#34d399', fontSize: 14, margin: 0 }}>
                    ✅ Naya verification email bhej diya!<br/>
                    Inbox aur Spam folder check karo।
                  </p>
                </div>
              ) : cooldown > 0 ? (
                <div style={{
                  background: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.25)',
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <p style={{ color: '#fbbf24', fontSize: 14, margin: 0 }}>
                    ⏳ Bahut zyada requests।
                    {cooldown} minute baad try karo।
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleResend}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {errMsg && (
                    <p style={{
                      color: '#ef4444', fontSize: 12,
                      margin: 0, textAlign: 'left',
                    }}>
                      {errMsg}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#1a1a1a',
                    border: `1px solid ${border}`,
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}>
                    <FiMail
                      size={15} color="#555"
                      style={{ marginLeft: 14, flexShrink: 0 }}
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Apna registered email dalo"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        padding: '12px',
                        color: '#fff',
                        fontSize: 13,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resending}
                    style={{
                      background: G,
                      color: '#000',
                      border: 'none',
                      padding: '13px',
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: resending ? 'not-allowed' : 'pointer',
                      opacity: resending ? 0.7 : 1,
                    }}
                  >
                    {resending
                      ? 'Bhej raha hai…'
                      : 'Naya Verification Email Bhejo'}
                  </button>
                </form>
              )}

              <div style={{ marginTop: 20 }}>
                <Link to="/login" style={{
                  color: '#666', fontSize: 13,
                  textDecoration: 'none',
                }}>
                  ← Wapas Login Pe Jao
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
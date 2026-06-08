import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const G = "#d4af37";
  const bg = "#080808";
  const card = "#111111";
  const c2 = "#1a1a1a";
  const border = "#2a2a2a";

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email.";
    if (!form.password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const res = await login(form.email.trim(), form.password);
    setLoading(false);

    console.log("[Login] Result:", {
      success: res.success,
      role: res.user?.role,
      isUnverified: res.isUnverified,
      message: res.message,
    });

    if (res.success) {
      addToast(`Welcome back, ${res.user?.name}!`, "success");

      // ✅ FIXED: Admin always goes to /admin panel
      if (res.user?.role === "admin") {
        console.log("[Login] Admin detected → navigating to /admin");
        navigate("/admin", { replace: true });
        return;
      }

      // Customer — go to original page, but never to /admin
      const safeDest = from.startsWith("/admin") ? "/" : from || "/";
      console.log("[Login] Customer → navigating to:", safeDest);
      navigate(safeDest, { replace: true });
      return;
    }

    // Unverified customer email
    if (res.isUnverified || res.message === "EMAIL_NOT_VERIFIED") {
      addToast("Please verify your email first.", "warning");
      navigate("/verify-email?status=pending");
      return;
    }

    // General error
    addToast(res.message || "Login failed.", "error");
    setErrors({ general: res.message });
  };

  const inp = (field) => ({
    value: form[field],
    onChange: (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: undefined, general: undefined }));
    },
  });

  const inputWrap = (err) => ({
    display: "flex",
    alignItems: "center",
    background: c2,
    border: `1px solid ${err ? "#ef4444" : border}`,
    borderRadius: 12,
    overflow: "hidden",
  });

  const inputStyle = {
    flex: 1,
    background: "transparent",
    border: "none",
    padding: "12px",
    color: "#fff",
    fontSize: 13,
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    color: "#888",
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 6,
    letterSpacing: 0.5,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <p
              style={{
                color: G,
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: 5,
                fontFamily: "Georgia, serif",
                margin: 0,
              }}
            >
              SHARMA
            </p>
            <p
              style={{
                color: "#555",
                fontSize: 9,
                letterSpacing: 5,
                margin: "3px 0 0",
              }}
            >
              WATCH STORE
            </p>
          </Link>
        </div>

        <div
          style={{
            background: card,
            border: `1px solid ${border}`,
            borderRadius: 24,
            padding: "36px 32px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <h2
              style={{
                color: "#fff",
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 6px",
                fontFamily: "Georgia, serif",
              }}
            >
              Welcome Back
            </h2>
            <p style={{ color: "#666", fontSize: 13, margin: 0 }}>
              Sign in to your account
            </p>
          </div>

          {errors.general && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10,
                padding: "11px 14px",
                marginBottom: 18,
              }}
            >
              <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>
                {errors.general}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Email */}
            <div>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <div style={inputWrap(errors.email)}>
                <FiMail size={15} color="#555" style={{ marginLeft: 14 }} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...inp("email")}
                  style={inputStyle}
                />
              </div>
              {errors.email && (
                <p style={{ color: "#ef4444", fontSize: 11, marginTop: 5 }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  PASSWORD
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    color: G,
                    fontSize: 12,
                    textDecoration: "none",
                  }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div style={inputWrap(errors.password)}>
                <FiLock size={15} color="#555" style={{ marginLeft: 14 }} />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Your password"
                  autoComplete="current-password"
                  {...inp("password")}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#555",
                    padding: "0 14px",
                    cursor: "pointer",
                  }}
                >
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: "#ef4444", fontSize: 11, marginTop: 5 }}>
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: G,
                color: "#000",
                border: "none",
                padding: "13px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 15px rgba(212,175,55,0.2)",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "2px solid rgba(0,0,0,0.3)",
                      borderTopColor: "#000",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              color: "#555",
              fontSize: 13,
              marginTop: 20,
              marginBottom: 0,
            }}
          >
            Don't have an account?{" "}
            <Link to="/register" style={{ color: G }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #1a1a1a inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>
    </div>
  );
}

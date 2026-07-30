import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaText, setCaptchaText] = useState(generateCaptcha());

  function generateCaptcha() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const handleLogin = () => {
    if (!userId || !password || captcha !== captchaText) {
      alert("Invalid credentials or incorrect captcha!");
      return;
    }
    login(role);
    setTimeout(() => {
      if (role === "admin") navigate("/admin");
      else if (role === "student") navigate("/home");
    }, 0);
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🧠</div>
          <span className="login-logo-text">ELM Quiz</span>
        </div>

        {!role ? (
          <>
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">Select your role to continue</p>
            <div className="role-grid">
              <button className="role-btn" onClick={() => setRole("admin")}>
                <span className="role-icon">🛡️</span>
                Admin
              </button>
              <button className="role-btn" onClick={() => setRole("student")}>
                <span className="role-icon">🎓</span>
                Student
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="login-title">
              {role === "admin" ? "Admin Login" : "Student Login"}
            </h1>
            <p className="login-subtitle">Enter your credentials to access the platform</p>

            <div className="login-form">
              <div className="form-group">
                <label className="form-label">User ID</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Enter your user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Verify Captcha</label>
                <div className="captcha-box">
                  <span className="captcha-text">{captchaText}</span>
                </div>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Type the captcha above"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  style={{ marginTop: "8px" }}
                />
              </div>

              <button className="login-btn" onClick={handleLogin}>
                Sign In →
              </button>

              <button className="back-link" onClick={() => setRole(null)}>
                ← Choose a different role
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;

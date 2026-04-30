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

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleLogin = () => {
    if (!userId || !password || captcha !== captchaText) {
      alert("Invalid credentials or incorrect captcha!");
      return;
    }

    login(role);

    setTimeout(() => {
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "student") {
        navigate("/home");
      }
    }, 0);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {!role ? (
        <div className="role-selection">
          <button onClick={() => handleRoleSelection("admin")} className="role-btn">Login as Admin</button>
          <button onClick={() => handleRoleSelection("student")} className="role-btn">Login as Student</button>
        </div>
      ) : (
        <div className="login-form">
          <h3>{role === "admin" ? "Admin Login" : "Student Login"}</h3>
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p>Captcha: <strong>{captchaText}</strong></p>
          <input
            type="text"
            placeholder="Enter Captcha"
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
          />
          <button onClick={handleLogin} className="login-btn">Login</button>
        </div>
      )}
    </div>
  );
};

export default Login;

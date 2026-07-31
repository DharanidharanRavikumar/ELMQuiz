import React, { useState } from "react";
import "../styles/PersonalDetails.css";

const PersonalDetails = ({ onSubmit }) => {
  const [details, setDetails] = useState({
    name: "", rollNumber: "", gender: "",
    isFirstGraduate: "", hsPercentage: "", futureIdea: "",
  });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case "name":
        if (!/^[a-zA-Z\s]+$/.test(value)) newErrors[name] = "Name must contain only letters and spaces.";
        else delete newErrors[name];
        break;
      case "rollNumber":
        if (!/^\d{2,3}[a-zA-Z]{2,2}\d{2,3}$/.test(value)) newErrors[name] = "Invalid Roll Number";
        else delete newErrors[name];
        break;
      case "hsPercentage":
        if (value < 0 || value > 100) newErrors[name] = "Percentage must be between 0 and 100.";
        else delete newErrors[name];
        break;
      case "futureIdea":
        if (value.length < 5) newErrors[name] = "Ambition must be at least 5 characters long.";
        else delete newErrors[name];
        break;
      default: break;
    }
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails({ ...details, [name]: value });
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length === 0) onSubmit(details);
    else alert("Please fix the errors before submitting.");
  };

  const fields = [
    { label: "Full Name", name: "name", type: "text", placeholder: "Enter your full name", icon: "" },
    { label: "Roll Number", name: "rollNumber", type: "text", placeholder: "e.g. 21CS045", icon: "" },
    { label: "12th Grade Percentage", name: "hsPercentage", type: "number", placeholder: "e.g. 87.5", icon: "" },
    { label: "Future Ambition", name: "futureIdea", type: "text", placeholder: "What do you aspire to become?", icon: "" },
  ];

  return (
    <div className="pd-page">
      <div className="pd-bg-orb pd-bg-orb-1" />
      <div className="pd-bg-orb pd-bg-orb-2" />

      <div className="pd-container">
        <div className="pd-header">
          <div className="pd-step-badge">Step 1 of 2</div>
          <h1 className="pd-title">Personal Details</h1>
          <p className="pd-subtitle">This information will appear on your assessment report</p>
        </div>

        <form className="pd-form" onSubmit={handleSubmit}>
          {fields.map(({ label, name, type, placeholder, icon }) => (
            <div className="pd-field" key={name}>
              <label className="pd-label">
                <span className="pd-label-icon">{icon}</span>
                {label}
              </label>
              <input
                className={`pd-input ${errors[name] ? "pd-input-error" : ""}`}
                type={type}
                name={name}
                value={details[name]}
                onChange={handleChange}
                placeholder={placeholder}
                required
              />
              {errors[name] && <p className="pd-error">{errors[name]}</p>}
            </div>
          ))}

          <div className="pd-field">
            <label className="pd-label"><span className="pd-label-icon">⚧</span>Gender</label>
            <select className="pd-input pd-select" name="gender" value={details.gender} onChange={handleChange} required>
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="pd-field">
            <label className="pd-label"><span className="pd-label-icon">🎓</span>First Generation Graduate?</label>
            <div className="pd-toggle-group">
              {["true", "false"].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`pd-toggle-btn ${details.isFirstGraduate === val ? "active" : ""}`}
                  onClick={() => setDetails({ ...details, isFirstGraduate: val })}
                >
                  {val === "true" ? "Yes, I am" : "No, I'm not"}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="pd-submit">
            Continue to Quiz →
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonalDetails;

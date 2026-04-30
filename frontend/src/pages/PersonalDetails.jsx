
import React, { useState } from "react";

const PersonalDetails = ({ onSubmit }) => {
  const [details, setDetails] = useState({
    name: "",
    rollNumber: "",
    gender: "",
    isFirstGraduate: "",
    hsPercentage: "",
    futureIdea: "",
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case "name":
        if (!/^[a-zA-Z\s]+$/.test(value)) {
          newErrors[name] = "Name must contain only letters and spaces.";
        } else {
          delete newErrors[name];
        }
        break;
      case "rollNumber":
        if (!/^\d{2,3}[a-zA-Z]{2,2}\d{2,3}$/.test(value)) {
          newErrors[name] = "Invalid Roll Number";
        } else {
          delete newErrors[name];
        }
        break;
      case "hsPercentage":
        if (value < 0 || value > 100) {
          newErrors[name] = "Percentage must be between 0 and 100.";
        } else {
          delete newErrors[name];
        }
        break;
      case "futureIdea":
        if (value.length < 5) {
          newErrors[name] = "Ambition must be at least 5 characters long.";
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
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
    if (Object.keys(errors).length === 0) {
      onSubmit(details);
    } else {
      alert("Please fix the errors before submitting.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f5f5, #eeeeee)", // 5th light gray applied
        fontFamily: "'Arial', sans-serif",
      }}
    >
      <div
        style={{
          padding: "20px",
          maxWidth: "500px",
          width: "100%",
          background: "rgba(245, 245, 245, 0.5)", // Adjusted light gray for transparency
          borderRadius: "15px",
          boxShadow: "0 8px 32px rgba(128, 128, 128, 0.2)", // Softer shadow
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(192, 192, 192, 0.3)", // Light gray border
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            textAlign: "center",
            color: "#555", // Soft gray for text
          }}
        >
          Personal Details
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <label style={{ color: "#555" }}>
            Name:
            <input
              type="text"
              name="name"
              value={details.name}
              onChange={handleChange}
              style={{
                padding: "10px",
                width: "100%",
                marginTop: "5px",
                borderRadius: "8px",
                border: "1px solid rgba(192, 192, 192, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                color: "#555",
              }}
              required
            />
            {errors.name && <p style={{ color: "#d32f2f" }}>{errors.name}</p>}
          </label>
          <label style={{ color: "#555" }}>
            Roll Number:
            <input
              type="text"
              name="rollNumber"
              value={details.rollNumber}
              onChange={handleChange}
              style={{
                padding: "10px",
                width: "100%",
                marginTop: "5px",
                borderRadius: "8px",
                border: "1px solid rgba(192, 192, 192, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                color: "#555",
              }}
              required
            />
            {errors.rollNumber && (
              <p style={{ color: "#d32f2f" }}>{errors.rollNumber}</p>
            )}
          </label>
          <label style={{ color: "#555" }}>
            Gender:
            <select
              name="gender"
              value={details.gender}
              onChange={handleChange}
              style={{
                padding: "10px",
                width: "100%",
                marginTop: "5px",
                borderRadius: "8px",
                border: "1px solid rgba(192, 192, 192, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                color: "#555",
              }}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label style={{ color: "#555" }}>
            Are you a first-generation graduate?
            <select
              name="isFirstGraduate"
              value={details.isFirstGraduate}
              onChange={handleChange}
              style={{
                padding: "10px",
                width: "100%",
                marginTop: "5px",
                borderRadius: "8px",
                border: "1px solid rgba(192, 192, 192, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                color: "#555",
              }}
              required
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label style={{ color: "#555" }}>
            12th Grade Percentage:
            <input
              type="number"
              name="hsPercentage"
              value={details.hsPercentage}
              onChange={handleChange}
              style={{
                padding: "10px",
                width: "100%",
                marginTop: "5px",
                borderRadius: "8px",
                border: "1px solid rgba(192, 192, 192, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                color: "#555",
              }}
              required
            />
            {errors.hsPercentage && (
              <p style={{ color: "#d32f2f" }}>{errors.hsPercentage}</p>
            )}
          </label>
          <label style={{ color: "#555" }}>
            Ambition:
            <input
              type="text"
              name="futureIdea"
              value={details.futureIdea}
              onChange={handleChange}
              style={{
                padding: "10px",
                width: "100%",
                marginTop: "5px",
                borderRadius: "8px",
                border: "1px solid rgba(192, 192, 192, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                color: "#555",
              }}
              required
            />
            {errors.futureIdea && (
              <p style={{ color: "#d32f2f" }}>{errors.futureIdea}</p>
            )}
          </label>
          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Start Quiz
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonalDetails;

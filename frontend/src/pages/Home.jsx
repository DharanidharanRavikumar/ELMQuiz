
import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const startQuiz = () => {
    navigate("/gender-selection");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>PSYCHIATRIC ASSESSMENT TEST</h1>
      <p>
        This quiz will assess your knowledge of different concepts. Please provide
        your details before proceeding.
      </p>
      <button
        onClick={startQuiz}
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Start Quiz
      </button>
    </div>
  );
};

export default Home;

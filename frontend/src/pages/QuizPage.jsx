import React, { useContext, useState } from "react";
import { QuizContext } from "../contexts/QuizContext";

const QuizPage = () => {
  const {
    questions,
    currentQuestion,
    handleAnswer,
    moveToNextQuestion,
    moveToPreviousQuestion,
    responses,
  } = useContext(QuizContext);

  const [submissionStatus, setSubmissionStatus] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (score, part, index) => {
    setSelectedOption(index);
    handleAnswer(score, part);
  };

  const submitQuizResults = async () => {
    try {
      const personalDetails = JSON.parse(localStorage.getItem("personalDetails"));

      const formattedResponses = {
        part1: responses.part1 || [],
        part2: responses.part2 || [],
        part3: responses.part3 || [],
        part4: responses.part4 || [],
        part5: responses.part5 || [],
        part6: responses.part6 || [],
      };

      if (formattedResponses.part6.length > 24) {
        formattedResponses.part6 = formattedResponses.part6.slice(0, 24);
      }

      const payload = {
        name: personalDetails.name,
        rollNumber: personalDetails.rollNumber,
        gender: personalDetails.gender,
        isFirstGraduate: personalDetails.isFirstGraduate === "true",
        hsPercentage: Number(personalDetails.hsPercentage),
        futureIdea: personalDetails.futureIdea,
        responses: formattedResponses,
      };

      const response = await fetch("http://localhost:3000/api/report/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmissionStatus("Quiz submitted successfully!");
      } else {
        setSubmissionStatus("Failed to submit quiz. Please try again.");
      }
    } catch (error) {
      setSubmissionStatus("Error submitting quiz. Check your internet connection.");
      console.error("Submission error:", error);
    }
  };

  const questionData = questions[currentQuestion];

  return (
    <div style={{ padding: "20px", fontFamily: "'Arial', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px" }}>
        <p style={{ fontSize: "24px", fontWeight: "bold", color: "#4CAF50", backgroundColor: "#F0F0F0", padding: "10px 20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
          Question {currentQuestion + 1} / {questions.length}
        </p>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>{questionData.question}</h2>
      <ul style={{ listStyleType: "none", padding: 0, maxWidth: "500px", margin: "0 auto" }}>
        {questionData.options.map((option, index) => (
          <li key={index} style={{ marginBottom: "10px" }}>
            <button
              style={{
                padding: "10px 15px",
                width: "100%",
                textAlign: "left",
                backgroundColor: selectedOption === index ? "#007BFF" : "#FFFFFF",
                color: selectedOption === index ? "#FFFFFF" : "#007BFF",
                border: selectedOption === index ? "2px solid #0056b3" : "1px solid #007BFF",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                transition: "background-color 0.3s ease, color 0.3s ease, border 0.3s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
              onClick={() => handleOptionClick(option.score, questionData.part, index)}
            >
              {option.text}
            </button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: currentQuestion === 0 ? "#cccccc" : "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: currentQuestion === 0 ? "not-allowed" : "pointer",
          }}
          onClick={moveToPreviousQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        {currentQuestion < questions.length - 1 ? (
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedOption(null);
              moveToNextQuestion();
            }}
          >
            Next
          </button>
        ) : (
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#FF5722",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={submitQuizResults}
          >
            Submit
          </button>
        )}
      </div>

      {submissionStatus && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#FFEB3B",
            color: "#000",
            borderRadius: "5px",
            fontSize: "18px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {submissionStatus}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
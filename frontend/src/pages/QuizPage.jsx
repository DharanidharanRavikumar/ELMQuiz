import React, { useContext, useState } from "react";
import { QuizContext } from "../contexts/QuizContext";
import "../styles/QuizPage.css";

const QuizPage = () => {
  const {
    questions, currentQuestion, handleAnswer,
    moveToNextQuestion, moveToPreviousQuestion, responses,
  } = useContext(QuizContext);

  const [submissionStatus, setSubmissionStatus] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionClick = (score, part, index) => {
    setSelectedOption(index);
    handleAnswer(score, part);
  };

  const submitQuizResults = async () => {
    setIsSubmitting(true);
    try {
      const personalDetails = JSON.parse(localStorage.getItem("personalDetails"));
      const formattedResponses = {
        part1: responses.part1 || [], part2: responses.part2 || [],
        part3: responses.part3 || [], part4: responses.part4 || [],
        part5: responses.part5 || [], part6: responses.part6 || [],
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/report/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) setSubmissionStatus("success");
      else setSubmissionStatus("error");
    } catch (error) {
      setSubmissionStatus("error");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (submissionStatus === "success") {
    const personalDetails = JSON.parse(localStorage.getItem("personalDetails") || "{}");

    return (
      <div className="quiz-page">
        <div className="quiz-success">
          <h2 className="quiz-success-title">Assessment Complete!</h2>
          <p className="quiz-success-desc">
            Thank you, {personalDetails.name || "there"}. Your responses have been submitted
            and your report has been generated.
          </p>

          <div className="quiz-success-card">
            <p className="quiz-success-card-label">Your Report Reference</p>
            <p className="quiz-success-card-value">{personalDetails.rollNumber || "—"}</p>
            <p className="quiz-success-card-note">
              You can retrieve and download your PDF report yourself using your name or
              roll number.
            </p>
          </div>

          <div className="quiz-success-actions">
            <button
              className="quiz-success-btn"
              onClick={() => { window.location.href = "/my-report"; }}
            >
              View My Report →
            </button>
            <button
              className="quiz-success-btn-secondary"
              onClick={() => { window.location.href = "/login"; }}
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="quiz-progress-info">
            <span className="quiz-progress-label">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="quiz-progress-pct">{Math.round(progress)}%</span>
          </div>
          <div className="quiz-progress-track">
            <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="quiz-part-tag">Part {questionData.part}</div>
        </div>

        <div className="quiz-question-card">
          <h2 className="quiz-question-text">{questionData.question}</h2>

          <div className="quiz-options">
            {questionData.options.map((option, index) => (
              <button
                key={index}
                className={`quiz-option ${selectedOption === index ? "selected" : ""}`}
                onClick={() => handleOptionClick(option.score, questionData.part, index)}
              >
                <span className="quiz-option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="quiz-option-text">{option.text}</span>
                {selectedOption === index && <span className="quiz-option-check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-nav">
          <button
            className={`quiz-nav-btn ${currentQuestion === 0 ? "disabled" : ""}`}
            onClick={moveToPreviousQuestion}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button
              className="quiz-nav-btn quiz-nav-next"
              onClick={() => { setSelectedOption(null); moveToNextQuestion(); }}
            >
              Next →
            </button>
          ) : (
            <button
              className={`quiz-nav-btn quiz-nav-submit ${isSubmitting ? "loading" : ""}`}
              onClick={submitQuizResults}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Assessment ✓"}
            </button>
          )}
        </div>

        {submissionStatus === "error" && (
          <div className="quiz-error-msg">
            Failed to submit. Please check your connection and try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
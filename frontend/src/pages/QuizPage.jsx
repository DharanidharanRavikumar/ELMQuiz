import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QuizContext } from "../contexts/QuizContext";
import "../styles/QuizPage.css";

const QuizPage = () => {
  const navigate = useNavigate();
  const {
    questions, currentQuestion, handleAnswer,
    moveToNextQuestion, moveToPreviousQuestion, responses,
  } = useContext(QuizContext);

  const [submissionStatus, setSubmissionStatus] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storedName = JSON.parse(localStorage.getItem("personalDetails") || "{}").name || "there";
  const questionData = questions[currentQuestion];

  // Restore the previously chosen option (if this question was already answered)
  useEffect(() => {
    const savedScore = responses[questionData.id];
    if (savedScore !== undefined) {
      const matchIndex = questionData.options.findIndex((opt) => opt.score === savedScore);
      setSelectedOption(matchIndex !== -1 ? matchIndex : null);
    } else {
      setSelectedOption(null);
    }
  }, [currentQuestion]);

  const handleOptionClick = (score, index) => {
    setSelectedOption(index);
    handleAnswer(questionData.id, score);
    setTimeout(() => {
      moveToNextQuestion();
    }, 350);
  };

  const submitQuizResults = async () => {
    setIsSubmitting(true);
    try {
      const personalDetails = JSON.parse(localStorage.getItem("personalDetails"));

      // Rebuild per-part score arrays from the id-keyed responses, in original question order
      const formattedResponses = { part1: [], part2: [], part3: [], part4: [], part5: [], part6: [] };
      questions.forEach((q) => {
        const partKey = q.part;
        if (formattedResponses[partKey] && responses[q.id] !== undefined) {
          formattedResponses[partKey].push(responses[q.id]);
        }
      });

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

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const partNumber = questionData.part.replace(/[^0-9]/g, "");
  const isCurrentAnswered = responses[questionData.id] !== undefined;

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
            <button className="quiz-success-btn" onClick={() => navigate("/my-report")}>
              View My Report →
            </button>
            <button className="quiz-success-btn-secondary" onClick={() => navigate("/login")}>
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
          <div className="quiz-header-row">
            <div className="quiz-part-tag">Part {partNumber}</div>
            <div className={`quiz-status-tag ${isCurrentAnswered ? "answered" : "unanswered"}`}>
              {isCurrentAnswered ? "✓ Answered" : "Not answered yet"}
            </div>
          </div>
        </div>

        {isSubmitting && (
          <div className="quiz-waiting-msg">
            <span className="quiz-spinner" />
            Hang tight, {storedName} — this demo runs on a free hosting tier, so the
            server can take up to 40 seconds to wake up. Your report is being generated now.
          </div>
        )}

        <div className="quiz-question-card">
          <h2 className="quiz-question-text">{questionData.question}</h2>

          <div className="quiz-options">
            {questionData.options.map((option, index) => (
              <button
                key={index}
                className={`quiz-option ${selectedOption === index ? "selected" : ""}`}
                onClick={() => handleOptionClick(option.score, index)}
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
            <button className="quiz-nav-btn quiz-nav-next" onClick={moveToNextQuestion}>
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
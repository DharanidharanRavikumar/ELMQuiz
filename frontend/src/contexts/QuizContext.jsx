import React, { createContext, useState } from "react";
import questions from "../data/questions.json";

export const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});

 const handleAnswer = (points, part) => {
  setResponses((prev) => {
    const updatedPart = prev[part] ? [...prev[part], points] : [points];
    return {
      ...prev,
      [part]: updatedPart,
    };
  });
  };

  const moveToNextQuestion = () => {
    setCurrentQuestion((prev) => (prev < questions.length - 1 ? prev + 1 : prev));
  };

  const moveToPreviousQuestion = () => {
    setCurrentQuestion((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <QuizContext.Provider
      value={{
        questions,
        currentQuestion,
        handleAnswer,
        moveToNextQuestion,
        moveToPreviousQuestion,
        responses,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};